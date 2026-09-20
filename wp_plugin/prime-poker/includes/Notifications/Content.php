<?php
/**
 * Notificações da área do jogador: quem recebe o quê e o que já foi lido.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Notifications;

use PrimePoker\Players\Tiers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A caixa de notificações de cada jogador.
 *
 * Cada notificação é um post do CPT `notificacao` (registrado pelo JSON do
 * ACF em `wp_plugin/acf/`). O CPT fica **fora do GraphQL**: o front lê pelo
 * tipo próprio deste módulo, que já aplica o público-alvo. Publicar um aviso
 * e ele aparecer para quem não devia seria o erro mais fácil de cometer aqui.
 *
 * Público-alvo (decisão de 20/09/2026):
 *
 * - **Jogador escolhido** — vale só para ele, e o tier é ignorado; é o recado
 *   individual.
 * - **Tier mínimo** — todo jogador daquele tier para cima, pela capability
 *   acumulada, nunca pelo nome da role.
 * - **Nenhum dos dois** — todos os jogadores.
 *
 * O que já foi lido mora em user meta, não no post: a mesma notificação é
 * lida por um jogador e não por outro.
 */
final class Content {

	public const POST_TYPE = 'notificacao';

	/** Metas gravadas pelo ACF — o `name` de cada campo em `notificationFields`. */
	public const META_TYPE         = 'type';
	public const META_DESCRIPTION  = 'description';
	public const META_LINK         = 'link';
	public const META_MINIMUM_TIER = 'minimum_tier';
	public const META_USER         = 'user';

	/** IDs de notificação que o jogador já leu. */
	public const META_READ = '_prime_poker_read_notifications';

	/** Os três tipos desta primeira versão. */
	public const TYPES = array( 'aula', 'aviso', 'suporte' );

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_filter( 'wp_sitemaps_post_types', array( self::class, 'hide_from_sitemap' ) );
	}

	/**
	 * Fora do sitemap do WordPress.
	 *
	 * Notificação não é página: não tem endereço público nem deve ser
	 * rastreada.
	 *
	 * @param array<string, \WP_Post_Type> $post_types Tipos no sitemap.
	 * @return array<string, \WP_Post_Type>
	 */
	public static function hide_from_sitemap( $post_types ): array {
		unset( $post_types[ self::POST_TYPE ] );

		return is_array( $post_types ) ? $post_types : array();
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Criação                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Cria uma notificação.
	 *
	 * Usada pelos gatilhos automáticos (aula publicada, dúvida respondida);
	 * o aviso da equipe nasce pelo painel, como qualquer post.
	 *
	 * @param array{
	 *     type: string,
	 *     title: string,
	 *     description: string,
	 *     link?: string,
	 *     minimum_tier?: string,
	 *     user?: int
	 * } $data Dados da notificação.
	 * @return int ID criado, ou 0 se não deu.
	 */
	public static function create( array $data ): int {
		$type = in_array( $data['type'] ?? '', self::TYPES, true ) ? $data['type'] : 'aviso';

		$post_id = wp_insert_post(
			array(
				'post_type'   => self::POST_TYPE,
				'post_status' => 'publish',
				'post_title'  => wp_strip_all_tags( (string) $data['title'] ),
			),
			true
		);

		if ( is_wp_error( $post_id ) || ! is_int( $post_id ) ) {
			return 0;
		}

		update_post_meta( $post_id, self::META_TYPE, $type );
		update_post_meta( $post_id, self::META_DESCRIPTION, wp_strip_all_tags( (string) $data['description'] ) );
		update_post_meta( $post_id, self::META_LINK, (string) ( $data['link'] ?? '' ) );
		update_post_meta( $post_id, self::META_MINIMUM_TIER, (string) ( $data['minimum_tier'] ?? '' ) );
		update_post_meta( $post_id, self::META_USER, (int) ( $data['user'] ?? 0 ) ?: '' );

		return $post_id;
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Leitura                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * As notificações de um jogador, da mais recente para a mais antiga.
	 *
	 * @param int    $user_id ID do jogador.
	 * @param string $filter  `todas`, `nao-lidas` ou `lidas`.
	 * @param int    $limit   Quantas trazer; 0 traz todas.
	 * @param int    $offset  Quantas pular.
	 * @return array<int, \WP_Post>
	 */
	public static function for_user( int $user_id, string $filter = 'todas', int $limit = 0, int $offset = 0 ): array {
		$args = self::query_args( $user_id, $filter );

		$args['posts_per_page'] = $limit > 0 ? $limit : -1;
		$args['offset']         = max( 0, $offset );

		return ( new \WP_Query( $args ) )->posts;
	}

	/**
	 * Quantas o jogador ainda não leu.
	 *
	 * @param int $user_id ID do jogador.
	 */
	public static function unread_count( int $user_id ): int {
		$args = self::query_args( $user_id, 'nao-lidas' );

		$args['posts_per_page'] = 1;
		$args['fields']         = 'ids';
		$args['no_found_rows']  = false;

		return (int) ( new \WP_Query( $args ) )->found_posts;
	}

	/**
	 * Argumentos da consulta, já com o público-alvo e o filtro de leitura.
	 *
	 * @param int    $user_id ID do jogador.
	 * @param string $filter  `todas`, `nao-lidas` ou `lidas`.
	 * @return array<string, mixed>
	 */
	private static function query_args( int $user_id, string $filter ): array {
		$args = array(
			'post_type'      => self::POST_TYPE,
			'post_status'    => 'publish',
			'orderby'        => 'date',
			'order'          => 'DESC',
			'no_found_rows'  => true,
			'posts_per_page' => -1,
			'meta_query'     => self::audience( $user_id ),
		);

		$read = self::read_ids( $user_id );

		if ( 'nao-lidas' === $filter && array() !== $read ) {
			$args['post__not_in'] = $read;
		}

		if ( 'lidas' === $filter ) {
			// Sem nenhuma lida, `post__in` vazio traria TUDO: o 0 garante
			// uma lista vazia, que é a resposta certa.
			$args['post__in'] = array() === $read ? array( 0 ) : $read;
		}

		return $args;
	}

	/**
	 * A regra de quem recebe, em `meta_query`.
	 *
	 * Ou a notificação é endereçada a este jogador, ou não é endereçada a
	 * ninguém e o tier dele alcança o mínimo pedido.
	 *
	 * @param int $user_id ID do jogador.
	 * @return array<int|string, mixed>
	 */
	private static function audience( int $user_id ): array {
		$no_target = array(
			'relation' => 'OR',
			array(
				'key'     => self::META_USER,
				'compare' => 'NOT EXISTS',
			),
			array(
				'key'     => self::META_USER,
				'value'   => '',
				'compare' => '=',
			),
			array(
				'key'     => self::META_USER,
				'value'   => '0',
				'compare' => '=',
			),
		);

		$tier_ok = array(
			'relation' => 'OR',
			array(
				'key'     => self::META_MINIMUM_TIER,
				'compare' => 'NOT EXISTS',
			),
			array(
				'key'     => self::META_MINIMUM_TIER,
				'value'   => '',
				'compare' => '=',
			),
			array(
				'key'     => self::META_MINIMUM_TIER,
				'value'   => self::tiers_for( $user_id ),
				'compare' => 'IN',
			),
		);

		return array(
			'relation' => 'OR',
			array(
				'key'     => self::META_USER,
				'value'   => (string) $user_id,
				'compare' => '=',
			),
			array(
				'relation' => 'AND',
				$no_target,
				$tier_ok,
			),
		);
	}

	/**
	 * Os tiers que este jogador alcança.
	 *
	 * Por capability, não por nome de role: quem é Gold alcança também os
	 * avisos de Free e Basic, porque as capabilities são acumuladas. A equipe
	 * alcança todos, para conferir o que publicou.
	 *
	 * @param int $user_id ID do jogador.
	 * @return array<int, string>
	 */
	private static function tiers_for( int $user_id ): array {
		$slugs = Tiers::slugs();

		if ( user_can( $user_id, 'edit_posts' ) ) {
			return $slugs;
		}

		$reachable = array();

		foreach ( $slugs as $slug ) {
			$capability = Tiers::content_capability( $slug );

			if ( null !== $capability && user_can( $user_id, $capability ) ) {
				$reachable[] = $slug;
			}
		}

		// Nunca vazio: um `IN` com lista vazia casa com tudo no WP_Meta_Query.
		return array() === $reachable ? array( '__nenhum__' ) : $reachable;
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Leitura                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * IDs que o jogador já leu.
	 *
	 * @param int $user_id ID do jogador.
	 * @return array<int, int>
	 */
	public static function read_ids( int $user_id ): array {
		$stored = $user_id > 0 ? get_user_meta( $user_id, self::META_READ, true ) : '';

		if ( ! is_array( $stored ) ) {
			return array();
		}

		return array_values( array_unique( array_filter( array_map( 'intval', $stored ) ) ) );
	}

	/**
	 * Marca ou desmarca uma notificação como lida.
	 *
	 * @param int  $user_id         ID do jogador.
	 * @param int  $notification_id ID da notificação.
	 * @param bool $read            Lida ou não.
	 */
	public static function mark( int $user_id, int $notification_id, bool $read ): void {
		$ids = self::read_ids( $user_id );

		$ids = $read
			? array_merge( $ids, array( $notification_id ) )
			: array_diff( $ids, array( $notification_id ) );

		self::save_read( $user_id, $ids );
	}

	/**
	 * Marca tudo o que o jogador vê como lido.
	 *
	 * Só o que ele vê: marcar o acervo inteiro encheria a meta com avisos que
	 * nem são dele.
	 *
	 * @param int $user_id ID do jogador.
	 */
	public static function mark_all( int $user_id ): void {
		$visible = array_map(
			static fn( \WP_Post $post ): int => $post->ID,
			self::for_user( $user_id )
		);

		self::save_read( $user_id, array_merge( self::read_ids( $user_id ), $visible ) );
	}

	/**
	 * Grava a lista de lidas.
	 *
	 * @param int              $user_id ID do jogador.
	 * @param array<int, int>  $ids     IDs lidos.
	 */
	private static function save_read( int $user_id, array $ids ): void {
		if ( $user_id <= 0 ) {
			return;
		}

		$ids = array_values( array_unique( array_filter( array_map( 'intval', $ids ) ) ) );

		if ( array() === $ids ) {
			delete_user_meta( $user_id, self::META_READ );

			return;
		}

		update_user_meta( $user_id, self::META_READ, $ids );
	}
}
