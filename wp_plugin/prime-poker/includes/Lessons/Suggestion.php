<?php
/**
 * Aula sugerida para um post do blog.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `lessonSuggestion(subject, track, postId)`: a aula a divulgar num post.
 *
 * É a ÚNICA leitura de aulas aberta a visitantes, de propósito: o post do
 * blog é público e convida o leitor para a aula do mesmo tema. Sai só o que
 * um card de divulgação mostra — título, slug, instrutor e duração. Vídeo,
 * materiais e tier nunca passam por aqui.
 *
 * Com `postId`, **a escolha do painel vem primeiro**: o campo Aula
 * relacionada do post (ACF `relatedlesson`) ganha de qualquer palpite. Ele
 * precisa passar por aqui porque a relação do ACF, lida direto, devolve nada
 * para visitante — a aula é privada, e o leitor do blog não está logado.
 *
 * Sem escolha no painel, o palpite: pontua cada palavra do título da aula em
 * comum com o assunto e dá um empurrão para a trilha de mesmo slug. Sem
 * palavra em comum, devolve null — uma sugestão aleatória é pior que nenhuma.
 */
final class Suggestion {

	/** Aulas avaliadas, das mais recentes. O acervo previsto cabe folgado. */
	private const POOL = 500;

	/** Meta do ACF com a aula escolhida à mão no post (campo `relatedlesson`). */
	private const META_RELATED = 'relatedlesson';

	/**
	 * Tamanho mínimo da palavra: 3, para as siglas do poker (ICM, GTO, HUD)
	 * contarem. As palavras vazias de 3+ letras saem pela lista abaixo.
	 */
	private const MIN_WORD = 3;

	/** Palavras que casariam com quase todo título. Sem acento, como `words()`. */
	private const STOPWORDS = array(
		'que', 'com', 'para', 'por', 'uma', 'uns', 'umas', 'dos', 'das', 'nos', 'nas',
		'seu', 'sua', 'seus', 'suas', 'como', 'mais', 'menos', 'sem', 'sobre', 'entre',
		'quando', 'onde', 'qual', 'quais', 'porque', 'isso', 'este', 'esta', 'esse',
		'essa', 'voce', 'pelo', 'pela', 'pelos', 'pelas', 'tem', 'ter', 'ser', 'sao',
		'nao', 'sim', 'aula', 'aulas', 'the', 'and', 'for',
	);

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
			'LessonSuggestion',
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
			'lessonSuggestion',
			array(
				'type'        => 'LessonSuggestion',
				'description' => __( 'A aula publicada mais próxima de um assunto (ex.: o título de um post). Aberto a visitantes.', 'prime-poker' ),
				'args'        => array(
					'subject' => array( 'type' => array( 'non_null' => 'String' ) ),
					'track'   => array(
						'type'        => 'String',
						'description' => __( 'Slug de trilha que ganha preferência.', 'prime-poker' ),
					),
					'postId'  => array(
						'type'        => 'Int',
						'description' => __( 'databaseId do post. Se ele tiver Aula relacionada, é ela que volta.', 'prime-poker' ),
					),
				),
				'resolve'     => static fn( $root, array $args ): ?array => self::for_post(
					(int) ( $args['postId'] ?? 0 ),
					(string) $args['subject'],
					isset( $args['track'] ) ? (string) $args['track'] : ''
				),
			)
		);
	}

	/**
	 * A aula a divulgar num post: a escolhida no painel, ou o palpite.
	 *
	 * @param int    $post_id databaseId do post; 0 pula direto para o palpite.
	 * @param string $subject Assunto (título do post).
	 * @param string $track   Slug de trilha preferida, ou vazio.
	 * @return array{slug: string, title: string, instructor: string|null, duration: int|null}|null
	 */
	public static function for_post( int $post_id, string $subject, string $track ): ?array {
		$chosen = $post_id > 0 ? self::related( $post_id ) : null;

		return null !== $chosen ? $chosen : self::find( $subject, $track );
	}

	/**
	 * A aula escolhida à mão no post.
	 *
	 * A leitura tenta o ACF primeiro e cai na meta crua depois. São dois
	 * caminhos porque nem sempre dão no mesmo lugar: o ACF resolve o campo
	 * pela definição do grupo — é o que a área administrativa e o WPGraphQL
	 * usam — enquanto a meta crua depende de o valor estar gravado com o nome
	 * do campo. Com os dois, o painel manda mesmo que o nome no banco não
	 * seja exatamente este, e o campo continua funcionando se o ACF sair do
	 * ar. O `false` pede o valor sem formatação: IDs, não objetos.
	 *
	 * @param int $post_id databaseId do post.
	 * @return array{slug: string, title: string, instructor: string|null, duration: int|null}|null
	 */
	private static function related( int $post_id ): ?array {
		$stored = function_exists( 'get_field' ) ? get_field( self::META_RELATED, $post_id, false ) : null;

		if ( empty( $stored ) ) {
			$stored = get_post_meta( $post_id, self::META_RELATED, true );
		}

		$ids   = is_array( $stored ) ? $stored : array( $stored );
		$first = reset( $ids );
		// Um ACF configurado para devolver o post inteiro chega como objeto.
		$id = $first instanceof \WP_Post ? (int) $first->ID : (int) ( $first ?: 0 );

		if ( $id <= 0 ) {
			return null;
		}

		$lesson = get_post( $id );

		// Aula despublicada ou apagada depois de relacionada: cai no palpite,
		// em vez de virar um link quebrado no post.
		if ( ! $lesson instanceof \WP_Post || Content::POST_TYPE !== $lesson->post_type || 'publish' !== $lesson->post_status ) {
			return null;
		}

		return self::card( $id );
	}

	/**
	 * Melhor aula para o assunto.
	 *
	 * @param string $subject Assunto (título do post).
	 * @param string $track   Slug de trilha preferida, ou vazio.
	 * @return array{slug: string, title: string, instructor: string|null, duration: int|null}|null
	 */
	public static function find( string $subject, string $track ): ?array {
		$words = self::words( $subject );

		if ( array() === $words ) {
			return null;
		}

		$ids = get_posts(
			array(
				'post_type'        => Content::POST_TYPE,
				'post_status'      => 'publish',
				'posts_per_page'   => self::POOL,
				'orderby'          => 'date',
				'order'            => 'DESC',
				'fields'           => 'ids',
				'no_found_rows'    => true,
				// O filtro de privacidade é do GraphQL; aqui a consulta é
				// interna e o resultado já é só o card de divulgação.
				'suppress_filters' => true,
			)
		);

		$best       = 0;
		$best_score = 0;

		foreach ( $ids as $id ) {
			$title = self::words( get_the_title( $id ) );
			$score = count( array_intersect( $words, $title ) );

			// A trilha desempata, mas sozinha não sugere nada.
			if ( $score > 0 && '' !== $track && has_term( $track, Content::TAXONOMY, $id ) ) {
				++$score;
			}

			// `>` e não `>=`: no empate fica a mais recente.
			if ( $score > $best_score ) {
				$best       = (int) $id;
				$best_score = $score;
			}
		}

		return 0 === $best ? null : self::card( $best );
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

	/**
	 * Palavras significativas, sem acento e sem repetição.
	 *
	 * @param string $text Texto.
	 * @return array<int, string>
	 */
	private static function words( string $text ): array {
		$text  = strtolower( remove_accents( html_entity_decode( $text, ENT_QUOTES, 'UTF-8' ) ) );
		$parts = preg_split( '/[^a-z0-9]+/', $text ) ?: array();

		return array_values(
			array_unique(
				array_filter(
					$parts,
					static fn( string $word ): bool => strlen( $word ) >= self::MIN_WORD && ! in_array( $word, self::STOPWORDS, true )
				)
			)
		);
	}
}
