<?php
/**
 * Campos ACF das aulas e das trilhas.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Comportamento dos campos ACF das aulas.
 *
 * Os grupos `lessonFields` e `trackFields` são do ACF, importados de
 * `wp_plugin/acf/aulas.json`. O código depende deles de duas formas:
 *
 * - lê as metas pelo NOME do campo (`GraphQL`, `Access`);
 * - valida e converte valores pela CHAVE do campo (duração, vídeo).
 *
 * Como os campos ficam editáveis no painel, `health_notice` avisa quando
 * falta um ou quando o nome mudou — renomear um campo não dá erro nenhum, só
 * faz o dado sumir do site.
 */
final class Fields {

	private const KEY_DURATION = 'field_prime_lesson_duration';

	private const KEY_VIDEO_ID = 'field_prime_lesson_video_id';

	/**
	 * Campos de que o código depende: chave → nome esperado.
	 *
	 * Mudar um nome aqui exige mudar o JSON (e o dado já gravado).
	 */
	private const REQUIRED = array(
		'field_prime_lesson_instructor'     => 'instructor',
		'field_prime_lesson_level'          => 'level',
		self::KEY_DURATION                  => 'duration',
		'field_prime_lesson_minimum_tier'   => Access::META_MINIMUM_TIER,
		'field_prime_lesson_video_provider' => 'video_provider',
		self::KEY_VIDEO_ID                  => 'video_id',
		'field_prime_lesson_materials'      => 'materials',
		'field_prime_lesson_material_name'  => 'name',
		'field_prime_lesson_material_file'  => 'file',
		'field_prime_track_badge'           => 'badge',
		'field_prime_track_color'           => 'color',
		'field_prime_track_order'           => 'order',
	);

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_filter( 'acf/validate_value/key=' . self::KEY_DURATION, array( self::class, 'validate_duration' ), 10, 2 );
		add_filter( 'acf/update_value/key=' . self::KEY_DURATION, array( self::class, 'save_duration' ) );
		add_filter( 'acf/load_value/key=' . self::KEY_DURATION, array( self::class, 'show_duration' ) );

		add_filter( 'acf/validate_value/key=' . self::KEY_VIDEO_ID, array( self::class, 'validate_video' ), 10, 2 );

		add_action( 'admin_notices', array( self::class, 'health_notice' ) );
	}

	/* ---------------------------------------------------------------------- */
	/*                              Conferência                               */
	/* ---------------------------------------------------------------------- */

	/**
	 * O que está faltando ou fora do combinado, em frases para o painel.
	 *
	 * @return array<int, string>
	 */
	public static function problems(): array {
		if ( ! function_exists( 'acf_get_field' ) ) {
			return array( __( 'o ACF não está ativo.', 'prime-poker' ) );
		}

		$problems = array();

		if ( ! post_type_exists( Content::POST_TYPE ) || ! taxonomy_exists( Content::TAXONOMY ) ) {
			$problems[] = __( 'o tipo <code>aula</code> ou a taxonomia <code>trilha</code> não existe. Importe <code>wp_plugin/acf/aulas.json</code> em ACF → Ferramentas.', 'prime-poker' );
		}

		foreach ( self::REQUIRED as $key => $name ) {
			$field = acf_get_field( $key );

			if ( ! is_array( $field ) ) {
				/* translators: %s: chave do campo. */
				$problems[] = sprintf( __( 'falta o campo <code>%s</code>. Importe <code>wp_plugin/acf/aulas.json</code> em ACF → Ferramentas.', 'prime-poker' ), esc_html( $key ) );
			} elseif ( ( $field['name'] ?? '' ) !== $name ) {
				/* translators: 1: rótulo do campo, 2: nome esperado, 3: nome atual. */
				$problems[] = sprintf( __( 'o campo "%1$s" precisa se chamar <code>%2$s</code> (hoje: <code>%3$s</code>). Com outro nome o site não lê o valor.', 'prime-poker' ), esc_html( (string) ( $field['label'] ?? $key ) ), esc_html( $name ), esc_html( (string) ( $field['name'] ?? '' ) ) );
			}
		}

		return $problems;
	}

	/**
	 * Aviso nas telas de aulas, trilhas e do ACF, para administradores.
	 */
	public static function health_notice(): void {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

		if ( ! $screen || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$relevant = Content::POST_TYPE === $screen->post_type
			|| Content::TAXONOMY === $screen->taxonomy
			|| str_starts_with( (string) $screen->post_type, 'acf-' );

		if ( ! $relevant ) {
			return;
		}

		$problems = self::problems();

		if ( array() === $problems ) {
			return;
		}

		$items = '';

		foreach ( $problems as $problem ) {
			$items .= '<li>' . wp_kses( $problem, array( 'code' => array() ) ) . '</li>';
		}

		printf(
			'<div class="notice notice-error"><p><strong>%s</strong></p><ul style="list-style:disc;padding-left:1.5em">%s</ul></div>',
			esc_html__( 'Aulas: a configuração do ACF não bate com o plugin Prime Poker.', 'prime-poker' ),
			$items // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapado acima.
		);
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Duração                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * `"25:30"` → 1530; `"1:05:00"` → 3900; `"25"` → 1500. Inválido → null.
	 *
	 * Número puro vale como MINUTOS: é o que alguém quer dizer ao digitar
	 * "25" numa duração de aula. O valor gravado (segundos) nunca volta por
	 * aqui como número puro — `show_duration` o exibe como `25:30`, e é esse
	 * texto que o formulário reenvia.
	 *
	 * @param mixed $value Texto digitado.
	 */
	public static function parse_duration( $value ): ?int {
		$value = trim( (string) $value );

		if ( preg_match( '/^\d+$/', $value ) ) {
			return (int) $value * 60;
		}

		if ( ! preg_match( '/^(?:(\d+):)?(\d{1,2}):(\d{2})$/', $value, $parts ) ) {
			return null;
		}

		$hours   = '' === $parts[1] ? 0 : (int) $parts[1];
		$minutes = (int) $parts[2];
		$seconds = (int) $parts[3];

		// Com horas, os minutos têm limite; sem horas, "90:00" é aceito.
		if ( $seconds > 59 || ( $hours > 0 && $minutes > 59 ) ) {
			return null;
		}

		return $hours * 3600 + $minutes * 60 + $seconds;
	}

	/**
	 * 1530 → `"25:30"`; 3900 → `"1:05:00"`.
	 *
	 * @param int $seconds Duração em segundos.
	 */
	public static function format_duration( int $seconds ): string {
		$hours   = intdiv( $seconds, 3600 );
		$minutes = intdiv( $seconds % 3600, 60 );
		$rest    = $seconds % 60;

		return $hours > 0
			? sprintf( '%d:%02d:%02d', $hours, $minutes, $rest )
			: sprintf( '%d:%02d', $minutes, $rest );
	}

	/**
	 * Recusa duração que não se converte ou é zero.
	 *
	 * @param bool|string $valid Resultado até aqui.
	 * @param mixed       $value Valor digitado.
	 * @return bool|string
	 */
	public static function validate_duration( $valid, $value ) {
		if ( true !== $valid || '' === trim( (string) $value ) ) {
			return $valid;
		}

		$seconds = self::parse_duration( $value );

		return null !== $seconds && $seconds > 0
			? true
			: __( 'Use minutos (25), minutos e segundos (25:30) ou horas, minutos e segundos (1:05:00).', 'prime-poker' );
	}

	/**
	 * Grava em segundos: a ordenação por duração compara a meta como número.
	 *
	 * @param mixed $value Valor digitado.
	 * @return mixed
	 */
	public static function save_duration( $value ) {
		$seconds = self::parse_duration( $value );

		return null === $seconds ? $value : $seconds;
	}

	/**
	 * Mostra no painel no formato em que foi digitado.
	 *
	 * @param mixed $value Valor gravado.
	 * @return mixed
	 */
	public static function show_duration( $value ) {
		return is_numeric( $value ) ? self::format_duration( (int) $value ) : $value;
	}

	/**
	 * Recusa o que não é um vídeo do Bunny, em vez de salvar e só falhar no player.
	 *
	 * @param bool|string $valid Resultado até aqui.
	 * @param mixed       $value Valor digitado.
	 * @return bool|string
	 */
	public static function validate_video( $valid, $value ) {
		if ( true !== $valid || '' === trim( (string) $value ) ) {
			return $valid;
		}

		return null !== Bunny::video_id( (string) $value )
			? true
			: __( 'Não reconheci este vídeo. Cole o Video ID do Bunny Stream (ex.: 32d140e2-e4f4-4eec-9d53-20371e9be607) ou o link do player.', 'prime-poker' );
	}
}
