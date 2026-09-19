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
 * `lessonSuggestion(subject, track)`: a aula mais próxima de um assunto.
 *
 * É a ÚNICA leitura de aulas aberta a visitantes, de propósito: o post do
 * blog é público e convida o leitor para a aula do mesmo tema. Sai só o que
 * um card de divulgação mostra — título, slug, instrutor e duração. Vídeo,
 * materiais e tier nunca passam por aqui.
 *
 * Pontua cada palavra do título da aula em comum com o assunto e dá um
 * empurrão para a trilha de mesmo slug. Sem palavra em comum, devolve null:
 * uma sugestão aleatória é pior do que nenhuma.
 */
final class Suggestion {

	/** Aulas avaliadas, das mais recentes. O acervo previsto cabe folgado. */
	private const POOL = 500;

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
				),
				'resolve'     => static fn( $root, array $args ): ?array => self::find(
					(string) $args['subject'],
					isset( $args['track'] ) ? (string) $args['track'] : ''
				),
			)
		);
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

		if ( 0 === $best ) {
			return null;
		}

		$instructor = (int) get_post_meta( $best, 'instructor', true );
		$duration   = (int) get_post_meta( $best, 'duration', true );

		return array(
			'slug'       => (string) get_post_field( 'post_name', $best ),
			'title'      => html_entity_decode( get_the_title( $best ), ENT_QUOTES, 'UTF-8' ),
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
