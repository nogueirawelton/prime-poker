<?php
/**
 * Vídeos hospedados no Bunny Stream.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Link assinado do player do Bunny Stream.
 *
 * Com o "Embed view token authentication" ligado na biblioteca, o player só
 * abre com `token` + `expires` válidos. O token é gerado aqui, e só para quem
 * pode assistir (ver `GraphQL::video`): quem não tem o tier nunca recebe um
 * link que funcione, e um link repassado para fora morre em `TTL`.
 *
 * Configuração no `wp-config.php` (a chave NUNCA vai para o front nem para o
 * banco, onde um backup ou um plugin de options a exporia):
 *
 *     define( 'PRIME_POKER_BUNNY_LIBRARY_ID', '123456' );
 *     define( 'PRIME_POKER_BUNNY_TOKEN_KEY', '…' ); // Security → Token authentication key
 *
 * @link https://docs.bunny.net/stream/token-authentication
 */
final class Bunny {

	public const PROVIDER = 'bunny';

	/**
	 * Validade do link.
	 *
	 * O token é conferido quando o player abre, então basta cobrir o tempo
	 * entre a página carregar e o jogador dar o play — com folga para uma aba
	 * esquecida aberta.
	 */
	private const TTL = 6 * HOUR_IN_SECONDS;

	private const EMBED_BASE = 'https://iframe.mediadelivery.net/embed/';

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'admin_notices', array( self::class, 'missing_config_notice' ) );
	}

	/**
	 * Avisa, nas telas de aulas, quando o `wp-config.php` não está completo.
	 *
	 * Sem a biblioteca nenhum vídeo toca; sem a chave os vídeos tocam, mas
	 * sem proteção. Nenhum dos dois dá erro visível em outro lugar.
	 */
	public static function missing_config_notice(): void {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

		if ( ! $screen || Content::POST_TYPE !== $screen->post_type || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$problem = null;

		if ( null === self::library_id() ) {
			$problem = __( 'falta <code>PRIME_POKER_BUNNY_LIBRARY_ID</code> no <code>wp-config.php</code>: nenhum vídeo vai tocar no site.', 'prime-poker' );
		} elseif ( ! defined( 'PRIME_POKER_BUNNY_TOKEN_KEY' ) || '' === (string) constant( 'PRIME_POKER_BUNNY_TOKEN_KEY' ) ) {
			$problem = __( 'falta <code>PRIME_POKER_BUNNY_TOKEN_KEY</code> no <code>wp-config.php</code>: os links dos vídeos saem sem proteção.', 'prime-poker' );
		}

		if ( null !== $problem ) {
			printf(
				'<div class="notice notice-warning"><p><strong>%s</strong> %s</p></div>',
				esc_html__( 'Bunny Stream:', 'prime-poker' ),
				wp_kses( $problem, array( 'code' => array() ) )
			);
		}
	}

	/**
	 * ID do vídeo a partir do que foi colado no painel.
	 *
	 * O Bunny mostra o ID (um GUID) na tela do vídeo, mas quem cadastra
	 * costuma copiar o link do player: aceitar os dois evita um erro que só
	 * apareceria na hora de tocar.
	 *
	 * @param string $value GUID ou link (`…/embed/<biblioteca>/<guid>`, `…/play/…`).
	 */
	public static function video_id( string $value ): ?string {
		$guid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

		if ( preg_match( "#^({$guid})$#i", trim( $value ), $match ) ) {
			return strtolower( $match[1] );
		}

		if ( preg_match( "#/(?:embed|play)/\\d+/({$guid})#i", $value, $match ) ) {
			return strtolower( $match[1] );
		}

		return null;
	}

	/**
	 * Biblioteca configurada, ou null.
	 */
	public static function library_id(): ?string {
		$id = defined( 'PRIME_POKER_BUNNY_LIBRARY_ID' ) ? (string) constant( 'PRIME_POKER_BUNNY_LIBRARY_ID' ) : '';

		return preg_match( '/^\d+$/', $id ) ? $id : null;
	}

	/**
	 * Link do player, assinado quando há chave.
	 *
	 * Sem a chave o link sai sem token — funciona só se a autenticação por
	 * token estiver DESLIGADA no Bunny, e aí qualquer um com o link assiste.
	 * Serve para desenvolver; em produção as duas constantes são obrigatórias
	 * (o painel avisa quando falta alguma — ver `missing_config_notice`).
	 *
	 * @param string $video_id GUID do vídeo.
	 * @param int    $now      Timestamp atual (injetável nos testes).
	 */
	public static function embed_url( string $video_id, int $now ): ?string {
		$library = self::library_id();

		if ( null === $library ) {
			return null;
		}

		$url = self::EMBED_BASE . $library . '/' . rawurlencode( $video_id );
		$key = defined( 'PRIME_POKER_BUNNY_TOKEN_KEY' ) ? (string) constant( 'PRIME_POKER_BUNNY_TOKEN_KEY' ) : '';

		if ( '' === $key ) {
			return $url;
		}

		$expires = $now + self::TTL;

		return $url . '?' . http_build_query(
			array(
				'token'   => hash( 'sha256', $key . $video_id . $expires ),
				'expires' => $expires,
			)
		);
	}
}
