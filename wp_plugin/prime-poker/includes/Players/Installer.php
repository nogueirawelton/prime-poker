<?php
/**
 * Criação e sincronização das roles no banco.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mantém as roles do banco iguais às definições em Tiers.
 *
 * Roles do WordPress NÃO são declarativas: `add_role()` grava uma vez em
 * `wp_options.wp_user_roles` e nunca mais olha para o código. Registrar só no
 * hook de ativação faria qualquer mudança posterior nas capabilities ficar
 * invisível até alguém desativar e reativar o plugin — por isso a versão das
 * definições é comparada a cada carregamento e o resync roda sozinho.
 */
final class Installer {

	private const VERSION_OPTION = 'prime_players_roles_version';

	/**
	 * Ativação do plugin.
	 */
	public static function activate(): void {
		self::sync();
		Expiration::schedule();
	}

	/**
	 * Desativação do plugin.
	 *
	 * Remove apenas o agendamento. Desativar plugin é rotina de debug e de
	 * atualização: não pode destruir dados. As roles e os metadados dos
	 * jogadores continuam no banco — quem limpa é o uninstall.php.
	 */
	public static function deactivate(): void {
		Expiration::unschedule();
	}

	/**
	 * Sincroniza só quando as definições mudaram.
	 */
	public static function maybe_sync(): void {
		if ( get_option( self::VERSION_OPTION ) === \PrimePoker\ROLES_VERSION ) {
			return;
		}

		self::sync();
	}

	/**
	 * Aplica as definições de Tiers às roles do banco.
	 */
	public static function sync(): void {
		$managed = Tiers::managed_capabilities();

		foreach ( Tiers::all() as $slug => $tier ) {
			$role = get_role( $slug );

			if ( ! $role instanceof \WP_Role ) {
				add_role( $slug, $tier['label'], $tier['caps'] );
				continue;
			}

			foreach ( array_keys( $tier['caps'] ) as $cap ) {
				if ( empty( $role->capabilities[ $cap ] ) ) {
					$role->add_cap( $cap );
				}
			}

			// Remove só o que é nosso e não pertence mais a este tier: uma
			// capability concedida por outro plugin não está na lista
			// administrada e por isso sobrevive.
			foreach ( $managed as $cap ) {
				if ( isset( $role->capabilities[ $cap ] ) && ! isset( $tier['caps'][ $cap ] ) ) {
					$role->remove_cap( $cap );
				}
			}

			self::rename( $slug, $tier['label'] );
		}

		update_option( self::VERSION_OPTION, \PrimePoker\ROLES_VERSION );
	}

	/**
	 * Atualiza o nome de exibição de uma role já existente.
	 *
	 * A WP_Role não expõe API para renomear — o nome mora na option
	 * `wp_user_roles`, não no objeto. A alternativa seria `remove_role()` +
	 * `add_role()`, que apagaria as capabilities que outros plugins tenham
	 * adicionado, então escrevemos direto na estrutura do WP_Roles.
	 *
	 * @param string $slug  Slug da role.
	 * @param string $label Nome de exibição desejado.
	 */
	private static function rename( string $slug, string $label ): void {
		$roles = wp_roles();

		if ( ! isset( $roles->roles[ $slug ] ) || $roles->roles[ $slug ]['name'] === $label ) {
			return;
		}

		$roles->roles[ $slug ]['name'] = $label;
		$roles->role_names[ $slug ]    = $label;

		update_option( $roles->role_key, $roles->roles );
	}
}
