<?php
/**
 * Progresso, aulas salvas e concluídas — por jogador.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * O estado de cada jogador no acervo.
 *
 * Tudo mora em user meta, num punhado de arrays indexados pelo ID da aula:
 * a página da aula, a listagem e o painel leem o estado inteiro de uma vez,
 * e uma meta por aula multiplicaria as consultas sem ganho nenhum.
 *
 * - `META_POSITION`    — onde o jogador parou em cada aula, para retomar.
 * - `META_POSITION_AT` — quando foi esse último avanço, para saber qual aula
 *   ele estava assistindo por último.
 * - `META_COMPLETED`   — quando concluiu cada aula.
 * - `META_SAVED`       — quando salvou cada aula.
 * - `META_MANUAL`      — aulas que ele desmarcou na mão (ver `auto_complete`).
 * - `META_DAYS`        — os dias em que estudou, para a sequência.
 *
 * Aula apagada no painel não é limpa das metas: varrer todos os jogadores a
 * cada exclusão seria caro, e a leitura já ignora ID que não existe mais.
 */
final class Progress {

	public const META_POSITION    = '_prime_poker_position';
	public const META_POSITION_AT = '_prime_poker_position_at';
	public const META_COMPLETED   = '_prime_poker_completed';
	public const META_SAVED       = '_prime_poker_saved';
	public const META_MANUAL      = '_prime_poker_uncompleted';
	public const META_DAYS        = '_prime_poker_study_days';

	/**
	 * Duração da aula, gravada pelo ACF (`lessonFields.duration`).
	 *
	 * A conclusão automática precisa dela para saber o que são 90%.
	 */
	private const META_DURATION = 'duration';

	/**
	 * A partir de quanto da aula ela se dá por concluída sozinha.
	 *
	 * Ninguém assiste aos créditos: exigir o fim exato deixaria o acervo
	 * cheio de aulas eternamente "quase concluídas".
	 */
	private const AUTO_COMPLETE = 0.9;

	/**
	 * Quantos dias de estudo ficam guardados.
	 *
	 * A sequência só precisa dos dias recentes, mas o histórico serve ao
	 * painel; um ano e pouco cabe folgado numa meta e não cresce para sempre.
	 */
	private const DAYS_KEPT = 400;

	/* ---------------------------------------------------------------------- */
	/*                                 Leitura                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Onde o jogador parou, em segundos. 0 quando nunca abriu a aula.
	 *
	 * @param int $user_id   ID do jogador.
	 * @param int $lesson_id ID da aula.
	 */
	public static function position( int $user_id, int $lesson_id ): int {
		return max( 0, (int) ( self::map( $user_id, self::META_POSITION )[ $lesson_id ] ?? 0 ) );
	}

	/**
	 * A aula está salva?
	 *
	 * @param int $user_id   ID do jogador.
	 * @param int $lesson_id ID da aula.
	 */
	public static function is_saved( int $user_id, int $lesson_id ): bool {
		return isset( self::map( $user_id, self::META_SAVED )[ $lesson_id ] );
	}

	/**
	 * A aula está concluída?
	 *
	 * @param int $user_id   ID do jogador.
	 * @param int $lesson_id ID da aula.
	 */
	public static function is_completed( int $user_id, int $lesson_id ): bool {
		return isset( self::map( $user_id, self::META_COMPLETED )[ $lesson_id ] );
	}

	/**
	 * Aulas salvas, da mais recente para a mais antiga.
	 *
	 * @param int $user_id ID do jogador.
	 * @return array<int, int> IDs de aula.
	 */
	public static function saved( int $user_id ): array {
		$saved = self::map( $user_id, self::META_SAVED );
		arsort( $saved );

		return array_keys( $saved );
	}

	/**
	 * A aula em andamento mais recente, ou null.
	 *
	 * Em andamento é ter parado no meio: aula concluída sai da lista, e aula
	 * apagada do WordPress também — o ID fica na meta até alguém tocar nela.
	 *
	 * @param int $user_id ID do jogador.
	 */
	public static function continue_watching( int $user_id ): ?int {
		$positions = self::map( $user_id, self::META_POSITION );
		$completed = self::map( $user_id, self::META_COMPLETED );
		$updates   = self::map( $user_id, self::META_POSITION_AT );

		// Sem registro de quando, a ordem é a de inserção — que já é
		// cronológica, porque cada avanço reinsere a aula no fim do array.
		uksort(
			$positions,
			static fn( int $a, int $b ): int => ( (int) ( $updates[ $b ] ?? 0 ) ) <=> ( (int) ( $updates[ $a ] ?? 0 ) )
		);

		foreach ( $positions as $lesson_id => $seconds ) {
			if ( $seconds <= 0 || isset( $completed[ $lesson_id ] ) ) {
				continue;
			}

			$post = get_post( $lesson_id );

			if ( $post instanceof \WP_Post && Content::POST_TYPE === $post->post_type && 'publish' === $post->post_status ) {
				return $lesson_id;
			}
		}

		return null;
	}

	/**
	 * Dias seguidos de estudo, contando de hoje para trás.
	 *
	 * Estudar hoje ainda não é obrigatório: quem estudou ontem mantém a
	 * sequência até o fim do dia de hoje, senão ela zeraria de madrugada
	 * para quem ainda não abriu nenhuma aula.
	 *
	 * @param int $user_id ID do jogador.
	 */
	public static function streak( int $user_id ): int {
		$days = self::days( $user_id );

		if ( array() === $days ) {
			return 0;
		}

		$today     = self::today();
		$yesterday = self::day_before( $today );
		$last      = end( $days );

		if ( $last !== $today && $last !== $yesterday ) {
			return 0;
		}

		$streak   = 0;
		$expected = $last;

		// Do mais recente para trás: o primeiro buraco encerra a sequência.
		foreach ( array_reverse( $days ) as $day ) {
			if ( $day !== $expected ) {
				break;
			}

			++$streak;
			$expected = self::day_before( $day );
		}

		return $streak;
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Escrita                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Guarda onde o jogador parou e conclui a aula se ele chegou ao fim.
	 *
	 * A posição é a última conhecida, não a maior: voltar para rever um
	 * trecho e sair deve retomar dali, não de onde ele já esteve.
	 *
	 * @param int $user_id   ID do jogador.
	 * @param int $lesson_id ID da aula.
	 * @param int $seconds   Posição no vídeo, em segundos.
	 * @return array{position: int, completed: bool}
	 */
	public static function save_position( int $user_id, int $lesson_id, int $seconds ): array {
		$duration = max( 0, (int) get_post_meta( $lesson_id, self::META_DURATION, true ) );
		$seconds  = max( 0, $seconds );

		// Uma posição além da duração cadastrada é a duração errada no
		// painel, não o jogador adivinhando o futuro: o vídeo manda.
		if ( $duration > 0 ) {
			$seconds = min( $seconds, $duration );
		}

		$positions               = self::map( $user_id, self::META_POSITION );
		$positions[ $lesson_id ] = $seconds;
		self::put( $user_id, self::META_POSITION, $positions );

		$updates               = self::map( $user_id, self::META_POSITION_AT );
		$updates[ $lesson_id ] = time();
		self::put( $user_id, self::META_POSITION_AT, $updates );

		self::register_day( $user_id );

		if ( $duration > 0 && $seconds / $duration >= self::AUTO_COMPLETE ) {
			self::auto_complete( $user_id, $lesson_id );
		}

		return array(
			'position'  => $seconds,
			'completed' => self::is_completed( $user_id, $lesson_id ),
		);
	}

	/**
	 * Salva ou tira a aula da lista do jogador.
	 *
	 * @param int $user_id   ID do jogador.
	 * @param int $lesson_id ID da aula.
	 * @return bool O estado depois da troca.
	 */
	public static function toggle_saved( int $user_id, int $lesson_id ): bool {
		$saved = self::map( $user_id, self::META_SAVED );

		if ( isset( $saved[ $lesson_id ] ) ) {
			unset( $saved[ $lesson_id ] );
			self::put( $user_id, self::META_SAVED, $saved );

			return false;
		}

		$saved[ $lesson_id ] = time();
		self::put( $user_id, self::META_SAVED, $saved );

		return true;
	}

	/**
	 * Marca ou desmarca a aula como concluída, a pedido do jogador.
	 *
	 * Desmarcar na mão também desliga a conclusão automática dessa aula: sem
	 * isso, o próximo aviso de progresso do player — que continua tocando de
	 * onde parou, acima dos 90% — marcaria tudo de novo.
	 *
	 * @param int $user_id   ID do jogador.
	 * @param int $lesson_id ID da aula.
	 * @return bool O estado depois da troca.
	 */
	public static function toggle_completed( int $user_id, int $lesson_id ): bool {
		$completed = self::map( $user_id, self::META_COMPLETED );
		$manual    = self::map( $user_id, self::META_MANUAL );

		if ( isset( $completed[ $lesson_id ] ) ) {
			unset( $completed[ $lesson_id ] );
			$manual[ $lesson_id ] = time();

			self::put( $user_id, self::META_COMPLETED, $completed );
			self::put( $user_id, self::META_MANUAL, $manual );

			return false;
		}

		$completed[ $lesson_id ] = time();
		unset( $manual[ $lesson_id ] );

		self::put( $user_id, self::META_COMPLETED, $completed );
		self::put( $user_id, self::META_MANUAL, $manual );
		self::register_day( $user_id );

		return true;
	}

	/**
	 * Registra que o jogador estudou hoje.
	 *
	 * Vale abrir uma aula que ele pode assistir (decisão de 19/09/2026): a
	 * sequência é um incentivo, e exigir minutos assistidos dependeria de o
	 * player conseguir avisar antes de a aba fechar.
	 *
	 * @param int $user_id ID do jogador.
	 */
	public static function register_day( int $user_id ): void {
		$days  = self::days( $user_id );
		$today = self::today();

		if ( end( $days ) === $today ) {
			return;
		}

		$days[] = $today;

		self::put( $user_id, self::META_DAYS, array_slice( $days, -self::DAYS_KEPT ) );
	}

	/**
	 * Conclui a aula sozinha, se o jogador não a tiver desmarcado antes.
	 *
	 * @param int $user_id   ID do jogador.
	 * @param int $lesson_id ID da aula.
	 */
	private static function auto_complete( int $user_id, int $lesson_id ): void {
		if ( isset( self::map( $user_id, self::META_MANUAL )[ $lesson_id ] ) || self::is_completed( $user_id, $lesson_id ) ) {
			return;
		}

		$completed               = self::map( $user_id, self::META_COMPLETED );
		$completed[ $lesson_id ] = time();

		self::put( $user_id, self::META_COMPLETED, $completed );
	}

	/* ---------------------------------------------------------------------- */
	/*                                Auxiliares                              */
	/* ---------------------------------------------------------------------- */

	/**
	 * Um dos mapas do jogador, sempre como array de int => int.
	 *
	 * @param int    $user_id ID do jogador.
	 * @param string $meta    Chave da meta.
	 * @return array<int, int>
	 */
	private static function map( int $user_id, string $meta ): array {
		if ( $user_id <= 0 ) {
			return array();
		}

		$stored = get_user_meta( $user_id, $meta, true );

		if ( ! is_array( $stored ) ) {
			return array();
		}

		$map = array();

		foreach ( $stored as $lesson_id => $value ) {
			if ( is_numeric( $lesson_id ) && (int) $lesson_id > 0 ) {
				$map[ (int) $lesson_id ] = (int) $value;
			}
		}

		return $map;
	}

	/**
	 * Grava um mapa do jogador.
	 *
	 * @param int               $user_id ID do jogador.
	 * @param string            $meta    Chave da meta.
	 * @param array<int|string, mixed> $value Conteúdo.
	 */
	private static function put( int $user_id, string $meta, array $value ): void {
		if ( $user_id <= 0 ) {
			return;
		}

		if ( array() === $value ) {
			delete_user_meta( $user_id, $meta );

			return;
		}

		update_user_meta( $user_id, $meta, $value );
	}

	/**
	 * Dias de estudo, em ordem crescente e sem repetição.
	 *
	 * @param int $user_id ID do jogador.
	 * @return array<int, string> Dias em `AAAA-MM-DD`.
	 */
	private static function days( int $user_id ): array {
		$stored = get_user_meta( $user_id, self::META_DAYS, true );

		if ( ! is_array( $stored ) ) {
			return array();
		}

		$days = array();

		foreach ( $stored as $day ) {
			if ( is_string( $day ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $day ) ) {
				$days[ $day ] = true;
			}
		}

		$days = array_keys( $days );
		sort( $days );

		return $days;
	}

	/**
	 * Hoje no fuso do site — o dia do jogador, não o do servidor.
	 */
	private static function today(): string {
		return (string) wp_date( 'Y-m-d' );
	}

	/**
	 * O dia anterior a `AAAA-MM-DD`.
	 *
	 * @param string $day Dia de referência.
	 */
	private static function day_before( string $day ): string {
		return (string) gmdate( 'Y-m-d', (int) strtotime( "{$day} -1 day" ) );
	}
}
