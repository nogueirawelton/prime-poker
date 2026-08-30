<?php
/**
 * Coluna de tier na lista de usuários.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mostra tier e expiração na lista de usuários do painel.
 *
 * Não há filtro próprio de propósito: o WordPress já cria links de filtro por
 * role no topo da lista ("Player Gold (12)"), e duplicar isso só somaria
 * interface. O que falta ali é a data de expiração — é o que esta coluna
 * acrescenta.
 */
final class Admin {

	private const COLUMN = 'prime_player_tier';

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_filter( 'manage_users_columns', array( self::class, 'add_column' ) );
		add_filter( 'manage_users_custom_column', array( self::class, 'render_column' ), 10, 3 );
	}

	/**
	 * Acrescenta a coluna.
	 *
	 * @param array<string, string> $columns Colunas atuais.
	 * @return array<string, string>
	 */
	public static function add_column( array $columns ): array {
		$columns[ self::COLUMN ] = __( 'Tier', 'prime-poker' );

		return $columns;
	}

	/**
	 * Preenche a coluna.
	 *
	 * @param string $output  Conteúdo já renderizado por outro handler.
	 * @param string $column  Coluna sendo renderizada.
	 * @param int    $user_id ID do usuário da linha.
	 */
	public static function render_column( string $output, string $column, int $user_id ): string {
		if ( self::COLUMN !== $column ) {
			return $output;
		}

		$tier = Membership::get_tier( $user_id );

		if ( null === $tier ) {
			return '—';
		}

		$linhas = array( esc_html( Tiers::label( $tier ) ) );
		$expira = Membership::expires_at( $user_id );

		if ( null !== $expira ) {
			$data = wp_date( (string) get_option( 'date_format' ), $expira );

			$linhas[] = sprintf(
				'<small style="color:%s">%s</small>',
				$expira <= time() ? '#b32d2e' : '#646970',
				esc_html(
					$expira <= time()
						/* translators: %s: data de expiração. */
						? sprintf( __( 'expirado em %s', 'prime-poker' ), $data )
						/* translators: %s: data de expiração. */
						: sprintf( __( 'expira em %s', 'prime-poker' ), $data )
				)
			);
		}

		return implode( '<br>', $linhas );
	}
}
