<?php
/**
 * Notificações no WPGraphQL.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Notifications;

use PrimePoker\Lessons\Access;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A caixa do jogador logado, e só dela.
 *
 * O CPT `notificacao` não é exposto pelo WPGraphQL (ver o JSON do ACF): tudo
 * sai por este tipo próprio, que só devolve o que o público-alvo permite. Um
 * CPT exposto com um filtro por cima seria uma porta a mais para esquecer de
 * trancar.
 */
final class GraphQL {

	/** Filtros da listagem, iguais aos valores que o front usa na URL. */
	private const FILTERS = array(
		'ALL'    => 'todas',
		'UNREAD' => 'nao-lidas',
		'READ'   => 'lidas',
	);

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'graphql_register_types', array( self::class, 'register' ) );
	}

	/**
	 * Declara o tipo, as consultas e as mutations.
	 */
	public static function register(): void {
		register_graphql_enum_type(
			'NotificationFilterEnum',
			array(
				'description' => __( 'Recorte da caixa de notificações.', 'prime-poker' ),
				'values'      => array(
					'ALL'    => array(
						'value'       => 'ALL',
						'description' => __( 'Todas.', 'prime-poker' ),
					),
					'UNREAD' => array(
						'value'       => 'UNREAD',
						'description' => __( 'Só as não lidas.', 'prime-poker' ),
					),
					'READ'   => array(
						'value'       => 'READ',
						'description' => __( 'Só as lidas.', 'prime-poker' ),
					),
				),
			)
		);

		register_graphql_object_type(
			'PlayerNotification',
			array(
				'description' => __( 'Uma notificação do jogador logado.', 'prime-poker' ),
				'fields'      => array(
					'id'          => array( 'type' => array( 'non_null' => 'Int' ) ),
					'type'        => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'aula, aviso ou suporte.', 'prime-poker' ),
					),
					'title'       => array( 'type' => array( 'non_null' => 'String' ) ),
					'description' => array( 'type' => array( 'non_null' => 'String' ) ),
					'date'        => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'Publicação, em ISO 8601.', 'prime-poker' ),
					),
					'read'        => array( 'type' => array( 'non_null' => 'Boolean' ) ),
					'href'        => array(
						'type'        => 'String',
						'description' => __( 'Destino ao clicar. null quando o aviso se esgota no texto.', 'prime-poker' ),
					),
				),
			)
		);

		register_graphql_field(
			'RootQuery',
			'myNotifications',
			array(
				'type'        => array( 'list_of' => array( 'non_null' => 'PlayerNotification' ) ),
				'description' => __( 'Notificações do jogador logado, da mais recente para a mais antiga.', 'prime-poker' ),
				'args'        => array(
					'filter' => array( 'type' => 'NotificationFilterEnum' ),
					'first'  => array(
						'type'        => 'Int',
						'description' => __( 'Quantas trazer. Sem valor, traz todas.', 'prime-poker' ),
					),
					'offset' => array( 'type' => 'Int' ),
				),
				'resolve'     => static function ( $root, array $args ): array {
					$user_id = self::player();

					if ( 0 === $user_id ) {
						return array();
					}

					$posts = Content::for_user(
						$user_id,
						self::FILTERS[ $args['filter'] ?? 'ALL' ] ?? 'todas',
						(int) ( $args['first'] ?? 0 ),
						(int) ( $args['offset'] ?? 0 )
					);

					$read = Content::read_ids( $user_id );

					return array_map(
						static fn( \WP_Post $post ): array => self::to_notification( $post, $read ),
						$posts
					);
				},
			)
		);

		register_graphql_field(
			'RootQuery',
			'notificationsUnread',
			array(
				'type'        => array( 'non_null' => 'Int' ),
				'description' => __( 'Quantas notificações o jogador logado ainda não leu. 0 para quem não é jogador.', 'prime-poker' ),
				'resolve'     => static function (): int {
					$user_id = self::player();

					return 0 === $user_id ? 0 : Content::unread_count( $user_id );
				},
			)
		);

		self::register_mutations();
	}

	/**
	 * Marcar uma e marcar todas.
	 */
	private static function register_mutations(): void {
		register_graphql_mutation(
			'markNotification',
			array(
				'description'         => __( 'Marca ou desmarca uma notificação como lida.', 'prime-poker' ),
				'inputFields'         => array(
					'notificationId' => array( 'type' => array( 'non_null' => 'Int' ) ),
					'read'           => array( 'type' => array( 'non_null' => 'Boolean' ) ),
				),
				'outputFields'        => array(
					'unread' => array( 'type' => 'Int' ),
				),
				'mutateAndGetPayload' => static function ( array $input ): array {
					$user_id = self::require_player();

					Content::mark( $user_id, (int) $input['notificationId'], (bool) $input['read'] );

					return array( 'unread' => Content::unread_count( $user_id ) );
				},
			)
		);

		register_graphql_mutation(
			'markAllNotificationsRead',
			array(
				'description'         => __( 'Marca como lidas todas as notificações que o jogador vê.', 'prime-poker' ),
				'inputFields'         => array(),
				'outputFields'        => array(
					'unread' => array( 'type' => 'Int' ),
				),
				'mutateAndGetPayload' => static function (): array {
					$user_id = self::require_player();

					Content::mark_all( $user_id );

					return array( 'unread' => Content::unread_count( $user_id ) );
				},
			)
		);
	}

	/* ---------------------------------------------------------------------- */
	/*                                Auxiliares                              */
	/* ---------------------------------------------------------------------- */

	/**
	 * Post → o formato que o front lê.
	 *
	 * @param \WP_Post        $post Notificação.
	 * @param array<int, int> $read IDs já lidos.
	 * @return array<string, mixed>
	 */
	private static function to_notification( \WP_Post $post, array $read ): array {
		$type = (string) get_post_meta( $post->ID, Content::META_TYPE, true );
		$link = trim( (string) get_post_meta( $post->ID, Content::META_LINK, true ) );

		return array(
			'id'          => $post->ID,
			'type'        => in_array( $type, Content::TYPES, true ) ? $type : 'aviso',
			'title'       => $post->post_title,
			'description' => (string) get_post_meta( $post->ID, Content::META_DESCRIPTION, true ),
			'date'        => get_post_time( 'c', false, $post ),
			'read'        => in_array( $post->ID, $read, true ),
			// Só caminho do próprio site: um destino externo gravado por
			// engano viraria um link para fora de dentro da área do jogador.
			'href'        => str_starts_with( $link, '/' ) ? $link : null,
		);
	}

	/**
	 * ID do jogador logado, ou 0.
	 */
	private static function player(): int {
		return Access::can_browse() ? get_current_user_id() : 0;
	}

	/**
	 * ID do jogador logado, ou erro.
	 *
	 * @throws \GraphQL\Error\UserError Se não for jogador.
	 */
	private static function require_player(): int {
		$user_id = self::player();

		if ( 0 === $user_id ) {
			throw new \GraphQL\Error\UserError( __( 'É preciso estar logado como jogador.', 'prime-poker' ) );
		}

		return $user_id;
	}
}
