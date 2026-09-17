<?php
/**
 * Plugin Name:       Prime Poker
 * Plugin URI:        https://primepokerteam.com.br
 * Description:       Customizações do WordPress para o Prime Poker Team: tipos de jogador (tiers), cadastro headless, autenticação, redefinição de senha e revalidação do cache do front.
 * Version:           1.8.0
 * Requires at least: 6.4
 * Requires PHP:      8.1
 * Author:            Prime Poker Team
 * License:           GPL-2.0-or-later
 * Text Domain:       prime-poker
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const VERSION = '1.8.0';

/**
 * Versão das DEFINIÇÕES de roles — independente da versão do plugin.
 *
 * Roles vivem no banco, não no código: o WordPress grava `wp_user_roles` uma
 * vez e nunca mais consulta o arquivo. Suba este número sempre que mexer em
 * tiers, labels ou capabilities em Players/Tiers.php, senão a mudança não
 * chega ao banco e o ambiente continua com as roles antigas, sem nenhum aviso.
 */
const ROLES_VERSION = '1.0.0';

/**
 * Sobre os prefixos `prime_players_` / `_prime_player_`.
 *
 * O plugin passou a se chamar apenas "Prime Poker", mas as options, os hooks e
 * os metadados MANTIVERAM os nomes antigos de propósito: os metadados guardam
 * dados reais de jogadores (início e expiração do tier), e renomeá-los pediria
 * uma migração — risco sem retorno para uma mudança cosmética.
 *
 * Eles também não são resquício: nomeiam o domínio "jogador", que agora vive
 * em `PrimePoker\Players`. Áreas novas do plugin usam `prime_poker_`.
 */

/**
 * Autoloader PSR-4 do namespace do plugin.
 *
 * `PrimePoker\Players\Tiers` resolve para `includes/Players/Tiers.php`, então
 * cada área nova do plugin ganha a própria pasta sem tocar aqui.
 */
spl_autoload_register(
	static function ( string $class ): void {
		$prefixo = __NAMESPACE__ . '\\';

		if ( ! str_starts_with( $class, $prefixo ) ) {
			return;
		}

		$relativo = substr( $class, strlen( $prefixo ) );
		$arquivo  = __DIR__ . '/includes/' . str_replace( '\\', '/', $relativo ) . '.php';

		if ( is_readable( $arquivo ) ) {
			require_once $arquivo;
		}
	}
);

register_activation_hook( __FILE__, array( Players\Installer::class, 'activate' ) );
register_deactivation_hook( __FILE__, array( Players\Installer::class, 'deactivate' ) );

add_action(
	'plugins_loaded',
	static function (): void {
		// Antes de tudo: os outros módulos assumem que as roles existem.
		Players\Installer::maybe_sync();

		Players\Auth::boot();
		Players\Registration::boot();
		Players\Signup::boot();
		Players\Expiration::boot();
		Players\Admin::boot();
		Players\Headless::boot();
		Players\GraphQL::boot();
		Players\PasswordReset::boot();

		Blog\GraphQL::boot();

		Cache\Revalidation::boot();
	}
);
