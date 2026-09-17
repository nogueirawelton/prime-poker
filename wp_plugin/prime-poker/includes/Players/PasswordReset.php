<?php
/**
 * Redefinição de senha pelo front.
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
 * E-mail de redefinição com link para o site, e sessões encerradas na troca.
 *
 * O `sendPasswordResetEmail` do WPGraphQL monta o e-mail com os mesmos filtros
 * do núcleo (`retrieve_password_title` / `retrieve_password_message`), então
 * um único ajuste cobre o front, o "Perdeu a senha?" do wp-login.php e o
 * "Enviar redefinição de senha" da lista de usuários.
 */
final class PasswordReset {

	/** Caminho da página de redefinição no front. */
	private const PATH = '/redefinir-senha/';

	/** Meta do plugin JWT com o segredo do usuário. */
	private const JWT_SECRET_META = 'graphql_jwt_auth_secret';

	/**
	 * HTML montado nesta requisição, para o `wp_mail` reconhecer o e-mail.
	 */
	private static ?string $html = null;

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_filter( 'retrieve_password_title', array( self::class, 'title' ), 10, 3 );
		add_filter( 'retrieve_password_message', array( self::class, 'message' ), 10, 4 );
		add_filter( 'wp_mail', array( self::class, 'as_html' ) );

		add_action( 'after_password_reset', array( self::class, 'end_sessions' ) );
		add_action( 'profile_update', array( self::class, 'end_sessions_on_password_change' ), 10, 3 );
		add_filter( 'graphql_jwt_auth_validate_token', array( self::class, 'check_user_secret' ) );
	}

	/* ---------------------------------------------------------------------- */
	/*                                 E-mail                                 */
	/* ---------------------------------------------------------------------- */

	/**
	 * Assunto.
	 *
	 * @param string $title Assunto padrão.
	 */
	public static function title( $title ): string {
		return sprintf(
			/* translators: %s: nome do site. */
			__( 'Redefinição de senha — %s', 'prime-poker' ),
			Layout::site_name()
		);
	}

	/**
	 * Corpo em HTML, com o link para o front.
	 *
	 * Sem endereço do front configurado, mantém a mensagem padrão: um link
	 * para o wp-login.php ainda funciona, um link para lugar nenhum não.
	 *
	 * @param string   $message    Mensagem padrão.
	 * @param string   $key        Chave de redefinição.
	 * @param string   $user_login Login do usuário.
	 * @param \WP_User $user       Usuário.
	 */
	public static function message( $message, $key, $user_login, $user ): string {
		$front = Front::url();

		if ( null === $front || ! $user instanceof \WP_User ) {
			return (string) $message;
		}

		$link = add_query_arg(
			array(
				'key'   => $key,
				'login' => rawurlencode( $user_login ),
			),
			$front . self::PATH
		);

		$hours = (int) round( (int) apply_filters( 'password_reset_expiration', DAY_IN_SECONDS ) / HOUR_IN_SECONDS );

		self::$html = Layout::render(
			array(
				'title'       => __( 'Redefinir sua senha', 'prime-poker' ),
				'greeting'     => Layout::greeting( $user ),
				'paragraphs'   => array(
					sprintf(
						/* translators: %s: e-mail da conta. */
						__( 'Recebemos um pedido para redefinir a senha da conta %s. Clique no botão abaixo para criar uma nova senha.', 'prime-poker' ),
						$user->user_email
					),
				),
				'button'        => array(
					'text' => __( 'Criar nova senha', 'prime-poker' ),
					'url'   => $link,
				),
				'notes'        => array(
					sprintf(
						/* translators: %d: horas de validade do link. */
						_n( 'O link vale por %d hora e só pode ser usado uma vez.', 'O link vale por %d horas e só pode ser usado uma vez.', $hours, 'prime-poker' ),
						$hours
					),
					__( 'Se você não pediu a redefinição, ignore este e-mail: sua senha continua a mesma.', 'prime-poker' ),
				),
				'fallback_link' => true,
			)
		);

		return self::$html;
	}

	/**
	 * Marca como HTML só o e-mail montado acima.
	 *
	 * Pelo filtro do `wp_mail`, e não pelo `wp_mail_content_type` global:
	 * este não sabe qual e-mail está saindo e transformaria em HTML qualquer
	 * outro enviado na mesma requisição.
	 *
	 * @param array<string, mixed> $args Argumentos do `wp_mail`.
	 * @return array<string, mixed>
	 */
	public static function as_html( array $args ): array {
		if ( null === self::$html || ( $args['message'] ?? null ) !== self::$html ) {
			return $args;
		}

		self::$html = null;

		$headers   = (array) ( $args['headers'] ?? array() );
		$headers[] = 'Content-Type: text/html; charset=UTF-8';

		$args['headers'] = $headers;

		return $args;
	}

	/* ---------------------------------------------------------------------- */
	/*                                Sessões                                 */
	/* ---------------------------------------------------------------------- */

	/**
	 * Senha redefinida: derruba as sessões abertas.
	 *
	 * Quem pede redefinição muitas vezes suspeita que a conta foi acessada por
	 * outra pessoa. Trocar o segredo JWT do usuário invalida todo refresh token
	 * já emitido; o access token em uso ainda vale até expirar (1 hora).
	 *
	 * @param \WP_User $user Usuário.
	 */
	public static function end_sessions( $user ): void {
		if ( $user instanceof \WP_User ) {
			self::rotate_secret( $user->ID );
		}
	}

	/**
	 * Troca de senha pelo painel (perfil ou edição de usuário).
	 *
	 * @param int      $user_id       ID do usuário.
	 * @param \WP_User $old_user_data Estado anterior.
	 * @param array    $userdata      Dados gravados.
	 */
	public static function end_sessions_on_password_change( $user_id, $old_user_data, $userdata = array() ): void {
		if ( ! $old_user_data instanceof \WP_User ) {
			return;
		}

		// `$userdata` traz o hash gravado (WP 5.8+); o `get_userdata` cobre
		// versões anteriores.
		$new_hash = $userdata['user_pass'] ?? get_userdata( (int) $user_id )->user_pass ?? '';

		if ( '' !== $new_hash && $new_hash !== $old_user_data->user_pass ) {
			self::rotate_secret( (int) $user_id );
		}
	}

	/**
	 * Gera um segredo novo para o usuário.
	 *
	 * Mesmo formato do plugin JWT (`uniqid`), gravado na mesma meta. Não mexe
	 * em quem teve o segredo revogado: o plugin trata isso como bloqueio.
	 */
	private static function rotate_secret( int $user_id ): void {
		if ( get_user_meta( $user_id, 'graphql_jwt_auth_secret_revoked', true ) ) {
			return;
		}

		update_user_meta( $user_id, self::JWT_SECRET_META, uniqid( 'graphql_jwt_', true ) );
	}

	/**
	 * Recusa refresh token emitido com um segredo antigo.
	 *
	 * O plugin JWT grava o segredo do usuário dentro do refresh token, mas na
	 * validação só confere se o segredo foi REVOGADO — nunca se ainda é o
	 * atual. Sem esta checagem, trocar o segredo não derrubaria sessão
	 * nenhuma.
	 *
	 * @param object|\WP_Error $token Token decodificado.
	 * @return object|\WP_Error
	 */
	public static function check_user_secret( $token ) {
		if ( ! is_object( $token ) || ! isset( $token->data->user->user_secret, $token->data->user->id ) ) {
			return $token;
		}

		$current = (string) get_user_meta( (int) $token->data->user->id, self::JWT_SECRET_META, true );

		if ( '' === $current || ! hash_equals( $current, (string) $token->data->user->user_secret ) ) {
			return new \WP_Error(
				'invalid-jwt',
				__( 'Sessão encerrada. Entre novamente.', 'prime-poker' )
			);
		}

		return $token;
	}
}
