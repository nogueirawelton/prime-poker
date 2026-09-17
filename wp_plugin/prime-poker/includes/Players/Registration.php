<?php
/**
 * Atribuição do tier inicial no cadastro.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Todo cadastro novo entra como Player Free.
 *
 * A atribuição acontece no `user_register` em vez de trocar a option
 * `default_role` do site por dois motivos: mudar o padrão global afetaria
 * qualquer outro caminho de criação de usuário, e o `registerUser` do
 * WPGraphQL IGNORA a role enviada na mutation — ele força
 * `get_option( 'default_role' )`. Interceptar depois da criação é o único
 * ponto que cobre os dois casos.
 */
final class Registration {

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'user_register', array( self::class, 'assign_default_tier' ) );
	}

	/**
	 * Coloca o usuário recém-criado no tier inicial.
	 *
	 * @param int $user_id ID do usuário criado.
	 */
	public static function assign_default_tier( int $user_id ): void {
		$user = get_userdata( $user_id );

		if ( ! $user instanceof \WP_User ) {
			return;
		}

		// Já veio com tier (um admin criou a conta direto como Gold, por
		// exemplo): respeita a escolha de quem criou.
		if ( null !== Membership::get_tier( $user_id ) ) {
			return;
		}

		// Usuário de equipe criado pelo painel com outra role (editor, autor):
		// não é jogador, não recebe tier.
		$default_role = (string) get_option( 'default_role' );
		$other_roles = array_diff( $user->roles, array( $default_role, '' ) );

		if ( array() !== $other_roles ) {
			return;
		}

		/**
		 * Tier de entrada de um cadastro novo.
		 *
		 * @param string $tier    Slug do tier.
		 * @param int    $user_id ID do usuário.
		 */
		$tier = (string) apply_filters( 'prime_players_default_tier', Tiers::FREE, $user_id );

		if ( ! Membership::set_tier( $user_id, $tier, null, 'registration' ) ) {
			return;
		}

		// Sem isso todo jogador acumularia também a role padrão do site
		// (normalmente `subscriber`), que não concede nada de útil aqui e
		// polui a lista de usuários.
		if ( '' !== $default_role && ! Tiers::exists( $default_role ) ) {
			$user = get_userdata( $user_id );

			if ( $user instanceof \WP_User && in_array( $default_role, $user->roles, true ) ) {
				$user->remove_role( $default_role );
			}
		}
	}
}
