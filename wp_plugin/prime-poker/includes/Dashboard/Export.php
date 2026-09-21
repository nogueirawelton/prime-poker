<?php
/**
 * Exportação dos números em CSV.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Dashboard;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Baixa a aba aberta como planilha.
 *
 * Duas listas: **jogadores** (para mala direta e cobrança) e **aulas** (para
 * decidir o que gravar). Saem do mesmo retrato que a tela mostra, então a
 * planilha nunca discorda do que estava na frente de quem clicou.
 *
 * **Ponto e vírgula, não vírgula.** O Excel em português lê o CSV com o
 * separador da região, e com vírgula ele empilha tudo numa coluna só. A BOM
 * no começo é o que faz o mesmo Excel entender os acentos.
 */
final class Export {

	/** Ação do `admin-post`. */
	public const ACTION = 'prime_poker_export';

	/** Nonce dos links de exportação. */
	public const NONCE = 'prime_poker_export';

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'admin_post_' . self::ACTION, array( self::class, 'download' ) );
	}

	/**
	 * Monta e entrega o arquivo.
	 */
	public static function download(): void {
		if ( ! current_user_can( Page::CAP ) ) {
			wp_die( esc_html__( 'Sem permissão para exportar.', 'prime-poker' ) );
		}

		check_admin_referer( self::NONCE );

		$what = isset( $_GET['o_que'] ) ? sanitize_key( wp_unslash( $_GET['o_que'] ) ) : 'jogadores';

		// A lista de jogadores leva e-mail e WhatsApp de gente real: mesma
		// exigência da aba, senão o botão seria um jeito de contornar a tela.
		if ( 'jogadores' === $what && ! current_user_can( Page::CAP_PLAYERS ) ) {
			wp_die( esc_html__( 'Só quem administra usuários exporta os dados dos jogadores.', 'prime-poker' ) );
		}

		$stats = Stats::snapshot();
		$rows  = 'aulas' === $what ? self::lesson_rows( $stats ) : self::player_rows( $stats );

		self::send( $what, $rows );
	}

	/**
	 * As linhas da planilha de jogadores.
	 *
	 * @param array<string, mixed> $stats Retrato.
	 * @return array<int, array<int, string>>
	 */
	private static function player_rows( array $stats ): array {
		$rows = array(
			array(
				__( 'Nome', 'prime-poker' ),
				__( 'E-mail', 'prime-poker' ),
				__( 'WhatsApp', 'prime-poker' ),
				__( 'Cidade', 'prime-poker' ),
				__( 'Plano', 'prime-poker' ),
				__( 'Entrou em', 'prime-poker' ),
				__( 'Plano vence em', 'prime-poker' ),
				__( 'Último estudo', 'prime-poker' ),
				__( 'Aulas concluídas', 'prime-poker' ),
				__( 'Aulas em andamento', 'prime-poker' ),
				__( 'Aulas salvas', 'prime-poker' ),
				__( 'Sequência (dias)', 'prime-poker' ),
			),
		);

		foreach ( $stats['players'] as $player ) {
			$rows[] = array(
				(string) $player['name'],
				(string) $player['email'],
				(string) $player['phone'],
				(string) $player['city'],
				(string) $player['tier'],
				self::date( (string) $player['registered'] ),
				null === $player['expires_at'] ? '' : (string) wp_date( 'd/m/Y', (int) $player['expires_at'] ),
				'' === $player['last_day'] ? '' : self::date( (string) $player['last_day'] ),
				(string) $player['completed'],
				(string) $player['in_progress'],
				(string) $player['saved'],
				(string) $player['streak'],
			);
		}

		return $rows;
	}

	/**
	 * As linhas da planilha de aulas.
	 *
	 * @param array<string, mixed> $stats Retrato.
	 * @return array<int, array<int, string>>
	 */
	private static function lesson_rows( array $stats ): array {
		$rows = array(
			array(
				__( 'Aula', 'prime-poker' ),
				__( 'Plano mínimo', 'prime-poker' ),
				__( 'Publicada em', 'prime-poker' ),
				__( 'Jogadores que podem ver', 'prime-poker' ),
				__( 'Visualizações', 'prime-poker' ),
				__( 'Começaram', 'prime-poker' ),
				__( 'Concluíram', 'prime-poker' ),
				__( 'Conclusão (%)', 'prime-poker' ),
				__( 'Dúvidas', 'prime-poker' ),
				__( 'Dúvidas sem resposta', 'prime-poker' ),
			),
		);

		foreach ( $stats['lessons'] as $lesson ) {
			$audience = (int) $lesson['audience'];

			$rows[] = array(
				(string) $lesson['title'],
				(string) $lesson['tier'],
				self::date( (string) $lesson['published'] ),
				(string) $audience,
				(string) $lesson['views'],
				(string) $lesson['started'],
				(string) $lesson['completed'],
				$audience > 0 ? (string) (int) round( (int) $lesson['completed'] / $audience * 100 ) : '',
				(string) $lesson['questions'],
				(string) $lesson['unanswered'],
			);
		}

		return $rows;
	}

	/**
	 * Manda o arquivo e encerra.
	 *
	 * @param string                          $what Nome base do arquivo.
	 * @param array<int, array<int, string>>  $rows Linhas, com o cabeçalho na primeira.
	 */
	private static function send( string $what, array $rows ): void {
		$name = sprintf( 'prime-poker-%s-%s.csv', $what, wp_date( 'Y-m-d' ) );

		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $name . '"' );

		$output = fopen( 'php://output', 'w' );

		// BOM: sem ela o Excel lê os acentos como lixo.
		fwrite( $output, "\xEF\xBB\xBF" );

		foreach ( $rows as $row ) {
			fputcsv( $output, $row, ';' );
		}

		fclose( $output );

		exit;
	}

	/**
	 * Data no formato do site.
	 *
	 * @param string $value Data do banco.
	 */
	private static function date( string $value ): string {
		$timestamp = strtotime( $value );

		return false === $timestamp ? $value : (string) wp_date( 'd/m/Y', $timestamp );
	}
}
