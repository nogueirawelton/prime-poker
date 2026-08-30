<?php
/**
 * API pública: ler e trocar o tier de um jogador.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ciclo de vida do tier de um usuário.
 *
 * A role é a fonte de verdade da PERMISSÃO — é ela que o `current_user_can()`
 * e o WPGraphQL enxergam. Os metadados guardam o CICLO DE VIDA (quando
 * começou, quando expira, de onde veio), que a role sozinha não registra.
 *
 * Toda troca de tier deve passar por `set_tier()`: é o único lugar que mantém
 * role e metadados coerentes e dispara o hook de mudança.
 */
final class Membership {

	public const META_STARTED = '_prime_player_tier_started_at';
	public const META_EXPIRES = '_prime_player_tier_expires_at';
	public const META_SOURCE  = '_prime_player_tier_source';

	/**
	 * Tier atual do usuário, ou null se ele não for jogador.
	 *
	 * @param int $user_id ID do usuário.
	 */
	public static function get_tier( int $user_id ): ?string {
		$user = get_userdata( $user_id );

		if ( ! $user instanceof \WP_User ) {
			return null;
		}

		// Do mais alto para o mais baixo: se um usuário acabar com duas roles
		// de tier (importação, script antigo), o maior é o que vale.
		foreach ( array_reverse( Tiers::slugs() ) as $slug ) {
			if ( in_array( $slug, $user->roles, true ) ) {
				return $slug;
			}
		}

		return null;
	}

	/**
	 * Define o tier do usuário.
	 *
	 * @param int      $user_id    ID do usuário.
	 * @param string   $tier       Slug do tier de destino.
	 * @param int|null $expires_at Timestamp UTC de expiração, ou null para vitalício.
	 * @param string   $source     Origem da mudança ('registration', 'manual', 'expiration'...).
	 * @return bool Falso se o tier ou o usuário não existirem.
	 */
	public static function set_tier( int $user_id, string $tier, ?int $expires_at = null, string $source = 'manual' ): bool {
		if ( ! Tiers::exists( $tier ) ) {
			return false;
		}

		$user = get_userdata( $user_id );

		if ( ! $user instanceof \WP_User ) {
			return false;
		}

		$anterior = self::get_tier( $user_id );

		// Remove só as OUTRAS roles de tier. `set_role()` apagaria qualquer
		// role adicional — um jogador que também seja editor perderia o acesso
		// ao painel.
		foreach ( Tiers::slugs() as $slug ) {
			if ( $slug !== $tier && in_array( $slug, $user->roles, true ) ) {
				$user->remove_role( $slug );
			}
		}

		if ( ! in_array( $tier, $user->roles, true ) ) {
			$user->add_role( $tier );
		}

		if ( $anterior !== $tier ) {
			update_user_meta( $user_id, self::META_STARTED, time() );
		}

		if ( null === $expires_at ) {
			delete_user_meta( $user_id, self::META_EXPIRES );
		} else {
			update_user_meta( $user_id, self::META_EXPIRES, $expires_at );
		}

		update_user_meta( $user_id, self::META_SOURCE, $source );

		if ( $anterior !== $tier ) {
			/**
			 * Disparado quando o tier de um jogador muda.
			 *
			 * Ponto de integração para e-mail transacional, CRM e gateway de
			 * pagamento — sem ele, cada integração futura teria que caçar
			 * todos os lugares que trocam role.
			 *
			 * @param int         $user_id  ID do usuário.
			 * @param string      $tier     Novo tier.
			 * @param string|null $anterior Tier anterior, ou null se não havia.
			 * @param string      $source   Origem da mudança.
			 */
			do_action( 'prime_player_tier_changed', $user_id, $tier, $anterior, $source );
		}

		return true;
	}

	/**
	 * Timestamp UTC de expiração do tier, ou null se não expira.
	 *
	 * @param int $user_id ID do usuário.
	 */
	public static function expires_at( int $user_id ): ?int {
		$valor = get_user_meta( $user_id, self::META_EXPIRES, true );

		return '' === $valor || null === $valor ? null : (int) $valor;
	}

	/**
	 * O tier já venceu?
	 *
	 * Só indica que o rebaixamento está pendente: quem efetivamente rebaixa é
	 * o cron em Expiration.
	 *
	 * @param int $user_id ID do usuário.
	 */
	public static function is_expired( int $user_id ): bool {
		$expira = self::expires_at( $user_id );

		return null !== $expira && $expira <= time();
	}

	/**
	 * O usuário tem pelo menos o tier informado?
	 *
	 * Atalho de leitura para relatórios e telas administrativas. Para decidir
	 * ACESSO prefira `user_can( $user, 'view_content_gold' )`: a checagem por
	 * capability não precisa ser reescrita quando um tier novo entra no meio
	 * da hierarquia.
	 *
	 * @param int    $user_id ID do usuário.
	 * @param string $tier    Slug do tier mínimo.
	 */
	public static function has_at_least( int $user_id, string $tier ): bool {
		$atual = self::get_tier( $user_id );

		if ( null === $atual || ! Tiers::exists( $tier ) ) {
			return false;
		}

		return Tiers::level( $atual ) >= Tiers::level( $tier );
	}
}
