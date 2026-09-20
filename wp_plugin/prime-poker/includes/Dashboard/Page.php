<?php
/**
 * Painel de acompanhamento da área do jogador.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Dashboard;

use PrimePoker\Players\Tiers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A tela "Prime Poker" no painel do WordPress.
 *
 * Três abas: **Visão geral** (os números e as dúvidas em aberto), **Aulas**
 * (o que rende) e **Jogadores** (quem é quem). A divisão é essa porque são
 * três perguntas diferentes — "como vai o mês", "o que gravar em seguida" e
 * "com quem falar" — e misturá-las numa tela só deixaria nenhuma respondida.
 *
 * As dúvidas sem resposta ficam no topo da primeira aba, e não num relatório:
 * é o único número daqui que pede uma ação hoje. O resto é acompanhamento.
 *
 * **Duas permissões.** A tela pede `edit_posts`, que é a equipe. A aba de
 * jogadores pede `list_users`, porque ali aparecem e-mail e WhatsApp de
 * gente real — quem edita aulas não precisa disso para editar aulas.
 */
final class Page {

	/** Slug da página no menu. */
	public const SLUG = 'prime-poker';

	/** Quem entra na tela. */
	public const CAP = 'edit_posts';

	/** Quem vê dados pessoais de jogador. */
	public const CAP_PLAYERS = 'list_users';

	/** As abas, na ordem em que aparecem. */
	private const TABS = array(
		'geral'     => 'Visão geral',
		'aulas'     => 'Aulas',
		'jogadores' => 'Jogadores',
	);

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'admin_menu', array( self::class, 'register' ) );
	}

	/**
	 * Põe a tela no menu.
	 */
	public static function register(): void {
		add_menu_page(
			__( 'Prime Poker', 'prime-poker' ),
			__( 'Prime Poker', 'prime-poker' ),
			self::CAP,
			self::SLUG,
			array( self::class, 'render' ),
			'dashicons-chart-area',
			3
		);
	}

	/** Endereço de uma aba. */
	public static function url( string $tab = 'geral', array $extra = array() ): string {
		return add_query_arg(
			array_merge( array( 'page' => self::SLUG, 'aba' => $tab ), $extra ),
			admin_url( 'admin.php' )
		);
	}

	/**
	 * Desenha a tela.
	 */
	public static function render(): void {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( esc_html__( 'Sem permissão para ver este painel.', 'prime-poker' ) );
		}

		$tab = isset( $_GET['aba'] ) ? sanitize_key( wp_unslash( $_GET['aba'] ) ) : 'geral';

		if ( ! isset( self::TABS[ $tab ] ) ) {
			$tab = 'geral';
		}

		// O recálculo é um GET com nonce: é uma ação, e sem o nonce qualquer
		// link colado no chat faria a equipe refazer a conta sem querer.
		$refresh = isset( $_GET['atualizar'] )
			&& isset( $_GET['_wpnonce'] )
			&& wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'prime_poker_refresh' );

		$stats = Stats::snapshot( $refresh );

		echo '<div class="wrap">';
		echo '<h1>' . esc_html__( 'Prime Poker', 'prime-poker' ) . '</h1>';

		self::tabs( $tab );
		self::freshness( $stats );

		if ( 'aulas' === $tab ) {
			View::lessons( $stats );
		} elseif ( 'jogadores' === $tab ) {
			if ( current_user_can( self::CAP_PLAYERS ) ) {
				View::players( $stats );
			} else {
				echo '<p>' . esc_html__( 'Só quem administra usuários vê os dados dos jogadores.', 'prime-poker' ) . '</p>';
			}
		} else {
			View::overview( $stats );
		}

		echo '</div>';
	}

	/**
	 * A barra de abas.
	 *
	 * @param string $current Aba ativa.
	 */
	private static function tabs( string $current ): void {
		echo '<nav class="nav-tab-wrapper">';

		foreach ( self::TABS as $slug => $label ) {
			if ( 'jogadores' === $slug && ! current_user_can( self::CAP_PLAYERS ) ) {
				continue;
			}

			printf(
				'<a href="%s" class="nav-tab%s">%s</a>',
				esc_url( self::url( $slug ) ),
				$slug === $current ? ' nav-tab-active' : '',
				esc_html( $label )
			);
		}

		echo '</nav>';
	}

	/**
	 * De quando são os números, e o botão de refazer a conta.
	 *
	 * Dizer a hora não é enfeite: sem ela, quem acabou de publicar uma aula
	 * olharia um retrato de quinze minutos atrás achando que é agora.
	 *
	 * @param array<string, mixed> $stats Retrato.
	 */
	private static function freshness( array $stats ): void {
		$generated = (int) ( $stats['generated_at'] ?? 0 );

		printf(
			'<p class="description" style="margin:12px 0 16px">%s &nbsp;<a class="button button-small" href="%s">%s</a></p>',
			esc_html(
				sprintf(
					/* translators: %s: há quanto tempo os números foram calculados. */
					__( 'Números de %s atrás.', 'prime-poker' ),
					human_time_diff( $generated, time() )
				)
			),
			esc_url( wp_nonce_url( self::url( isset( $_GET['aba'] ) ? sanitize_key( wp_unslash( $_GET['aba'] ) ) : 'geral', array( 'atualizar' => 1 ) ), 'prime_poker_refresh' ) ),
			esc_html__( 'Atualizar agora', 'prime-poker' )
		);
	}

	/**
	 * Rótulo de um tier pelo slug, para as tabelas.
	 *
	 * @param string $slug Slug do tier.
	 */
	public static function tier_label( string $slug ): string {
		return Tiers::exists( $slug ) ? Tiers::label( $slug ) : $slug;
	}
}
