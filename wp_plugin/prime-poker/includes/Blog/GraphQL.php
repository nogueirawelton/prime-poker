<?php
/**
 * Campos do blog que faltam no WPGraphQL.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Blog;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Paginação numerada e contagens para a listagem do blog.
 *
 * O WPGraphQL só oferece paginação por cursor, que sabe avançar mas não sabe
 * saltar: não há como pedir "a página 7" nem descobrir quantas páginas
 * existem. Sem isso o front era obrigado a baixar o acervo inteiro e paginar
 * em memória — o que funciona com dezenas de posts e deixa de funcionar com
 * centenas.
 *
 * São três acréscimos, todos finos:
 *
 * - `where: { offset }` nas conexões de posts, para saltar direto à página;
 * - `postsTotal`, para saber quantas páginas existem;
 * - `postCount` em `Category`, porque o `count` nativo conta todos os post
 *   types e aqui a mesma taxonomia é usada pelos membros do time.
 */
final class GraphQL {

	/**
	 * Conexões que recebem o argumento `offset`.
	 *
	 * A listagem e a busca saem da conexão raiz; as páginas de categoria usam
	 * a mesma, filtrando por `categoryName`.
	 */
	private const WHERE_ARGS_TYPES = array(
		'RootQueryToPostConnectionWhereArgs',
	);

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'graphql_register_types', array( self::class, 'register' ) );
		add_filter( 'graphql_connection_query_args', array( self::class, 'apply_offset' ), 10, 3 );
	}

	/**
	 * Declara os campos.
	 */
	public static function register(): void {
		foreach ( self::WHERE_ARGS_TYPES as $tipo ) {
			register_graphql_field(
				$tipo,
				'offset',
				array(
					'type'        => 'Int',
					'description' => __( 'Quantos posts pular antes de começar a listar. Permite paginação numerada.', 'prime-poker' ),
				)
			);
		}

		register_graphql_field(
			'RootQuery',
			'postsTotal',
			array(
				'type'        => 'Int',
				'description' => __( 'Total de posts publicados, opcionalmente filtrados por busca e categoria.', 'prime-poker' ),
				'args'        => array(
					'search'       => array( 'type' => 'String' ),
					'categoryName' => array( 'type' => 'String' ),
				),
				'resolve'     => static fn( $root, array $args ): int => self::contar(
					isset( $args['search'] ) ? (string) $args['search'] : '',
					isset( $args['categoryName'] ) ? (string) $args['categoryName'] : ''
				),
			)
		);

		register_graphql_field(
			'Category',
			'postCount',
			array(
				'type'        => 'Int',
				'description' => __( 'Posts publicados nesta categoria. Diferente de `count`, ignora outros post types.', 'prime-poker' ),
				'resolve'     => static function ( $category ): int {
					$slug = $category->slug ?? '';

					return '' === $slug ? 0 : self::contar( '', (string) $slug );
				},
			)
		);
	}

	/**
	 * Aplica o `offset` à WP_Query da conexão.
	 *
	 * @param array<string, mixed> $query_args      Argumentos da WP_Query.
	 * @param mixed                $resolver        Resolver da conexão.
	 * @param array<string, mixed> $unfiltered_args Argumentos crus do GraphQL.
	 * @return array<string, mixed>
	 */
	public static function apply_offset( array $query_args, $resolver, $unfiltered_args = array() ): array {
		$offset = $unfiltered_args['where']['offset'] ?? null;

		if ( ! is_numeric( $offset ) || (int) $offset <= 0 ) {
			return $query_args;
		}

		$query_args['offset'] = (int) $offset;

		// O `offset` da WP_Query é ignorado quando `paged` está definido, e a
		// listagem de sticky no topo desalinharia a contagem entre páginas.
		unset( $query_args['paged'] );
		$query_args['ignore_sticky_posts'] = true;

		return $query_args;
	}

	/**
	 * Conta posts publicados.
	 *
	 * `fields => ids` e `posts_per_page => 1` mantêm a consulta barata: só
	 * interessa o `found_posts`, que o WordPress calcula de qualquer forma.
	 *
	 * @param string $search   Termo de busca, ou string vazia.
	 * @param string $category Slug da categoria, ou string vazia.
	 */
	private static function contar( string $search, string $category ): int {
		$args = array(
			'post_type'           => 'post',
			'post_status'         => 'publish',
			'posts_per_page'      => 1,
			'fields'              => 'ids',
			'ignore_sticky_posts' => true,
			'no_found_rows'       => false,
		);

		// Só define quando há valor: um `s` vazio faz o WordPress montar uma
		// busca por string vazia em vez de listar tudo.
		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		if ( '' !== $category ) {
			$args['category_name'] = $category;
		}

		return (int) ( new \WP_Query( $args ) )->found_posts;
	}
}
