<?php
/**
 * Tipo de conteúdo das aulas e taxonomia das trilhas.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registra o CPT `aula` e a taxonomia `trilha`.
 *
 * Os slugs ficam em português porque são dados: vão para o banco
 * (`post_type`, `taxonomy`) e para o schema do GraphQL (`aula`, `trilhas`),
 * como os CPTs Instrutor e Depoimento. Renomear depois exige migração.
 *
 * A aula é `public` só porque o WPGraphQL trata como privado todo post de um
 * tipo não público para quem não tem `edit_posts` — ou seja, para todos os
 * jogadores. Quem restringe de verdade é `Access`. O WordPress não publica
 * página nem arquivo (`publicly_queryable` falso, sem rewrite): o site é o
 * Next.
 */
final class Content {

	public const POST_TYPE = 'aula';

	public const TAXONOMY = 'trilha';

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'init', array( self::class, 'register' ) );

		// Aula não tem página no WordPress; no sitemap seria um link quebrado.
		add_filter( 'wp_sitemaps_post_types', array( self::class, 'drop_from_core_sitemap' ) );
		add_filter( 'wpseo_sitemap_exclude_post_type', array( self::class, 'drop_from_yoast_sitemap' ), 10, 2 );
		add_filter( 'wpseo_sitemap_exclude_taxonomy', array( self::class, 'drop_from_yoast_sitemap' ), 10, 2 );
	}

	/**
	 * Declara o tipo e a taxonomia.
	 */
	public static function register(): void {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => array(
					'name'               => __( 'Aulas', 'prime-poker' ),
					'singular_name'      => __( 'Aula', 'prime-poker' ),
					'add_new_item'       => __( 'Adicionar aula', 'prime-poker' ),
					'edit_item'          => __( 'Editar aula', 'prime-poker' ),
					'new_item'           => __( 'Nova aula', 'prime-poker' ),
					'view_item'          => __( 'Ver aula', 'prime-poker' ),
					'search_items'       => __( 'Buscar aulas', 'prime-poker' ),
					'not_found'          => __( 'Nenhuma aula encontrada.', 'prime-poker' ),
					'not_found_in_trash' => __( 'Nenhuma aula na lixeira.', 'prime-poker' ),
					'all_items'          => __( 'Todas as aulas', 'prime-poker' ),
					'menu_name'          => __( 'Aulas', 'prime-poker' ),
				),
				'public'              => true,
				'publicly_queryable'  => false,
				'exclude_from_search' => true,
				'show_in_nav_menus'   => false,
				'has_archive'         => false,
				'rewrite'             => false,
				'query_var'           => false,
				'show_in_rest'        => true, // Editor de blocos.
				'menu_icon'           => 'dashicons-video-alt3',
				'menu_position'       => 6,
				// Comentários são as dúvidas da aula (etapa 9).
				'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt', 'comments', 'revisions' ),
				'taxonomies'          => array( self::TAXONOMY ),
				'show_in_graphql'     => true,
				'graphql_single_name' => 'aula',
				'graphql_plural_name' => 'aulas',
			)
		);

		register_taxonomy(
			self::TAXONOMY,
			array( self::POST_TYPE ),
			array(
				'labels'              => array(
					'name'          => __( 'Trilhas', 'prime-poker' ),
					'singular_name' => __( 'Trilha', 'prime-poker' ),
					'add_new_item'  => __( 'Adicionar trilha', 'prime-poker' ),
					'edit_item'     => __( 'Editar trilha', 'prime-poker' ),
					'search_items'  => __( 'Buscar trilhas', 'prime-poker' ),
					'not_found'     => __( 'Nenhuma trilha encontrada.', 'prime-poker' ),
					'menu_name'     => __( 'Trilhas', 'prime-poker' ),
				),
				// Uma aula pertence a uma trilha: hierárquica dá o seletor em
				// caixas no editor, em vez do campo de tags livres.
				'hierarchical'        => true,
				'public'              => true,
				'publicly_queryable'  => false,
				'rewrite'             => false,
				'query_var'           => false,
				'show_admin_column'   => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'trilha',
				'graphql_plural_name' => 'trilhas',
			)
		);
	}

	/**
	 * Tira a aula do sitemap nativo do WordPress.
	 *
	 * @param array<string, \WP_Post_Type> $post_types Tipos no sitemap.
	 * @return array<string, \WP_Post_Type>
	 */
	public static function drop_from_core_sitemap( array $post_types ): array {
		unset( $post_types[ self::POST_TYPE ] );

		return $post_types;
	}

	/**
	 * Tira a aula e a trilha do sitemap do Yoast.
	 *
	 * @param bool   $excluded Se já estava excluído.
	 * @param string $name     Slug do tipo ou da taxonomia.
	 */
	public static function drop_from_yoast_sitemap( $excluded, $name ): bool {
		return (bool) $excluded || self::POST_TYPE === $name || self::TAXONOMY === $name;
	}
}
