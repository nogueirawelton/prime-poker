<?php
/**
 * Definição dos tipos de jogador (tiers).
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fonte de verdade única dos tiers.
 *
 * Nenhum outro arquivo deve listar tiers ou capabilities na mão: tudo sai
 * daqui. Criar um tier novo é acrescentar uma linha em DEFINITIONS e subir a
 * ROLES_VERSION no arquivo principal.
 */
final class Tiers {

	public const FREE     = 'player_free';
	public const BASIC    = 'player_basic';
	public const GOLD     = 'player_gold';
	public const PLATINUM = 'player_platinum';

	/**
	 * Capability presente em TODOS os tiers.
	 *
	 * Serve para responder "esta pessoa é jogador?" sem precisar comparar
	 * nomes de role — é o portão da área do jogador como um todo.
	 */
	public const CAP_PLAYER_AREA = 'access_player_area';

	/**
	 * Os tiers, do mais baixo para o mais alto.
	 *
	 * A ORDEM importa: as capabilities são cumulativas na ordem desta lista,
	 * então cada tier ganha as capabilities de todos os anteriores mais as
	 * suas. É isso que permite gatear por capability ("pode ver conteúdo
	 * gold?") em vez de por nome de role ("é gold OU platinum?"), e é o que
	 * faz um tier intermediário novo não exigir mudança em nenhum `if`.
	 *
	 * Os slugs são PERMANENTES: renomear um deixa os usuários existentes com
	 * uma role órfã, que não existe mais e não concede nada — sem erro visível.
	 */
	private const DEFINITIONS = array(
		self::FREE     => array(
			'label' => 'Player Free',
			'caps'  => array( 'view_content_free' ),
		),
		self::BASIC    => array(
			'label' => 'Player Basic',
			'caps'  => array( 'view_content_basic' ),
		),
		self::GOLD     => array(
			'label' => 'Player Gold',
			'caps'  => array( 'view_content_gold' ),
		),
		self::PLATINUM => array(
			'label' => 'Player Platinum',
			'caps'  => array( 'view_content_platinum' ),
		),
	);

	/**
	 * Capabilities que todo tier recebe.
	 *
	 * `read` é o mínimo que o WP espera de um usuário logado; sem ela algumas
	 * checagens internas tratam a conta como visitante.
	 */
	private const BASE_CAPS = array(
		'read'                 => true,
		self::CAP_PLAYER_AREA  => true,
	);

	/**
	 * Definições cruas, já passadas pelo filtro de extensão.
	 *
	 * @return array<string, array{label: string, caps: array<int, string>}>
	 */
	private static function definitions(): array {
		/**
		 * Permite acrescentar tiers sem editar o plugin.
		 *
		 * A ordem do array continua definindo a hierarquia: um tier inserido
		 * no meio herda quem vem antes dele.
		 *
		 * @param array $definitions Definições dos tiers.
		 */
		$definitions = apply_filters( 'prime_players_tiers', self::DEFINITIONS );

		return is_array( $definitions ) ? $definitions : self::DEFINITIONS;
	}

	/**
	 * Todos os tiers com as capabilities já resolvidas (acumuladas).
	 *
	 * @return array<string, array{label: string, caps: array<string, bool>, level: int}>
	 */
	public static function all(): array {
		$tiers      = array();
		$acumuladas = self::BASE_CAPS;
		$nivel      = 0;

		foreach ( self::definitions() as $slug => $definicao ) {
			foreach ( $definicao['caps'] as $cap ) {
				$acumuladas[ $cap ] = true;
			}

			$tiers[ $slug ] = array(
				'label' => $definicao['label'],
				'caps'  => $acumuladas,
				'level' => $nivel,
			);

			++$nivel;
		}

		return $tiers;
	}

	/**
	 * Slugs dos tiers, do mais baixo para o mais alto.
	 *
	 * @return array<int, string>
	 */
	public static function slugs(): array {
		return array_keys( self::definitions() );
	}

	/**
	 * O tier existe?
	 *
	 * @param string $tier Slug do tier.
	 */
	public static function exists( string $tier ): bool {
		return isset( self::definitions()[ $tier ] );
	}

	/**
	 * Nome de exibição do tier.
	 *
	 * @param string $tier Slug do tier.
	 */
	public static function label( string $tier ): string {
		return self::definitions()[ $tier ]['label'] ?? $tier;
	}

	/**
	 * Posição do tier na hierarquia — quanto maior, mais alto.
	 *
	 * Devolve -1 para tier desconhecido, para que qualquer comparação de
	 * "é maior que" falhe em vez de dar um falso positivo.
	 *
	 * @param string $tier Slug do tier.
	 */
	public static function level( string $tier ): int {
		return self::all()[ $tier ]['level'] ?? -1;
	}

	/**
	 * Capabilities acumuladas de um tier, no formato que o `add_role` espera.
	 *
	 * @param string $tier Slug do tier.
	 * @return array<string, bool>
	 */
	public static function capabilities( string $tier ): array {
		return self::all()[ $tier ]['caps'] ?? array();
	}

	/**
	 * Todas as capabilities que ESTE plugin administra.
	 *
	 * A sincronização usa esta lista para saber o que pode remover de uma
	 * role: uma capability adicionada por outro plugin não está aqui e por
	 * isso sobrevive a um resync.
	 *
	 * @return array<int, string>
	 */
	public static function managed_capabilities(): array {
		$caps = array_keys( self::BASE_CAPS );

		foreach ( self::definitions() as $definicao ) {
			foreach ( $definicao['caps'] as $cap ) {
				$caps[] = $cap;
			}
		}

		return array_values( array_unique( $caps ) );
	}
}
