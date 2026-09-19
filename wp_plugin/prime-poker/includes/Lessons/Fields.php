<?php
/**
 * Campos ACF das aulas e das trilhas.
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
 * Grupos de campos registrados pelo código, não pelo painel.
 *
 * Os nomes dos campos são contrato com `GraphQL` (metas lidas direto) e com o
 * front (`lessonFields`, `trackFields`). Registrados aqui, eles andam no mesmo
 * commit que o código que os lê, e aparecem no ACF como grupos "locais", sem
 * edição pelo painel: não há como alguém renomear um campo ou ligar o
 * "Show in GraphQL" do vídeo e abrir o conteúdo de todas as aulas.
 *
 * Sem o ACF ativo nada disto roda, e as aulas continuam editáveis (título,
 * conteúdo, imagem, trilha) — só sem os campos.
 */
final class Fields {

	private const KEY_DURATION = 'field_prime_lesson_duration';

	private const KEY_VIDEO_ID = 'field_prime_lesson_video_id';

	/**
	 * Cores da trilha: a chave é o que fica no banco, o front a converte nas
	 * classes do selo e da capa. Nova cor exige par no front.
	 */
	public const TRACK_COLORS = array(
		'vermelho'  => 'Vermelho',
		'esmeralda' => 'Esmeralda',
		'violeta'   => 'Violeta',
		'laranja'   => 'Laranja',
		'azul'      => 'Azul',
		'indigo'    => 'Índigo',
		'ambar'     => 'Âmbar',
	);

	public const LEVELS = array(
		'iniciante'     => 'Iniciante',
		'intermediario' => 'Intermediário',
		'avancado'      => 'Avançado',
	);

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'acf/init', array( self::class, 'register' ) );

		add_filter( 'acf/validate_value/key=' . self::KEY_DURATION, array( self::class, 'validate_duration' ), 10, 2 );
		add_filter( 'acf/update_value/key=' . self::KEY_DURATION, array( self::class, 'save_duration' ) );
		add_filter( 'acf/load_value/key=' . self::KEY_DURATION, array( self::class, 'show_duration' ) );

		add_filter( 'acf/validate_value/key=' . self::KEY_VIDEO_ID, array( self::class, 'validate_video' ), 10, 2 );
	}

	/**
	 * Declara os dois grupos.
	 */
	public static function register(): void {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		acf_add_local_field_group( self::lesson_group() );
		acf_add_local_field_group( self::track_group() );
	}

	/**
	 * Grupo `lessonFields`, na tela da aula.
	 *
	 * @return array<string, mixed>
	 */
	private static function lesson_group(): array {
		$tiers = array();

		foreach ( Tiers::slugs() as $slug ) {
			$tiers[ $slug ] = Tiers::label( $slug );
		}

		return array(
			'key'                => 'group_prime_lesson_fields',
			'title'              => __( 'Dados da aula', 'prime-poker' ),
			'position'           => 'acf_after_title',
			'style'              => 'default',
			'active'             => true,
			'location'           => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => Content::POST_TYPE,
					),
				),
			),
			'show_in_graphql'    => 1,
			'graphql_field_name' => 'lessonFields',
			'graphql_types'      => array( 'Aula' ),
			'fields'             => array(
				array(
					'key'                => 'field_prime_lesson_instructor',
					'name'               => 'instructor',
					'label'              => __( 'Instrutor', 'prime-poker' ),
					'type'               => 'post_object',
					'post_type'          => array( 'instructor' ),
					'return_format'      => 'id',
					'required'           => 1,
					'allow_null'         => 0,
					'multiple'           => 0,
					'ui'                 => 1,
					'wrapper'            => array( 'width' => '50' ),
					'show_in_graphql'    => 1,
					'graphql_field_name' => 'instructor',
				),
				array(
					'key'                => 'field_prime_lesson_level',
					'name'               => 'level',
					'label'              => __( 'Nível', 'prime-poker' ),
					'type'               => 'select',
					'choices'            => self::LEVELS,
					'default_value'      => 'iniciante',
					'return_format'      => 'value',
					'required'           => 1,
					'wrapper'            => array( 'width' => '25' ),
					'show_in_graphql'    => 1,
					'graphql_field_name' => 'level',
				),
				array(
					'key'             => self::KEY_DURATION,
					'name'            => 'duration',
					'label'           => __( 'Duração', 'prime-poker' ),
					'instructions'    => __( 'Minutos e segundos (25:30) ou horas, minutos e segundos (1:05:00).', 'prime-poker' ),
					'type'            => 'text',
					'placeholder'     => '25:30',
					'required'        => 1,
					'wrapper'         => array( 'width' => '25' ),
					// Sai em segundos pelo `duration` da Aula; aqui seria o texto.
					'show_in_graphql' => 0,
				),
				array(
					'key'             => 'field_prime_lesson_minimum_tier',
					'name'            => Access::META_MINIMUM_TIER,
					'label'           => __( 'Tier mínimo', 'prime-poker' ),
					'instructions'    => __( 'Quem estiver abaixo vê a aula com cadeado e o convite para fazer upgrade.', 'prime-poker' ),
					'type'            => 'select',
					'choices'         => $tiers,
					'default_value'   => Tiers::FREE,
					'return_format'   => 'value',
					'required'        => 1,
					'wrapper'         => array( 'width' => '50' ),
					// Sai pelo `minimumTier` da Aula, que resolve tier inválido.
					'show_in_graphql' => 0,
				),
				array(
					'key'             => 'field_prime_lesson_video_provider',
					'name'            => 'video_provider',
					'label'           => __( 'Hospedagem do vídeo', 'prime-poker' ),
					'type'            => 'select',
					'choices'         => array( 'google_drive' => 'Google Drive' ),
					'default_value'   => 'google_drive',
					'return_format'   => 'value',
					'required'        => 1,
					'wrapper'         => array( 'width' => '50' ),
					// Protegido: sai só pelo `video` da Aula, que confere o tier.
					'show_in_graphql' => 0,
				),
				array(
					'key'             => self::KEY_VIDEO_ID,
					'name'            => 'video_id',
					'label'           => __( 'Vídeo', 'prime-poker' ),
					'instructions'    => __( 'Cole o link de compartilhamento do Google Drive (Compartilhar → Copiar link).', 'prime-poker' ),
					'type'            => 'text',
					'placeholder'     => 'https://drive.google.com/file/d/…/view',
					'required'        => 0,
					'show_in_graphql' => 0,
				),
				array(
					'key'             => 'field_prime_lesson_materials',
					'name'            => 'materials',
					'label'           => __( 'Material de apoio', 'prime-poker' ),
					'type'            => 'repeater',
					'layout'          => 'table',
					'button_label'    => __( 'Adicionar arquivo', 'prime-poker' ),
					'show_in_graphql' => 0,
					'sub_fields'      => array(
						array(
							'key'             => 'field_prime_lesson_material_name',
							'name'            => 'name',
							'label'           => __( 'Nome', 'prime-poker' ),
							'instructions'    => __( 'Opcional. Vazio usa o nome do arquivo.', 'prime-poker' ),
							'type'            => 'text',
							'parent_repeater' => 'field_prime_lesson_materials',
						),
						array(
							'key'             => 'field_prime_lesson_material_file',
							'name'            => 'file',
							'label'           => __( 'Arquivo', 'prime-poker' ),
							'type'            => 'file',
							'return_format'   => 'id',
							'required'        => 1,
							'parent_repeater' => 'field_prime_lesson_materials',
						),
					),
				),
			),
		);
	}

	/**
	 * Grupo `trackFields`, na tela da trilha.
	 *
	 * @return array<string, mixed>
	 */
	private static function track_group(): array {
		return array(
			'key'                => 'group_prime_track_fields',
			'title'              => __( 'Aparência da trilha', 'prime-poker' ),
			'active'             => true,
			'location'           => array(
				array(
					array(
						'param'    => 'taxonomy',
						'operator' => '==',
						'value'    => Content::TAXONOMY,
					),
				),
			),
			'show_in_graphql'    => 1,
			'graphql_field_name' => 'trackFields',
			'graphql_types'      => array( 'Trilha' ),
			'fields'             => array(
				array(
					'key'                => 'field_prime_track_badge',
					'name'               => 'badge',
					'label'              => __( 'Selo', 'prime-poker' ),
					'instructions'       => __( 'Nome curto no selo sobre a capa da aula. Vazio usa o nome da trilha.', 'prime-poker' ),
					'type'               => 'text',
					'maxlength'          => 16,
					'show_in_graphql'    => 1,
					'graphql_field_name' => 'badge',
				),
				array(
					'key'                => 'field_prime_track_color',
					'name'               => 'color',
					'label'              => __( 'Cor', 'prime-poker' ),
					'type'               => 'select',
					'choices'            => self::TRACK_COLORS,
					'default_value'      => 'vermelho',
					'return_format'      => 'value',
					'required'           => 1,
					'show_in_graphql'    => 1,
					'graphql_field_name' => 'color',
				),
				array(
					'key'                => 'field_prime_track_order',
					'name'               => 'order',
					'label'              => __( 'Ordem', 'prime-poker' ),
					'instructions'       => __( 'Posição no filtro de trilhas. Menor aparece primeiro.', 'prime-poker' ),
					'type'               => 'number',
					'default_value'      => 0,
					'step'               => 1,
					'show_in_graphql'    => 1,
					'graphql_field_name' => 'order',
				),
			),
		);
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Duração                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * `"25:30"` → 1530; `"1:05:00"` → 3900; `"1530"` → 1530. Inválido → null.
	 *
	 * Número puro vale como segundos: é o que já está gravado, e o ACF passa
	 * o valor salvo de volta por aqui quando a aula é salva sem mexer no campo.
	 *
	 * @param mixed $value Texto digitado.
	 */
	public static function parse_duration( $value ): ?int {
		$value = trim( (string) $value );

		if ( preg_match( '/^\d+$/', $value ) ) {
			return (int) $value;
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
			: __( 'Use minutos e segundos (25:30) ou horas, minutos e segundos (1:05:00).', 'prime-poker' );
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
	 * Recusa link que não é do Drive, em vez de salvar e só falhar no player.
	 *
	 * @param bool|string $valid Resultado até aqui.
	 * @param mixed       $value Valor digitado.
	 * @return bool|string
	 */
	public static function validate_video( $valid, $value ) {
		if ( true !== $valid || '' === trim( (string) $value ) ) {
			return $valid;
		}

		return null !== GraphQL::drive_file_id( trim( (string) $value ) )
			? true
			: __( 'Não reconheci este link. Use o link de compartilhamento do arquivo no Google Drive.', 'prime-poker' );
	}
}
