<?php
/**
 * O HTML das abas do painel.
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
 * Desenho das três abas.
 *
 * Separado de `Page` para a página cuidar de permissão, aba ativa e cache, e
 * isto cuidar só de mostrar. Tudo sai com as classes do próprio painel do
 * WordPress (`widefat`, `nav-tab`, `button`): tela de administração que
 * inventa visual próprio envelhece sozinha a cada versão do WP.
 */
final class View {

	/* ---------------------------------------------------------------------- */
	/*                              Visão geral                               */
	/* ---------------------------------------------------------------------- */

	/**
	 * Os números do mês e as dúvidas em aberto.
	 *
	 * @param array<string, mixed> $stats Retrato.
	 */
	public static function overview( array $stats ): void {
		$players  = $stats['players'];
		$lessons  = $stats['lessons'];
		$activity = $stats['activity'];

		$views      = array_sum( array_column( $lessons, 'views' ) );
		$completions = array_sum( array_column( $lessons, 'completed' ) );
		$open        = $stats['questions']['unanswered'];

		self::cards(
			array(
				array( __( 'Jogadores', 'prime-poker' ), count( $players ) ),
				array( __( 'Novos em 30 dias', 'prime-poker' ), $activity['new_30'] ),
				array( __( 'Ativos em 7 dias', 'prime-poker' ), $activity['active_7'] ),
				array( __( 'Sumidos há 30+ dias', 'prime-poker' ), $activity['inactive'] ),
				array( __( 'Aulas publicadas', 'prime-poker' ), count( $lessons ) ),
				array( __( 'Visualizações', 'prime-poker' ), $views ),
				array( __( 'Conclusões', 'prime-poker' ), $completions ),
				array( __( 'Dúvidas sem resposta', 'prime-poker' ), count( $open ) ),
			)
		);

		self::open_questions( $open );
		self::by_tier( $stats['by_tier'] );
		self::notifications( $stats['notifications'] );
	}

	/**
	 * As dúvidas que ninguém respondeu — o único bloco que pede ação hoje.
	 *
	 * @param array<int, array<string, mixed>> $open Dúvidas em aberto.
	 */
	private static function open_questions( array $open ): void {
		echo '<h2>' . esc_html__( 'Dúvidas esperando resposta', 'prime-poker' ) . '</h2>';

		if ( array() === $open ) {
			echo '<p>' . esc_html__( 'Nenhuma dúvida em aberto. Tudo respondido.', 'prime-poker' ) . '</p>';

			return;
		}

		echo '<p class="description">' . esc_html__( 'Da mais antiga para a mais nova: a dúvida esquecida há duas semanas é a que custa caro.', 'prime-poker' ) . '</p>';

		echo '<table class="widefat striped"><thead><tr>';
		self::th( array( __( 'Quando', 'prime-poker' ), __( 'Quem', 'prime-poker' ), __( 'Aula', 'prime-poker' ), __( 'Dúvida', 'prime-poker' ), '' ) );
		echo '</tr></thead><tbody>';

		foreach ( $open as $question ) {
			echo '<tr>';
			echo '<td>' . esc_html( self::date( $question['date'] ) ) . '</td>';
			echo '<td>' . esc_html( $question['author'] ) . '</td>';
			echo '<td>' . esc_html( $question['lesson'] ) . '</td>';
			echo '<td>' . esc_html( $question['excerpt'] ) . '</td>';
			printf(
				'<td><a class="button button-primary button-small" href="%s">%s</a></td>',
				esc_url( admin_url( 'comment.php?action=editcomment&c=' . (int) $question['id'] ) ),
				esc_html__( 'Responder', 'prime-poker' )
			);
			echo '</tr>';
		}

		echo '</tbody></table>';
	}

	/**
	 * Quantos jogadores em cada tier.
	 *
	 * @param array<string, int> $by_tier Contagem por tier.
	 */
	private static function by_tier( array $by_tier ): void {
		echo '<h2>' . esc_html__( 'Jogadores por plano', 'prime-poker' ) . '</h2>';
		echo '<table class="widefat striped" style="max-width:420px"><tbody>';

		foreach ( $by_tier as $slug => $total ) {
			printf(
				'<tr><td>%s</td><td style="text-align:right"><strong>%s</strong></td></tr>',
				esc_html( Tiers::label( $slug ) ),
				esc_html( number_format_i18n( $total ) )
			);
		}

		echo '</tbody></table>';
	}

	/**
	 * Alcance e leitura das notificações.
	 *
	 * @param array<int, array<string, mixed>> $notifications Notificações.
	 */
	private static function notifications( array $notifications ): void {
		echo '<h2>' . esc_html__( 'Notificações', 'prime-poker' ) . '</h2>';

		if ( array() === $notifications ) {
			echo '<p>' . esc_html__( 'Nenhuma notificação publicada ainda.', 'prime-poker' ) . '</p>';

			return;
		}

		echo '<p class="description">' . esc_html__( '"Alcance" é quantos jogadores a veem — por tier, ou uma pessoa só quando o aviso é individual.', 'prime-poker' ) . '</p>';

		echo '<table class="widefat striped"><thead><tr>';
		self::th( array( __( 'Quando', 'prime-poker' ), __( 'Aviso', 'prime-poker' ), __( 'Tipo', 'prime-poker' ), __( 'Alcance', 'prime-poker' ), __( 'Leram', 'prime-poker' ) ) );
		echo '</tr></thead><tbody>';

		foreach ( $notifications as $notification ) {
			echo '<tr>';
			echo '<td>' . esc_html( self::date( $notification['date'] ) ) . '</td>';
			echo '<td>' . esc_html( $notification['title'] ) . '</td>';
			echo '<td>' . esc_html( $notification['type'] ) . '</td>';
			echo '<td>' . esc_html( number_format_i18n( $notification['audience'] ) ) . '</td>';
			echo '<td>' . esc_html( self::ratio( $notification['read'], $notification['audience'] ) ) . '</td>';
			echo '</tr>';
		}

		echo '</tbody></table>';
	}

	/* ---------------------------------------------------------------------- */
	/*                                  Aulas                                 */
	/* ---------------------------------------------------------------------- */

	/**
	 * O que cada aula rende.
	 *
	 * @param array<string, mixed> $stats Retrato.
	 */
	public static function lessons( array $stats ): void {
		$lessons = $stats['lessons'];

		self::export_button( 'aulas', __( 'Exportar aulas (CSV)', 'prime-poker' ) );

		if ( array() === $lessons ) {
			echo '<p>' . esc_html__( 'Nenhuma aula publicada ainda.', 'prime-poker' ) . '</p>';

			return;
		}

		$detail = isset( $_GET['aula'] ) ? (int) $_GET['aula'] : 0;

		if ( $detail > 0 ) {
			self::lesson_detail( $lessons, $detail );

			return;
		}

		echo '<p class="description">' . esc_html__( '"Podem ver" é quantos jogadores têm o tier da aula. É o denominador honesto da conclusão: cobrar audiência de quem nem pode assistir faria toda aula Platinum parecer um fracasso.', 'prime-poker' ) . '</p>';

		echo '<table class="widefat striped"><thead><tr>';
		self::th(
			array(
				__( 'Aula', 'prime-poker' ),
				__( 'Plano', 'prime-poker' ),
				__( 'Podem ver', 'prime-poker' ),
				__( 'Visualizações', 'prime-poker' ),
				__( 'Começaram', 'prime-poker' ),
				__( 'Concluíram', 'prime-poker' ),
				__( 'Dúvidas', 'prime-poker' ),
			)
		);
		echo '</tr></thead><tbody>';

		foreach ( $lessons as $lesson ) {
			echo '<tr>';
			printf(
				'<td><a href="%s"><strong>%s</strong></a></td>',
				esc_url( Page::url( 'aulas', array( 'aula' => (int) $lesson['id'] ) ) ),
				esc_html( $lesson['title'] )
			);
			echo '<td>' . esc_html( $lesson['tier'] ) . '</td>';
			echo '<td>' . esc_html( number_format_i18n( $lesson['audience'] ) ) . '</td>';
			echo '<td>' . esc_html( number_format_i18n( $lesson['views'] ) ) . '</td>';
			echo '<td>' . esc_html( number_format_i18n( $lesson['started'] ) ) . '</td>';
			echo '<td>' . esc_html( self::ratio( $lesson['completed'], $lesson['audience'] ) ) . '</td>';
			echo '<td>' . esc_html( self::questions_cell( $lesson ) ) . '</td>';
			echo '</tr>';
		}

		echo '</tbody></table>';
	}

	/**
	 * Quem assistiu a uma aula.
	 *
	 * @param array<int, array<string, mixed>> $lessons Aulas.
	 * @param int                              $lesson_id Aula pedida.
	 */
	private static function lesson_detail( array $lessons, int $lesson_id ): void {
		$lesson = null;

		foreach ( $lessons as $candidate ) {
			if ( (int) $candidate['id'] === $lesson_id ) {
				$lesson = $candidate;
				break;
			}
		}

		printf(
			'<p><a href="%s">&larr; %s</a></p>',
			esc_url( Page::url( 'aulas' ) ),
			esc_html__( 'Todas as aulas', 'prime-poker' )
		);

		if ( null === $lesson ) {
			echo '<p>' . esc_html__( 'Aula não encontrada — pode ter sido despublicada depois do último cálculo.', 'prime-poker' ) . '</p>';

			return;
		}

		echo '<h2>' . esc_html( $lesson['title'] ) . '</h2>';

		$finishers = array_flip( $lesson['finishers'] );

		if ( array() === $lesson['watchers'] ) {
			echo '<p>' . esc_html__( 'Ninguém abriu esta aula ainda.', 'prime-poker' ) . '</p>';

			return;
		}

		echo '<table class="widefat striped"><thead><tr>';
		self::th( array( __( 'Jogador', 'prime-poker' ), __( 'Situação', 'prime-poker' ) ) );
		echo '</tr></thead><tbody>';

		foreach ( $lesson['watchers'] as $user_id ) {
			$user = get_userdata( (int) $user_id );

			echo '<tr>';
			echo '<td>' . esc_html( $user instanceof \WP_User ? $user->display_name : (string) $user_id ) . '</td>';
			echo '<td>' . esc_html(
				isset( $finishers[ $user_id ] )
					? __( 'Concluiu', 'prime-poker' )
					: __( 'Começou', 'prime-poker' )
			) . '</td>';
			echo '</tr>';
		}

		echo '</tbody></table>';
	}

	/* ---------------------------------------------------------------------- */
	/*                               Jogadores                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Quem é quem.
	 *
	 * @param array<string, mixed> $stats Retrato.
	 */
	public static function players( array $stats ): void {
		$players = $stats['players'];

		self::export_button( 'jogadores', __( 'Exportar jogadores (CSV)', 'prime-poker' ) );

		if ( array() === $players ) {
			echo '<p>' . esc_html__( 'Nenhum jogador cadastrado ainda.', 'prime-poker' ) . '</p>';

			return;
		}

		echo '<p class="description">' . esc_html__( '"Último estudo" é o último dia em que a pessoa abriu uma aula. O WordPress não guarda data de login, e o site é headless — quem entra pelo front nem passa pela tela de login do painel.', 'prime-poker' ) . '</p>';

		echo '<table class="widefat striped"><thead><tr>';
		self::th(
			array(
				__( 'Jogador', 'prime-poker' ),
				__( 'Contato', 'prime-poker' ),
				__( 'Plano', 'prime-poker' ),
				__( 'Entrou em', 'prime-poker' ),
				__( 'Último estudo', 'prime-poker' ),
				__( 'Concluídas', 'prime-poker' ),
				__( 'Em andamento', 'prime-poker' ),
				__( 'Sequência', 'prime-poker' ),
			)
		);
		echo '</tr></thead><tbody>';

		foreach ( $players as $player ) {
			echo '<tr>';
			printf(
				'<td><a href="%s"><strong>%s</strong></a></td>',
				esc_url( get_edit_user_link( (int) $player['id'] ) ),
				esc_html( $player['name'] )
			);
			printf(
				'<td>%s%s</td>',
				esc_html( $player['email'] ),
				'' === $player['phone'] ? '' : '<br><small>' . esc_html( $player['phone'] ) . '</small>'
			);
			echo '<td>' . esc_html( $player['tier'] ) . '</td>';
			echo '<td>' . esc_html( self::date( $player['registered'] ) ) . '</td>';
			echo '<td>' . esc_html( '' === $player['last_day'] ? __( 'nunca', 'prime-poker' ) : self::date( $player['last_day'] ) ) . '</td>';
			echo '<td>' . esc_html( number_format_i18n( $player['completed'] ) ) . '</td>';
			echo '<td>' . esc_html( number_format_i18n( $player['in_progress'] ) ) . '</td>';
			echo '<td>' . esc_html( number_format_i18n( $player['streak'] ) ) . '</td>';
			echo '</tr>';
		}

		echo '</tbody></table>';
	}

	/* ---------------------------------------------------------------------- */
	/*                                Auxiliares                              */
	/* ---------------------------------------------------------------------- */

	/**
	 * A fileira de números do topo.
	 *
	 * @param array<int, array{0: string, 1: int}> $cards Rótulo e valor.
	 */
	private static function cards( array $cards ): void {
		echo '<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin:16px 0 24px">';

		foreach ( $cards as list( $label, $value ) ) {
			printf(
				'<div style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:14px 16px"><div style="color:#646970;font-size:12px;text-transform:uppercase;letter-spacing:.03em">%s</div><div style="font-size:26px;font-weight:600;line-height:1.2;margin-top:4px">%s</div></div>',
				esc_html( $label ),
				esc_html( number_format_i18n( $value ) )
			);
		}

		echo '</div>';
	}

	/**
	 * Cabeçalhos de tabela.
	 *
	 * @param array<int, string> $labels Rótulos.
	 */
	private static function th( array $labels ): void {
		foreach ( $labels as $label ) {
			echo '<th>' . esc_html( $label ) . '</th>';
		}
	}

	/**
	 * Botão de exportar, apontando para o `admin-post` com nonce.
	 *
	 * @param string $what  `aulas` ou `jogadores`.
	 * @param string $label Texto do botão.
	 */
	private static function export_button( string $what, string $label ): void {
		printf(
			'<p><a class="button" href="%s">%s</a></p>',
			esc_url(
				wp_nonce_url(
					add_query_arg(
						array(
							'action' => Export::ACTION,
							'o_que'  => $what,
						),
						admin_url( 'admin-post.php' )
					),
					Export::NONCE
				)
			),
			esc_html( $label )
		);
	}

	/**
	 * "12 (3 sem resposta)" — ou só o total quando está tudo respondido.
	 *
	 * @param array<string, mixed> $lesson Aula.
	 */
	private static function questions_cell( array $lesson ): string {
		$total = (int) $lesson['questions'];
		$open  = (int) $lesson['unanswered'];

		if ( 0 === $open ) {
			return number_format_i18n( $total );
		}

		return sprintf(
			/* translators: 1: total de dúvidas; 2: quantas seguem sem resposta. */
			__( '%1$s (%2$s sem resposta)', 'prime-poker' ),
			number_format_i18n( $total ),
			number_format_i18n( $open )
		);
	}

	/**
	 * "12 de 40 (30%)". Sem denominador, só o número.
	 *
	 * @param int $part  Parte.
	 * @param int $total Total.
	 */
	private static function ratio( int $part, int $total ): string {
		if ( $total <= 0 ) {
			return number_format_i18n( $part );
		}

		return sprintf(
			/* translators: 1: parte; 2: total; 3: porcentagem. */
			__( '%1$s de %2$s (%3$s%%)', 'prime-poker' ),
			number_format_i18n( $part ),
			number_format_i18n( $total ),
			number_format_i18n( (int) round( $part / $total * 100 ) )
		);
	}

	/**
	 * Data no formato do site.
	 *
	 * @param string $value Data do banco (`AAAA-MM-DD` ou com hora).
	 */
	private static function date( string $value ): string {
		$timestamp = strtotime( $value );

		return false === $timestamp ? $value : (string) wp_date( 'd/m/Y', $timestamp );
	}
}
