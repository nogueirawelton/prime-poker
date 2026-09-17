<?php
/**
 * Rebaixamento automático de tiers vencidos.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cron diário que devolve ao tier básico quem passou da data de expiração.
 *
 * É a metade "ciclo de vida" do modelo: a role sozinha não sabe vencer, então
 * alguém precisa olhar o metadado de expiração periodicamente.
 */
final class Expiration {

	public const HOOK = 'prime_players_check_expirations';

	/**
	 * Quantos usuários rebaixar por execução.
	 *
	 * Evita estourar tempo/memória num lote grande. Quando o lote enche, uma
	 * execução extra é agendada logo em seguida em vez de deixar o resto para
	 * o dia seguinte.
	 */
	private const BATCH = 200;

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( self::HOOK, array( self::class, 'run' ) );

		// Rede de segurança: restore de banco e reativação por script podem
		// deixar o plugin ativo sem o agendamento.
		self::schedule();
	}

	/**
	 * Agenda a verificação diária, se ainda não estiver agendada.
	 */
	public static function schedule(): void {
		if ( wp_next_scheduled( self::HOOK ) ) {
			return;
		}

		wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', self::HOOK );
	}

	/**
	 * Cancela o agendamento.
	 */
	public static function unschedule(): void {
		wp_clear_scheduled_hook( self::HOOK );
	}

	/**
	 * Rebaixa os tiers vencidos.
	 */
	public static function run(): void {
		/**
		 * Tier para o qual um jogador vencido é rebaixado.
		 *
		 * @param string $tier Slug do tier.
		 */
		$destination = (string) apply_filters( 'prime_players_expiration_tier', Tiers::FREE );

		if ( ! Tiers::exists( $destination ) ) {
			return;
		}

		$expired = get_users(
			array(
				'role__in'   => array_values( array_diff( Tiers::slugs(), array( $destination ) ) ),
				'meta_query' => array(
					array(
						'key'     => Membership::META_EXPIRES,
						'value'   => time(),
						'compare' => '<=',
						'type'    => 'NUMERIC',
					),
				),
				'number'     => self::BATCH,
				'fields'     => 'ID',
			)
		);

		foreach ( $expired as $user_id ) {
			Membership::set_tier( (int) $user_id, $destination, null, 'expiration' );
		}

		// Lote cheio quase certamente significa que sobrou fila.
		if ( count( $expired ) >= self::BATCH ) {
			wp_schedule_single_event( time() + MINUTE_IN_SECONDS, self::HOOK );
		}
	}
}
