<?php
/**
 * Desinstalação: remove as roles sem deixar usuário órfão.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// O plugin não está carregado aqui, então nem o autoloader nem os hooks
// existem. Carregar só as definições evita repetir a lista de tiers e sair do
// ar com ela desatualizada.
require_once __DIR__ . '/includes/Players/Tiers.php';

use PrimePoker\Players\Tiers;

/**
 * Role de destino de quem perder o tier.
 *
 * Remover a role sem remapear deixaria os jogadores SEM role nenhuma — contas
 * que continuam existindo, conseguem logar e não podem fazer nada.
 */
$prime_fallback = 'subscriber';

foreach ( Tiers::slugs() as $prime_tier ) {
	// Em lotes: uma base grande de jogadores estouraria a memória de uma vez.
	do {
		$prime_users = get_users(
			array(
				'role'   => $prime_tier,
				'number' => 200,
				'fields' => 'ID',
			)
		);

		foreach ( $prime_users as $prime_user_id ) {
			$prime_user = new WP_User( (int) $prime_user_id );
			$prime_user->remove_role( $prime_tier );

			if ( array() === $prime_user->roles ) {
				$prime_user->add_role( $prime_fallback );
			}
		}
	} while ( count( $prime_users ) >= 200 );

	remove_role( $prime_tier );
}

delete_option( 'prime_players_roles_version' );

wp_clear_scheduled_hook( 'prime_players_check_expirations' );

global $wpdb;

$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->usermeta} WHERE meta_key LIKE %s",
		$wpdb->esc_like( '_prime_player_' ) . '%'
	)
);
