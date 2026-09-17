<?php
/**
 * Ajustes do cadastro público feito via WPGraphQL.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Adapta o cadastro nativo do WordPress ao fluxo headless.
 *
 * O `registerUser` do WPGraphQL não cria o usuário por conta própria: ele
 * delega ao `register_new_user()` do núcleo, escrito para o formulário do
 * wp-login.php. A sequência real é esta:
 *
 *   1. `wp_create_user()` com uma senha ALEATÓRIA → dispara `user_register`,
 *      onde Registration atribui o tier inicial;
 *   2. o núcleo grava o aviso `default_password_nag`;
 *   3. `register_new_user` dispara e o WP envia dois e-mails: um ao admin e um
 *      ao usuário, com link para "definir sua senha";
 *   4. só então o WPGraphQL chama `wp_update_user()` aplicando nome, sobrenome
 *      e a senha que a pessoa realmente escolheu.
 *
 * Os passos 2 e 3 fazem sentido para quem se cadastrou sem senha pelo painel,
 * mas não para o nosso formulário, onde a pessoa acabou de escolher a dela.
 *
 * O passo 4 vem DEPOIS do `user_register`, e o WPGraphQL remove a role dos
 * dados antes de chamar o `wp_update_user()` — por isso o tier atribuído no
 * passo 1 sobrevive intacto.
 */
final class Signup {

	/**
	 * ID do usuário sendo criado pelo cadastro via GraphQL.
	 *
	 * Só fica preenchido durante a requisição da mutation, para que a
	 * supressão do e-mail atinja exclusivamente este fluxo — um usuário criado
	 * pelo painel continua recebendo a notificação normal do WordPress.
	 */
	private static ?int $registrando = null;

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		// Prioridade 5: o `wp_send_new_user_notifications` do núcleo está em
		// 10 e precisa encontrar a flag já preenchida.
		add_action( 'register_new_user', array( self::class, 'on_register' ), 5 );

		// Os dois filtros têm a mesma assinatura ( $send, $user ), então um
		// handler só atende ambos.
		add_filter( 'wp_send_new_user_notification_to_user', array( self::class, 'suppress_signup_emails' ), 10, 2 );
		add_filter( 'wp_send_new_user_notification_to_admin', array( self::class, 'suppress_signup_emails' ), 10, 2 );
		add_action( 'login_init', array( self::class, 'redirect_signup_form' ) );
	}

	/**
	 * Marca o cadastro em andamento e limpa o aviso de senha.
	 *
	 * @param int $user_id ID do usuário recém-criado.
	 */
	public static function on_register( int $user_id ): void {
		// O núcleo marca todo cadastro com "troque sua senha", pensado para
		// quem recebeu uma senha gerada. Aqui a pessoa escolheu a dela.
		delete_user_meta( $user_id, 'default_password_nag' );

		if ( ! function_exists( 'is_graphql_request' ) || ! is_graphql_request() ) {
			return;
		}

		self::$registrando = $user_id;

		/**
		 * Disparado quando um jogador se cadastra pelo front.
		 *
		 * Ponto de entrada para um e-mail de boas-vindas próprio, já que as
		 * notificações padrão do WordPress são suprimidas logo abaixo.
		 *
		 * Atenção: neste momento a senha definitiva ainda NÃO foi gravada (o
		 * WPGraphQL aplica depois), então não dependa dela aqui.
		 *
		 * @param int $user_id ID do usuário.
		 */
		do_action( 'prime_player_registered', $user_id );
	}

	/**
	 * Impede QUALQUER e-mail automático no cadastro pelo front.
	 *
	 * Vale para os dois destinatários que o WordPress notificaria: o jogador
	 * (com um link para "definir sua senha" que ele acabou de escolher) e o
	 * administrador. No lugar do e-mail do jogador sai o de boas-vindas próprio
	 * (ver Welcome), enviado depois da resposta.
	 *
	 * Efeito colateral bem-vindo: os dois envios eram SÍNCRONOS e respondiam
	 * por quase todo o tempo da mutation — o cadastro passa de ~10s para ~1s.
	 *
	 * Só atinge o cadastro em curso via GraphQL: um usuário criado pelo painel
	 * continua recebendo as notificações normais do WordPress.
	 *
	 * @param bool     $send Se o WordPress enviaria o e-mail.
	 * @param \WP_User $user Usuário destinatário.
	 */
	public static function suppress_signup_emails( $send, $user ) {
		if ( ! $user instanceof \WP_User || self::$registrando !== (int) $user->ID ) {
			return $send;
		}

		/**
		 * Suprimir os e-mails padrão do WordPress no cadastro via front?
		 *
		 * @param bool $suprimir Padrão: true.
		 * @param int  $user_id  ID do usuário.
		 */
		return apply_filters( 'prime_players_suppress_signup_emails', true, (int) $user->ID )
			? false
			: $send;
	}

	/**
	 * Manda o formulário de cadastro do wp-login.php para o front.
	 *
	 * O `registerUser` exige a option `users_can_register` ligada — o WPGraphQL
	 * lê `get_option()` direto, sem filtro para contornar. Ligar essa option
	 * também publica o formulário nativo em `wp-login.php?action=register`, uma
	 * segunda porta de entrada com outro visual e alvo fácil de spam.
	 *
	 * O destino é a tela de login do próprio WordPress, e não o formulário do
	 * front, porque um destino em outro domínio exigiria configurar a URL do
	 * front e autorizá-la em `allowed_redirect_hosts` — o `wp_safe_redirect()`
	 * recusa hosts externos. Fechar a porta não depende disso; quem quiser
	 * levar a pessoa ao front usa o filtro abaixo.
	 */
	public static function redirect_signup_form(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- leitura de rota, sem efeito colateral.
		$action = isset( $_GET['action'] ) ? sanitize_key( wp_unslash( $_GET['action'] ) ) : '';

		if ( 'register' !== $action ) {
			return;
		}

		/**
		 * Para onde mandar quem abrir o formulário de cadastro do WordPress.
		 *
		 * Para apontar ao front, devolva a URL dele aqui e some o host a
		 * `allowed_redirect_hosts`.
		 *
		 * @param string $url URL de destino.
		 */
		$destino = (string) apply_filters( 'prime_players_signup_redirect_url', wp_login_url() );

		wp_safe_redirect( $destino );
		exit;
	}
}
