<?php
/**
 * E-mail de boas-vindas no cadastro pelo front.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

use PrimePoker\Front;
use PrimePoker\Mail\Layout;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dá as boas-vindas a quem se cadastra pelo site.
 *
 * O envio fica para o FIM da requisição, por dois motivos:
 *
 * - `prime_player_registered` dispara antes de o WPGraphQL gravar nome e
 *   senha (ver Signup): um e-mail enviado ali sairia sem o nome da pessoa;
 * - enviar e-mail é lento. Com `fastcgi_finish_request()` a resposta da
 *   mutation vai ao front antes do envio, e o cadastro não fica esperando o
 *   SMTP — o mesmo motivo pelo qual os e-mails padrão do WP foram suprimidos.
 *
 * Só atinge cadastros pelo front: quem é criado pelo painel continua com a
 * notificação normal do WordPress.
 */
final class Welcome {

	/**
	 * Usuários cadastrados nesta requisição.
	 *
	 * @var array<int, int>
	 */
	private static array $pending = array();

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'prime_player_registered', array( self::class, 'queue' ) );

		// Prioridade alta: depois da revalidação de cache (10), que não deve
		// esperar o `fastcgi_finish_request` para sair.
		add_action( 'shutdown', array( self::class, 'dispatch' ), 100 );
	}

	/**
	 * Agenda o envio para o fim da requisição.
	 *
	 * @param int $user_id ID do usuário.
	 */
	public static function queue( $user_id ): void {
		self::$pending[] = (int) $user_id;
	}

	/**
	 * Envia os e-mails agendados.
	 */
	public static function dispatch(): void {
		if ( array() === self::$pending ) {
			return;
		}

		/**
		 * Enviar o e-mail de boas-vindas?
		 *
		 * @param bool $send_email Padrão: true.
		 */
		if ( ! apply_filters( 'prime_players_send_welcome_email', true ) ) {
			return;
		}

		// A URL do front vem do cabeçalho desta requisição: resolver antes de
		// encerrar a resposta, enquanto ainda estamos nela.
		$front = Front::url();

		if ( function_exists( 'fastcgi_finish_request' ) ) {
			fastcgi_finish_request();
		}

		foreach ( array_unique( self::$pending ) as $user_id ) {
			// Recarrega: o nome foi gravado depois do `prime_player_registered`.
			clean_user_cache( $user_id );

			$user = get_userdata( $user_id );

			// A mutation pode ter falhado depois de criar o usuário (e o
			// WPGraphQL tê-lo removido): sem conta, sem boas-vindas.
			if ( ! $user instanceof \WP_User || '' === (string) $user->user_email ) {
				continue;
			}

			self::send( $user, $front );
		}

		self::$pending = array();
	}

	/**
	 * Monta e envia o e-mail.
	 *
	 * @param \WP_User    $user  Usuário.
	 * @param string|null $front Endereço do front, se configurado.
	 */
	private static function send( \WP_User $user, ?string $front ): void {
		$site = Layout::site_name();

		$html = Layout::render(
			array(
				/* translators: %s: nome do site. */
				'title'     => sprintf( __( 'Boas-vindas ao %s', 'prime-poker' ), $site ),
				'greeting'   => Layout::greeting( $user ),
				'paragraphs' => array(
					__( 'Sua conta foi criada. A partir de agora você acessa a área do jogador com o seu e-mail e a senha que escolheu no cadastro.', 'prime-poker' ),
					sprintf(
						/* translators: %s: nome do tier (ex.: Player Free). */
						__( 'Você começa como %s. Explore as aulas liberadas e acompanhe as novidades do time por lá.', 'prime-poker' ),
						Tiers::label( Membership::get_tier( $user->ID ) ?? Tiers::FREE )
					),
				),
				'button'      => null === $front ? null : array(
					'text' => __( 'Acessar a área do jogador', 'prime-poker' ),
					'url'   => $front . '/login/',
				),
				'notes'      => array(
					sprintf(
						/* translators: %s: e-mail da conta. */
						__( 'Este e-mail foi enviado para %s porque uma conta foi criada com ele no nosso site. Se não foi você, ignore esta mensagem.', 'prime-poker' ),
						$user->user_email
					),
				),
			)
		);

		Layout::send(
			$user->user_email,
			/* translators: %s: nome do site. */
			sprintf( __( 'Boas-vindas ao %s!', 'prime-poker' ), $site ),
			$html
		);
	}
}
