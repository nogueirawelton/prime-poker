<?php
/**
 * Exposição do tier no WPGraphQL.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Leva o tier até o front headless.
 *
 * O WPGraphQL já expõe `roles` e `capabilities` do usuário; estes campos
 * existem para o front não precisar saber quais slugs de role são tiers nem
 * reimplementar a hierarquia. O gate de acesso no front deve continuar sendo
 * por capability (`view_content_gold`), não pelo slug do tier.
 */
final class GraphQL {

	/**
	 * Registra os hooks.
	 *
	 * A action só existe quando o WPGraphQL está ativo, então não é preciso
	 * checar a dependência: sem ele, isto simplesmente nunca roda.
	 */
	public static function boot(): void {
		add_action( 'graphql_register_types', array( self::class, 'register' ) );
	}

	/**
	 * Declara os campos no tipo User.
	 */
	public static function register(): void {
		register_graphql_field(
			'User',
			'playerTier',
			array(
				'type'        => 'String',
				'description' => __( 'Slug do tier do jogador (player_free, player_gold...).', 'prime-poker' ),
				'resolve'     => static function ( $user ) {
					$user_id = self::user_id( $user );

					return self::can_view( $user_id ) ? Membership::get_tier( $user_id ) : null;
				},
			)
		);

		register_graphql_field(
			'User',
			'playerTierLabel',
			array(
				'type'        => 'String',
				'description' => __( 'Nome de exibição do tier do jogador.', 'prime-poker' ),
				'resolve'     => static function ( $user ) {
					$user_id = self::user_id( $user );

					if ( ! self::can_view( $user_id ) ) {
						return null;
					}

					$tier = Membership::get_tier( $user_id );

					return null === $tier ? null : Tiers::label( $tier );
				},
			)
		);

		register_graphql_field(
			'User',
			'playerTierExpiresAt',
			array(
				'type'        => 'String',
				'description' => __( 'Expiração do tier em ISO 8601 (UTC), ou null se não expira.', 'prime-poker' ),
				'resolve'     => static function ( $user ) {
					$user_id = self::user_id( $user );

					if ( ! self::can_view( $user_id ) ) {
						return null;
					}

					$expira = Membership::expires_at( $user_id );

					return null === $expira ? null : gmdate( 'c', $expira );
				},
			)
		);
	}

	/**
	 * ID do usuário a partir do model do WPGraphQL.
	 *
	 * @param mixed $user Model de usuário do WPGraphQL.
	 */
	private static function user_id( $user ): int {
		return isset( $user->databaseId ) ? (int) $user->databaseId : 0;
	}

	/**
	 * Quem pode ler o tier de um usuário.
	 *
	 * Só o próprio jogador e quem administra usuários. O tier é informação
	 * comercial: sem esta trava, qualquer consulta pública ao tipo User
	 * listaria quem paga por qual plano.
	 *
	 * @param int $user_id ID do usuário consultado.
	 */
	private static function can_view( int $user_id ): bool {
		if ( 0 === $user_id ) {
			return false;
		}

		return get_current_user_id() === $user_id || current_user_can( 'list_users' );
	}
}
