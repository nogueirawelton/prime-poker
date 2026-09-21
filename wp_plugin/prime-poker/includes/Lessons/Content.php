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
 * O CPT `aula` e a taxonomia `trilha`, do ponto de vista do código.
 *
 * O REGISTRO é do ACF (`wp_plugin/acf/aulas.json`, importado em
 * ACF → Ferramentas), como os outros CPTs do site. Aqui ficam só os slugs,
 * que o resto do plugin usa, e o que o ACF não configura.
 *
 * Os slugs ficam em português porque são dados: vão para o banco
 * (`post_type`, `taxonomy`) e para o schema do GraphQL (`aula`, `trilhas`).
 * Renomear depois exige migração.
 *
 * No JSON a aula é `public` só porque o WPGraphQL trata como privado todo
 * post de um tipo não público para quem não tem `edit_posts` — ou seja, para
 * todos os jogadores. Quem restringe de verdade é `Access`. O WordPress não
 * publica página nem arquivo (`publicly_queryable` falso, sem permalink): o
 * site é o Next.
 */
final class Content {

	public const POST_TYPE = 'aula';

	public const TAXONOMY = 'trilha';

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		// Aula não tem página no WordPress; no sitemap seria um link quebrado.
		add_filter( 'wp_sitemaps_post_types', array( self::class, 'drop_from_core_sitemap' ) );
		add_filter( 'wpseo_sitemap_exclude_post_type', array( self::class, 'drop_from_yoast_sitemap' ), 10, 2 );
		add_filter( 'wpseo_sitemap_exclude_taxonomy', array( self::class, 'drop_from_yoast_sitemap' ), 10, 2 );

		add_filter( 'wp_insert_post_data', array( self::class, 'slug_from_title' ), 10, 2 );
	}

	/**
	 * Troca o slug numérico (o ID) por um tirado do título.
	 *
	 * Aula publicada antes de ter título ganha o ID como slug, e o painel não
	 * mostra o campo de slug (a aula não tem página no WordPress) — ele ficaria
	 * assim para sempre. Além de feio na URL do site, slug numérico não é
	 * encontrado pelo `aula(idType: SLUG)` do WPGraphQL: a aula dá 404.
	 *
	 * Vale ao salvar; uma aula que já está assim se corrige ao ser atualizada.
	 *
	 * @param array<string, mixed> $data    Dados que vão para o banco.
	 * @param array<string, mixed> $postarr Dados recebidos.
	 * @return array<string, mixed>
	 */
	public static function slug_from_title( array $data, array $postarr ): array {
		$id    = (int) ( $postarr['ID'] ?? 0 );
		$title = trim( (string) ( $data['post_title'] ?? '' ) );
		$slug  = (string) ( $data['post_name'] ?? '' );

		if ( self::POST_TYPE !== ( $data['post_type'] ?? '' ) || '' === $title || $id <= 0 || (string) $id !== $slug ) {
			return $data;
		}

		$data['post_name'] = wp_unique_post_slug(
			sanitize_title( $title ),
			$id,
			(string) $data['post_status'],
			self::POST_TYPE,
			(int) ( $data['post_parent'] ?? 0 )
		);

		return $data;
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
