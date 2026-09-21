<?php
/**
 * Contador de visualizações das aulas.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Visualizações por aula, guardadas em meta.
 *
 * Alimenta o "N visualizações" da aula e a ordem "Mais assistidas".
 *
 * Um jogador conta uma vez por aula a cada `WINDOW`: recarregar a página ou
 * voltar à aula no mesmo dia não infla o número.
 */
final class Views {

	public const META = '_prime_poker_views';

	/** Intervalo mínimo entre duas contagens do mesmo jogador na mesma aula. */
	private const WINDOW = 12 * HOUR_IN_SECONDS;

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'wp_after_insert_post', array( self::class, 'ensure_meta' ), 10, 2 );
	}

	/**
	 * Toda aula nasce com 0.
	 *
	 * A ordenação por meta deixa de fora quem não tem a meta: sem isto, uma
	 * aula nova sumiria da listagem "Mais assistidas" até ganhar a primeira
	 * visualização.
	 *
	 * @param int      $post_id ID do post.
	 * @param \WP_Post $post    Post salvo.
	 */
	public static function ensure_meta( int $post_id, $post ): void {
		if ( ! $post instanceof \WP_Post || Content::POST_TYPE !== $post->post_type || wp_is_post_revision( $post_id ) ) {
			return;
		}

		if ( ! metadata_exists( 'post', $post_id, self::META ) ) {
			update_post_meta( $post_id, self::META, 0 );
		}
	}

	/**
	 * Visualizações da aula.
	 *
	 * @param int $post_id ID da aula.
	 */
	public static function count( int $post_id ): int {
		return max( 0, (int) get_post_meta( $post_id, self::META, true ) );
	}

	/**
	 * Registra a visualização do usuário logado.
	 *
	 * @param int $post_id ID da aula.
	 * @param int $user_id ID do jogador.
	 * @return int O total depois da contagem.
	 */
	public static function register( int $post_id, int $user_id ): int {
		$key = "prime_poker_view_{$user_id}_{$post_id}";

		if ( false !== get_transient( $key ) ) {
			return self::count( $post_id );
		}

		set_transient( $key, 1, self::WINDOW );

		$total = self::count( $post_id ) + 1;
		update_post_meta( $post_id, self::META, $total );

		return $total;
	}
}
