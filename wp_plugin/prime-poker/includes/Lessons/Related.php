<?php
/**
 * A aula que um post do blog divulga.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `relatedLesson(postId)`: a aula escolhida à mão no post.
 *
 * É a ÚNICA leitura de aulas aberta a visitantes, de propósito: o post do
 * blog é público e convida o leitor para a aula do mesmo tema. Sai só o que
 * um card de divulgação mostra — título, slug, instrutor e duração. Vídeo,
 * materiais e tier nunca passam por aqui.
 *
 * Ele precisa passar pelo plugin porque a relação do ACF, lida direto pelo
 * WPGraphQL, devolve vazio para visitante — a aula é privada, e o leitor do
 * blog não está logado.
 *
 * **Só a escolha do painel.** Até a 1.18.1 havia um palpite por palavras do
 * título quando o campo estava vazio; ele saiu na 1.19.0. O palpite acertava
 * pouco e errava em público: um post de gestão de banca acabava anunciando a
 * aula de teste porque as duas tinham uma palavra em comum. Post sem Aula
 * relacionada agora não mostra chamada nenhuma — que é o certo quando não há
 * o que recomendar.
 */
final class Related {

	/**
	 * Meta do ACF com a aula escolhida no post (campo `relatedlesson`).
	 *
	 * É o nome do campo no grupo *PostFields*, conferido no schema do
	 * WPGraphQL (`PostFields.relatedlesson`).
	 */
	private const META_RELATED = 'relatedlesson';

	/** Tipos de campo do ACF que apontam para outro post. */
	private const RELATION_TYPES = array( 'relationship', 'post_object' );

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'graphql_register_types', array( self::class, 'register' ) );
	}

	/**
	 * Declara o tipo e o campo.
	 */
	public static function register(): void {
		register_graphql_object_type(
			'RelatedLesson',
			array(
				'description' => __( 'Divulgação de uma aula: só o que um card público mostra.', 'prime-poker' ),
				'fields'      => array(
					'slug'       => array( 'type' => array( 'non_null' => 'String' ) ),
					'title'      => array( 'type' => array( 'non_null' => 'String' ) ),
					'instructor' => array(
						'type'        => 'String',
						'description' => __( 'Nome do instrutor.', 'prime-poker' ),
					),
					'duration'   => array(
						'type'        => 'Int',
						'description' => __( 'Duração em segundos.', 'prime-poker' ),
					),
				),
			)
		);

		register_graphql_field(
			'RootQuery',
			'relatedLesson',
			array(
				'type'        => 'RelatedLesson',
				'description' => __( 'A aula escolhida no campo Aula relacionada de um post. Aberto a visitantes.', 'prime-poker' ),
				'args'        => array(
					'postId' => array(
						'type'        => array( 'non_null' => 'Int' ),
						'description' => __( 'databaseId do post.', 'prime-poker' ),
					),
				),
				'resolve'     => static fn( $root, array $args ): ?array => self::for_post( (int) $args['postId'] ),
			)
		);
	}

	/**
	 * A aula escolhida à mão num post.
	 *
	 * A leitura tenta três caminhos, do mais direto ao mais tolerante, porque
	 * nem sempre dão no mesmo lugar:
	 *
	 * 1. `get_field()`, que resolve o campo pela definição do grupo — é o que
	 *    a área administrativa e o WPGraphQL usam;
	 * 2. a meta crua, que funciona mesmo com o ACF fora do ar, desde que o
	 *    valor esteja gravado com o nome do campo;
	 * 3. qualquer outro campo de relação do post, encontrado pelas metas do
	 *    próprio post. É a rede de segurança para o campo ter sido criado com
	 *    outro nome no painel — caso em que os dois primeiros voltam vazios e
	 *    o post ficaria sem chamada sem ninguém entender por quê.
	 *
	 * @param int $post_id databaseId do post.
	 * @return array{slug: string, title: string, instructor: string|null, duration: int|null}|null
	 */
	public static function for_post( int $post_id ): ?array {
		if ( $post_id <= 0 ) {
			return null;
		}

		$lesson_id = self::lesson_from( self::stored( $post_id ) );

		if ( 0 === $lesson_id ) {
			$lesson_id = self::sweep( $post_id );
		}

		return 0 === $lesson_id ? null : self::card( $lesson_id );
	}

	/**
	 * O valor gravado no campo Aula relacionada, pelos dois caminhos diretos.
	 *
	 * O `false` no `get_field()` pede o valor sem formatação: IDs, não
	 * objetos.
	 *
	 * @param int $post_id databaseId do post.
	 * @return mixed
	 */
	private static function stored( int $post_id ) {
		$value = function_exists( 'get_field' ) ? get_field( self::META_RELATED, $post_id, false ) : null;

		return empty( $value ) ? get_post_meta( $post_id, self::META_RELATED, true ) : $value;
	}

	/**
	 * A primeira aula publicada de um valor de campo de relação.
	 *
	 * Aula despublicada, apagada ou apontando para algo que não é aula vale
	 * como campo vazio: melhor post sem chamada que link quebrado.
	 *
	 * @param mixed $value Valor do campo: ID, lista de IDs ou objetos.
	 */
	private static function lesson_from( $value ): int {
		if ( empty( $value ) ) {
			return 0;
		}

		foreach ( ( is_array( $value ) ? $value : array( $value ) ) as $item ) {
			// Um ACF configurado para devolver o post inteiro chega como objeto.
			$id     = $item instanceof \WP_Post ? (int) $item->ID : (int) $item;
			$lesson = $id > 0 ? get_post( $id ) : null;

			if ( $lesson instanceof \WP_Post
				&& Content::POST_TYPE === $lesson->post_type
				&& 'publish' === $lesson->post_status
			) {
				return $id;
			}
		}

		return 0;
	}

	/**
	 * Procura a aula em qualquer campo de relação do post.
	 *
	 * Só olha metas que o ACF reconhece como campo de relação: ao gravar, ele
	 * guarda `_<campo>` com a chave da definição (`field_abc123`), e é por ela
	 * que o tipo do campo é conferido. Sem esse filtro, a varredura pegaria
	 * `_thumbnail_id` e qualquer outro número que por acaso batesse com o ID
	 * de uma aula.
	 *
	 * @param int $post_id databaseId do post.
	 */
	private static function sweep( int $post_id ): int {
		if ( ! function_exists( 'acf_get_field' ) ) {
			return 0;
		}

		foreach ( get_post_meta( $post_id ) as $key => $values ) {
			if ( ! str_starts_with( (string) $key, '_' ) ) {
				continue;
			}

			$field = acf_get_field( (string) ( $values[0] ?? '' ) );

			if ( ! is_array( $field ) || ! in_array( $field['type'] ?? '', self::RELATION_TYPES, true ) ) {
				continue;
			}

			$lesson_id = self::lesson_from( get_post_meta( $post_id, substr( (string) $key, 1 ), true ) );

			if ( 0 !== $lesson_id ) {
				return $lesson_id;
			}
		}

		return 0;
	}

	/**
	 * O card público de uma aula.
	 *
	 * Só o que a divulgação mostra. Tudo o que é protegido — vídeo, materiais,
	 * tier — fica de fora por construção, e não por um filtro depois.
	 *
	 * @param int $lesson_id ID da aula.
	 * @return array{slug: string, title: string, instructor: string|null, duration: int|null}
	 */
	private static function card( int $lesson_id ): array {
		$instructor = (int) get_post_meta( $lesson_id, 'instructor', true );
		$duration   = (int) get_post_meta( $lesson_id, 'duration', true );

		return array(
			'slug'       => (string) get_post_field( 'post_name', $lesson_id ),
			'title'      => html_entity_decode( get_the_title( $lesson_id ), ENT_QUOTES, 'UTF-8' ),
			'instructor' => $instructor > 0 ? html_entity_decode( get_the_title( $instructor ), ENT_QUOTES, 'UTF-8' ) : null,
			'duration'   => $duration > 0 ? $duration : null,
		);
	}
}
