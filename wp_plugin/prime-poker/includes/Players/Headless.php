<?php
/**
 * Jogadores não entram no wp-admin.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mantém o painel fora do alcance dos jogadores.
 *
 * O site é headless: a interface do jogador é o front em Next.js. Sem isto um
 * jogador que descubra a URL do admin cai numa tela de WordPress cru — que não
 * quebra nada, mas não é o produto.
 */
final class Headless {

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'admin_init', array( self::class, 'block_admin' ) );
		add_filter( 'show_admin_bar', array( self::class, 'hide_admin_bar' ) );
	}

	/**
	 * Redireciona jogadores que tentem abrir o painel.
	 */
	public static function block_admin(): void {
		// O admin-ajax.php também passa pelo `admin_init`: bloquear ali
		// derrubaria requisições legítimas de qualquer plugin.
		if ( wp_doing_ajax() ) {
			return;
		}

		if ( ! self::is_player_only() ) {
			return;
		}

		/**
		 * Para onde mandar o jogador que tentou abrir o painel.
		 *
		 * O padrão é a home do WordPress, que não exige configuração. Para
		 * apontar ao front, devolva a URL dele aqui — lembrando de somar o host
		 * a `allowed_redirect_hosts`, senão o `wp_safe_redirect()` o recusa.
		 *
		 * @param string $url URL de destino.
		 */
		$destino = (string) apply_filters( 'prime_players_admin_redirect_url', home_url( '/' ) );

		wp_safe_redirect( $destino );
		exit;
	}

	/**
	 * Esconde a barra de administração para jogadores.
	 *
	 * @param bool $show Se a barra seria exibida.
	 */
	public static function hide_admin_bar( $show ) {
		return self::is_player_only() ? false : $show;
	}

	/**
	 * É jogador e SOMENTE jogador?
	 *
	 * Quem também faz parte da equipe (editor, administrador) continua com
	 * acesso normal ao painel, mesmo tendo um tier.
	 */
	private static function is_player_only(): bool {
		if ( ! is_user_logged_in() ) {
			return false;
		}

		return current_user_can( Tiers::CAP_PLAYER_AREA ) && ! current_user_can( 'edit_posts' );
	}
}
