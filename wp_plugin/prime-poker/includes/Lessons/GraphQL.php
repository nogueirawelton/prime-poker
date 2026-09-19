<?php
/**
 * Aulas no WPGraphQL: filtros, contagem e conteúdo protegido.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

use PrimePoker\Players\Tiers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * O que a listagem e a página da aula precisam além do que o WPGraphQL dá.
 *
 * - `where` de `aulas`: `offset`, `track`, `instructor`, `from`/`to` e
 *   `sort` — a listagem pagina por número e filtra no servidor, como o blog.
 * - `lessonsTotal`: total do mesmo filtro, para saber se há mais páginas.
 * - Na `Aula`: `canWatch`, `minimumTier`, `duration`, `viewCount`, e o conteúdo
 *   protegido `video` e `materials`, que só saem para quem pode assistir.
 * - Mutation `registerLessonView`.
 *
 * O vídeo, os materiais e o tier mínimo ficam FORA do GraphQL do ACF (ver o
 * JSON em `wp_plugin/acf/`): se saíssem por lá, qualquer jogador leria o
 * vídeo de qualquer aula, e o gate daqui seria só decorativo.
 */
final class GraphQL {

	/** Metas gravadas pelo ACF — o `name` de cada campo em `lessonFields`. */
	private const META_INSTRUCTOR     = 'instructor';
	private const META_DURATION       = 'duration';
	private const META_VIDEO_PROVIDER = 'video_provider';
	private const META_VIDEO_ID       = 'video_id';
	private const META_MATERIALS      = 'materials';

	/** Provedor assumido quando o campo está vazio. */
	private const DEFAULT_PROVIDER = 'google_drive';

	/**
	 * Ordens da listagem → `orderby` da WP_Query.
	 *
	 * A chave de meta, quando existe, vira uma cláusula nomeada `sort`.
	 */
	private const SORTS = array(
		'NEWEST'      => array( 'meta' => null, 'order' => 'DESC', 'description' => 'Mais recentes primeiro.' ),
		'OLDEST'      => array( 'meta' => null, 'order' => 'ASC', 'description' => 'Mais antigas primeiro.' ),
		'MOST_VIEWED' => array( 'meta' => Views::META, 'order' => 'DESC', 'description' => 'Mais visualizadas primeiro.' ),
		'SHORTEST'    => array( 'meta' => self::META_DURATION, 'order' => 'ASC', 'description' => 'Menor duração primeiro.' ),
		'LONGEST'     => array( 'meta' => self::META_DURATION, 'order' => 'DESC', 'description' => 'Maior duração primeiro.' ),
	);

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'graphql_register_types', array( self::class, 'register' ) );
		add_filter( 'graphql_connection_query_args', array( self::class, 'filter_query' ), 20, 3 );
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Schema                                 */
	/* ---------------------------------------------------------------------- */

	/**
	 * Declara tipos, campos e a mutation.
	 */
	public static function register(): void {
		$sorts = array();

		foreach ( self::SORTS as $name => $sort ) {
			$sorts[ $name ] = array(
				'value'       => $name,
				'description' => $sort['description'],
			);
		}

		register_graphql_enum_type(
			'LessonSortEnum',
			array(
				'description' => __( 'Ordem da listagem de aulas.', 'prime-poker' ),
				'values'      => $sorts,
			)
		);

		foreach ( self::filter_fields() as $name => $field ) {
			register_graphql_field( 'RootQueryToAulaConnectionWhereArgs', $name, $field );
		}

		register_graphql_field(
			'RootQueryToAulaConnectionWhereArgs',
			'offset',
			array(
				'type'        => 'Int',
				'description' => __( 'Quantas aulas pular antes de começar a listar. Permite paginação numerada.', 'prime-poker' ),
			)
		);

		register_graphql_field(
			'RootQueryToAulaConnectionWhereArgs',
			'sort',
			array(
				'type'        => 'LessonSortEnum',
				'description' => __( 'Ordem da listagem. Padrão: NEWEST.', 'prime-poker' ),
			)
		);

		register_graphql_field(
			'RootQuery',
			'lessonsTotal',
			array(
				'type'        => 'Int',
				'description' => __( 'Total de aulas publicadas com os mesmos filtros da listagem. 0 para quem não é jogador.', 'prime-poker' ),
				'args'        => array_merge(
					array( 'search' => array( 'type' => 'String' ) ),
					self::filter_fields()
				),
				'resolve'     => static fn( $root, array $args ): int => self::count_lessons( $args ),
			)
		);

		self::register_lesson_fields();
		self::register_view_mutation();
	}

	/**
	 * Filtros comuns à listagem e à contagem.
	 *
	 * @return array<string, array<string, string>>
	 */
	private static function filter_fields(): array {
		return array(
			'track'      => array(
				'type'        => 'String',
				'description' => __( 'Slug da trilha.', 'prime-poker' ),
			),
			'instructor' => array(
				'type'        => 'Int',
				'description' => __( 'databaseId do Instrutor.', 'prime-poker' ),
			),
			'from'       => array(
				'type'        => 'String',
				'description' => __( 'Publicadas a partir deste dia (AAAA-MM-DD), inclusive.', 'prime-poker' ),
			),
			'to'         => array(
				'type'        => 'String',
				'description' => __( 'Publicadas até este dia (AAAA-MM-DD), inclusive.', 'prime-poker' ),
			),
		);
	}

	/**
	 * Campos acrescentados ao tipo `Aula`.
	 */
	private static function register_lesson_fields(): void {
		register_graphql_object_type(
			'LessonVideo',
			array(
				'description' => __( 'Origem do vídeo da aula.', 'prime-poker' ),
				'fields'      => array(
					'provider' => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'Onde o vídeo está hospedado (google_drive…).', 'prime-poker' ),
					),
					'id'       => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'Identificador do vídeo no provedor (no Drive, o ID do arquivo).', 'prime-poker' ),
					),
				),
			)
		);

		register_graphql_object_type(
			'LessonMaterial',
			array(
				'description' => __( 'Arquivo de apoio da aula.', 'prime-poker' ),
				'fields'      => array(
					'name'     => array( 'type' => array( 'non_null' => 'String' ) ),
					'url'      => array( 'type' => array( 'non_null' => 'String' ) ),
					'fileSize' => array(
						'type'        => 'Int',
						'description' => __( 'Tamanho em bytes, quando conhecido.', 'prime-poker' ),
					),
					'mimeType' => array( 'type' => 'String' ),
				),
			)
		);

		register_graphql_fields(
			'Aula',
			array(
				'canWatch'         => array(
					'type'        => array( 'non_null' => 'Boolean' ),
					'description' => __( 'Se quem consulta pode assistir: tem o tier mínimo ou é da equipe.', 'prime-poker' ),
					'resolve'     => static fn( $post ): bool => Access::can_watch( self::post_id( $post ) ),
				),
				'minimumTier'      => array(
					'type'        => array( 'non_null' => 'String' ),
					'description' => __( 'Slug do tier mínimo (player_free, player_gold…).', 'prime-poker' ),
					'resolve'     => static fn( $post ): string => Access::minimum_tier( self::post_id( $post ) ),
				),
				'minimumTierLabel' => array(
					'type'        => array( 'non_null' => 'String' ),
					'description' => __( 'Nome de exibição do tier mínimo.', 'prime-poker' ),
					'resolve'     => static fn( $post ): string => Tiers::label( Access::minimum_tier( self::post_id( $post ) ) ),
				),
				'duration'         => array(
					'type'        => 'Int',
					'description' => __( 'Duração em segundos. null se não informada.', 'prime-poker' ),
					'resolve'     => static function ( $post ): ?int {
						$seconds = (int) get_post_meta( self::post_id( $post ), self::META_DURATION, true );

						return $seconds > 0 ? $seconds : null;
					},
				),
				'viewCount'        => array(
					'type'        => array( 'non_null' => 'Int' ),
					'description' => __( 'Visualizações da aula.', 'prime-poker' ),
					'resolve'     => static fn( $post ): int => Views::count( self::post_id( $post ) ),
				),
				'video'            => array(
					'type'        => 'LessonVideo',
					'description' => __( 'Vídeo da aula. null para quem não pode assistir ou se não houver vídeo.', 'prime-poker' ),
					'resolve'     => static function ( $post ): ?array {
						$post_id = self::post_id( $post );

						return Access::can_watch( $post_id ) ? self::video( $post_id ) : null;
					},
				),
				'materials'        => array(
					'type'        => array( 'list_of' => array( 'non_null' => 'LessonMaterial' ) ),
					'description' => __( 'Material de apoio. null para quem não pode assistir.', 'prime-poker' ),
					'resolve'     => static function ( $post ): ?array {
						$post_id = self::post_id( $post );

						return Access::can_watch( $post_id ) ? self::materials( $post_id ) : null;
					},
				),
			)
		);
	}

	/**
	 * `registerLessonView(input: { lessonId })`.
	 */
	private static function register_view_mutation(): void {
		register_graphql_mutation(
			'registerLessonView',
			array(
				'description'         => __( 'Conta uma visualização do jogador logado. Repetições em 12 horas não contam.', 'prime-poker' ),
				'inputFields'         => array(
					'lessonId' => array(
						'type'        => array( 'non_null' => 'Int' ),
						'description' => __( 'databaseId da aula.', 'prime-poker' ),
					),
				),
				'outputFields'        => array(
					'viewCount' => array( 'type' => 'Int' ),
				),
				'mutateAndGetPayload' => static function ( array $input ): array {
					$post_id = (int) $input['lessonId'];
					$post    = get_post( $post_id );

					if ( ! Access::can_browse() ) {
						throw new \GraphQL\Error\UserError( __( 'É preciso estar logado como jogador.', 'prime-poker' ) );
					}

					if ( ! $post instanceof \WP_Post || Content::POST_TYPE !== $post->post_type || 'publish' !== $post->post_status ) {
						throw new \GraphQL\Error\UserError( __( 'Aula não encontrada.', 'prime-poker' ) );
					}

					return array( 'viewCount' => Views::register( $post_id, get_current_user_id() ) );
				},
			)
		);
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Consulta                               */
	/* ---------------------------------------------------------------------- */

	/**
	 * Aplica os filtros e a ordem na WP_Query das conexões de aulas.
	 *
	 * @param array<string, mixed> $query_args      Argumentos da WP_Query.
	 * @param mixed                $resolver        Resolver da conexão.
	 * @param array<string, mixed> $unfiltered_args Argumentos crus do GraphQL.
	 * @return array<string, mixed>
	 */
	public static function filter_query( array $query_args, $resolver, $unfiltered_args = array() ): array {
		if ( ! in_array( Content::POST_TYPE, (array) ( $query_args['post_type'] ?? array() ), true ) ) {
			return $query_args;
		}

		$where = is_array( $unfiltered_args['where'] ?? null ) ? $unfiltered_args['where'] : array();

		$offset = $where['offset'] ?? null;

		if ( is_numeric( $offset ) && (int) $offset > 0 ) {
			$query_args['offset'] = (int) $offset;
			unset( $query_args['paged'] );
		}

		$query_args = self::with_filters( $query_args, $where );

		// Sem `sort` explícito, só reordena se ninguém pediu `orderby` nativo.
		if ( isset( $where['sort'] ) || empty( $where['orderby'] ) ) {
			$query_args = self::with_sort( $query_args, (string) ( $where['sort'] ?? 'NEWEST' ) );
		}

		return $query_args;
	}

	/**
	 * Trilha, instrutor e intervalo de datas.
	 *
	 * Valor vazio ou malformado é ignorado, não vira filtro que não casa com
	 * nada: o front valida a URL, mas uma data torta não deve zerar a lista.
	 *
	 * @param array<string, mixed> $query_args Argumentos da WP_Query.
	 * @param array<string, mixed> $filters    Filtros do GraphQL.
	 * @return array<string, mixed>
	 */
	private static function with_filters( array $query_args, array $filters ): array {
		$track = isset( $filters['track'] ) ? sanitize_title( (string) $filters['track'] ) : '';

		if ( '' !== $track ) {
			$query_args['tax_query']   = is_array( $query_args['tax_query'] ?? null ) ? $query_args['tax_query'] : array();
			$query_args['tax_query'][] = array(
				'taxonomy' => Content::TAXONOMY,
				'field'    => 'slug',
				'terms'    => $track,
			);
		}

		$instructor = isset( $filters['instructor'] ) ? (int) $filters['instructor'] : 0;

		if ( $instructor > 0 ) {
			$query_args['meta_query']   = is_array( $query_args['meta_query'] ?? null ) ? $query_args['meta_query'] : array();
			$query_args['meta_query'][] = array(
				'key'   => self::META_INSTRUCTOR,
				'value' => (string) $instructor,
			);
		}

		$date_query = array();
		$from       = self::day( $filters['from'] ?? null );
		$to         = self::day( $filters['to'] ?? null );

		// Em array, e não em string: com `inclusive`, o WordPress completa o
		// "até" com 23:59:59 — uma aula das 14h do último dia entra.
		if ( null !== $from ) {
			$date_query['after'] = $from;
		}

		if ( null !== $to ) {
			$date_query['before'] = $to;
		}

		if ( array() !== $date_query ) {
			$date_query['inclusive']  = true;
			$query_args['date_query'] = array( $date_query );
		}

		return $query_args;
	}

	/**
	 * Ordem da listagem.
	 *
	 * Ordenar por meta com uma cláusula `EXISTS` sozinha tiraria da lista quem
	 * não tem a meta; o par `EXISTS`/`NOT EXISTS` mantém todas as aulas e só
	 * decide a posição. A data desempata.
	 *
	 * @param array<string, mixed> $query_args Argumentos da WP_Query.
	 * @param string               $sort       Valor do `LessonSortEnum`.
	 * @return array<string, mixed>
	 */
	private static function with_sort( array $query_args, string $sort ): array {
		$sort  = self::SORTS[ $sort ] ?? self::SORTS['NEWEST'];
		$order = $sort['order'];

		unset( $query_args['order'] );

		if ( null === $sort['meta'] ) {
			$query_args['orderby'] = array( 'date' => $order );

			return $query_args;
		}

		$query_args['meta_query']   = is_array( $query_args['meta_query'] ?? null ) ? $query_args['meta_query'] : array();
		$query_args['meta_query'][] = array(
			'relation' => 'OR',
			'sort'     => array(
				'key'     => $sort['meta'],
				'type'    => 'NUMERIC',
				'compare' => 'EXISTS',
			),
			array(
				'key'     => $sort['meta'],
				'compare' => 'NOT EXISTS',
			),
		);

		$query_args['orderby'] = array(
			'sort' => $order,
			'date' => 'DESC',
		);

		return $query_args;
	}

	/**
	 * Total para o `lessonsTotal`.
	 *
	 * @param array<string, mixed> $args Argumentos do campo.
	 */
	private static function count_lessons( array $args ): int {
		if ( ! Access::can_browse() ) {
			return 0;
		}

		$query_args = array(
			'post_type'      => Content::POST_TYPE,
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'no_found_rows'  => false,
		);

		// Só define quando há valor: um `s` vazio vira busca por string vazia.
		$search = isset( $args['search'] ) ? trim( (string) $args['search'] ) : '';

		if ( '' !== $search ) {
			$query_args['s'] = $search;
		}

		return (int) ( new \WP_Query( self::with_filters( $query_args, $args ) ) )->found_posts;
	}

	/* ---------------------------------------------------------------------- */
	/*                           Conteúdo protegido                           */
	/* ---------------------------------------------------------------------- */

	/**
	 * Vídeo da aula, ou null se não houver.
	 *
	 * @param int $post_id ID da aula.
	 * @return array{provider: string, id: string}|null
	 */
	private static function video( int $post_id ): ?array {
		$provider = (string) get_post_meta( $post_id, self::META_VIDEO_PROVIDER, true );
		$provider = '' === $provider ? self::DEFAULT_PROVIDER : $provider;
		$raw      = trim( (string) get_post_meta( $post_id, self::META_VIDEO_ID, true ) );
		$id       = 'google_drive' === $provider ? self::drive_file_id( $raw ) : $raw;

		return null === $id || '' === $id ? null : array(
			'provider' => $provider,
			'id'       => $id,
		);
	}

	/**
	 * ID do arquivo do Drive a partir do que foi colado no painel.
	 *
	 * Quem cadastra cola o link de compartilhamento, não o ID — aceitar os
	 * dois evita um erro de cadastro que só apareceria no player.
	 *
	 * @param string $value Link ou ID.
	 */
	public static function drive_file_id( string $value ): ?string {
		$patterns = array(
			'#/file/d/([A-Za-z0-9_-]{20,})#', // drive.google.com/file/d/<id>/view
			'#[?&]id=([A-Za-z0-9_-]{20,})#',  // drive.google.com/open?id=<id>, uc?id=<id>
			'#^([A-Za-z0-9_-]{20,})$#',       // Só o ID (hoje com 28 a 44 caracteres).
		);

		foreach ( $patterns as $pattern ) {
			if ( preg_match( $pattern, $value, $match ) ) {
				return $match[1];
			}
		}

		return null;
	}

	/**
	 * Material de apoio, lido direto das metas do repeater do ACF.
	 *
	 * Direto das metas, e não por `get_field`, para não depender da
	 * formatação do ACF: o repeater grava `materials` (quantidade) e
	 * `materials_<i>_name` / `materials_<i>_file` (ID do anexo).
	 *
	 * @param int $post_id ID da aula.
	 * @return array<int, array{name: string, url: string, fileSize: int|null, mimeType: string|null}>
	 */
	private static function materials( int $post_id ): array {
		$count     = max( 0, (int) get_post_meta( $post_id, self::META_MATERIALS, true ) );
		$materials = array();

		for ( $i = 0; $i < $count; $i++ ) {
			$attachment_id = (int) get_post_meta( $post_id, self::META_MATERIALS . "_{$i}_file", true );
			$url           = $attachment_id > 0 ? wp_get_attachment_url( $attachment_id ) : false;

			// Linha sem arquivo (anexo apagado da biblioteca): some da lista
			// em vez de virar um botão de download quebrado.
			if ( ! is_string( $url ) || '' === $url ) {
				continue;
			}

			$name = trim( (string) get_post_meta( $post_id, self::META_MATERIALS . "_{$i}_name", true ) );
			$path = get_attached_file( $attachment_id );

			$materials[] = array(
				'name'     => '' !== $name ? $name : wp_basename( (string) $path ?: $url ),
				'url'      => $url,
				'fileSize' => self::file_size( $attachment_id, $path ),
				'mimeType' => get_post_mime_type( $attachment_id ) ?: null,
			);
		}

		return $materials;
	}

	/**
	 * Tamanho do anexo.
	 *
	 * O WordPress grava `filesize` nos metadados desde a 6.0; anexos antigos
	 * não têm, e aí vale o arquivo em disco.
	 *
	 * @param int          $attachment_id ID do anexo.
	 * @param string|false $path          Caminho do arquivo.
	 */
	private static function file_size( int $attachment_id, $path ): ?int {
		$metadata = wp_get_attachment_metadata( $attachment_id );

		if ( is_array( $metadata ) && isset( $metadata['filesize'] ) ) {
			return (int) $metadata['filesize'];
		}

		if ( is_string( $path ) && is_readable( $path ) ) {
			$size = filesize( $path );

			return false === $size ? null : $size;
		}

		return null;
	}

	/* ---------------------------------------------------------------------- */
	/*                                Auxiliares                              */
	/* ---------------------------------------------------------------------- */

	/**
	 * ID da aula a partir do model do WPGraphQL.
	 *
	 * @param mixed $post Model de post do WPGraphQL.
	 */
	private static function post_id( $post ): int {
		return isset( $post->databaseId ) ? (int) $post->databaseId : 0;
	}

	/**
	 * `AAAA-MM-DD` válido → partes para o `date_query`; o resto → null.
	 *
	 * @param mixed $value Valor recebido.
	 * @return array{year: int, month: int, day: int}|null
	 */
	private static function day( $value ): ?array {
		if ( ! is_string( $value ) || ! preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', $value, $parts ) ) {
			return null;
		}

		[ , $year, $month, $day ] = array_map( 'intval', $parts );

		return checkdate( $month, $day, $year ) ? array(
			'year'  => $year,
			'month' => $month,
			'day'   => $day,
		) : null;
	}
}
