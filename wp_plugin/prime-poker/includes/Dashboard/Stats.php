<?php
/**
 * Os números da área do jogador.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Dashboard;

use PrimePoker\Lessons\Access;
use PrimePoker\Lessons\Content as Lessons;
use PrimePoker\Lessons\Progress;
use PrimePoker\Lessons\Questions;
use PrimePoker\Lessons\Views;
use PrimePoker\Notifications\Content as Notifications;
use PrimePoker\Players\Membership;
use PrimePoker\Players\Profile;
use PrimePoker\Players\Tiers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Um retrato da área do jogador, calculado de uma vez só.
 *
 * **Por que uma passada só, e em cache.** O progresso de cada jogador mora em
 * user meta serializada (`_prime_poker_completed` é um mapa aula => quando),
 * e isso é ótimo para ler o progresso de UMA pessoa — que é o que o site faz
 * o tempo todo — mas péssimo para perguntar "quem concluiu a aula 42": não há
 * como o banco responder isso sem abrir a meta de todo mundo. Então abrimos
 * uma vez, calculamos tudo o que o painel mostra e guardamos o resultado.
 *
 * O cache é curto (15 minutos) e tem botão de atualizar: o painel é de
 * acompanhamento, não de tempo real, e ninguém toma decisão com base em
 * quinze minutos de diferença.
 *
 * Os jogadores são lidos em lotes para a memória não crescer com a base.
 */
final class Stats {

	/** Onde o retrato fica guardado. */
	public const TRANSIENT = 'prime_poker_dashboard_stats';

	/** Por quanto tempo o retrato vale. */
	private const TTL = 15 * MINUTE_IN_SECONDS;

	/** Quantos jogadores por lote. */
	private const BATCH = 200;

	/** Dias sem estudar a partir dos quais o jogador conta como sumido. */
	private const INACTIVE_DAYS = 30;

	/**
	 * Registra os hooks.
	 *
	 * O retrato vale 15 minutos, mas alguns eventos o deixam errado na hora e
	 * de um jeito que se nota: uma dúvida nova que não aparece em "esperando
	 * resposta", um jogador que acabou de entrar e não está na lista. Nesses
	 * casos o cache é jogado fora e a próxima abertura refaz a conta.
	 *
	 * Assistir aula NÃO entra: é o evento mais frequente da área e refazer a
	 * conta a cada play tiraria todo o sentido do cache.
	 */
	public static function boot(): void {
		foreach ( array( 'wp_insert_comment', 'transition_comment_status', 'user_register', 'prime_player_tier_changed' ) as $hook ) {
			add_action( $hook, array( self::class, 'forget' ) );
		}
	}

	/**
	 * O retrato.
	 *
	 * @param bool $fresh Ignora o cache e recalcula.
	 * @return array<string, mixed>
	 */
	public static function snapshot( bool $fresh = false ): array {
		if ( ! $fresh ) {
			$cached = get_transient( self::TRANSIENT );

			if ( is_array( $cached ) ) {
				return $cached;
			}
		}

		$snapshot = self::build();

		set_transient( self::TRANSIENT, $snapshot, self::TTL );

		return $snapshot;
	}

	/** Joga o retrato fora, para o próximo acesso recalcular. */
	public static function forget(): void {
		delete_transient( self::TRANSIENT );
	}

	/**
	 * Calcula tudo.
	 *
	 * @return array<string, mixed>
	 */
	private static function build(): array {
		$lessons = self::lessons();
		$players = self::players( $lessons );

		return array(
			'generated_at'  => time(),
			'players'       => $players['rows'],
			'by_tier'       => $players['by_tier'],
			'activity'      => $players['activity'],
			'lessons'       => self::with_audience( $lessons, $players ),
			'questions'     => self::questions(),
			'notifications' => self::notifications( $players ),
		);
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Aulas                                  */
	/* ---------------------------------------------------------------------- */

	/**
	 * As aulas publicadas, sem os números dos jogadores ainda.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private static function lessons(): array {
		$posts = get_posts(
			array(
				'post_type'        => Lessons::POST_TYPE,
				'post_status'      => 'publish',
				'posts_per_page'   => -1,
				'orderby'          => 'date',
				'order'            => 'DESC',
				'suppress_filters' => true,
			)
		);

		$lessons = array();

		foreach ( $posts as $post ) {
			$lessons[ (int) $post->ID ] = array(
				'id'          => (int) $post->ID,
				'title'       => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
				'tier'        => Tiers::label( Access::minimum_tier( (int) $post->ID ) ),
				'published'   => (string) $post->post_date,
				'views'       => (int) get_post_meta( (int) $post->ID, Views::META, true ),
				'started'     => 0,
				'completed'   => 0,
				'questions'   => 0,
				'unanswered'  => 0,
				'audience'    => 0,
			);
		}

		return $lessons;
	}

	/* ---------------------------------------------------------------------- */
	/*                               Jogadores                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Uma passada por todos os jogadores.
	 *
	 * Devolve as linhas da aba Jogadores e, de carona, os agregados que só
	 * saem daqui: quem começou e quem concluiu cada aula, e quem leu cada
	 * notificação. Calcular isso depois custaria uma segunda passada pela
	 * mesma meta.
	 *
	 * @param array<int, array<string, mixed>> $lessons Aulas publicadas.
	 * @return array{rows: array<int, array<string, mixed>>, by_tier: array<string, int>, activity: array<string, int>, started: array<int, array<int, int>>, completed: array<int, array<int, int>>, read: array<int, int>, tier_of: array<int, string>}
	 */
	private static function players( array $lessons ): array {
		$rows      = array();
		$by_tier   = array_fill_keys( Tiers::slugs(), 0 );
		$started   = array();
		$completed = array();
		$read      = array();
		$tier_of   = array();

		$today     = current_time( 'timestamp' );
		$new_since = $today - ( 30 * DAY_IN_SECONDS );

		$activity = array(
			'active_7'   => 0,
			'active_30'  => 0,
			'inactive'   => 0,
			'never'      => 0,
			'new_30'     => 0,
		);

		$offset = 0;

		do {
			$batch = get_users(
				array(
					'role__in' => Tiers::slugs(),
					'number'   => self::BATCH,
					'offset'   => $offset,
					'orderby'  => 'ID',
					'order'    => 'ASC',
				)
			);

			// Traz a meta dos jogadores do lote numa consulta só, em vez de
			// uma por chamada de `get_user_meta` lá dentro.
			update_meta_cache( 'user', wp_list_pluck( $batch, 'ID' ) );

			foreach ( $batch as $user ) {
				$user_id = (int) $user->ID;
				$tier    = Membership::get_tier( $user_id );

				if ( null !== $tier && isset( $by_tier[ $tier ] ) ) {
					++$by_tier[ $tier ];
				}

				$tier_of[ $user_id ] = (string) $tier;

				$done     = self::map( $user_id, Progress::META_COMPLETED );
				$position = self::map( $user_id, Progress::META_POSITION );

				foreach ( array_keys( $position ) as $lesson_id ) {
					if ( isset( $lessons[ $lesson_id ] ) ) {
						$started[ $lesson_id ][] = $user_id;
					}
				}

				foreach ( array_keys( $done ) as $lesson_id ) {
					if ( isset( $lessons[ $lesson_id ] ) ) {
						$completed[ $lesson_id ][] = $user_id;
					}
				}

				foreach ( Notifications::read_ids( $user_id ) as $notification_id ) {
					$read[ $notification_id ] = ( $read[ $notification_id ] ?? 0 ) + 1;
				}

				$last       = self::last_day( $user_id );
				$registered = strtotime( (string) $user->user_registered ) ?: 0;

				if ( $registered >= $new_since ) {
					++$activity['new_30'];
				}

				if ( '' === $last ) {
					++$activity['never'];
				} else {
					$days = (int) floor( ( $today - (int) strtotime( $last ) ) / DAY_IN_SECONDS );

					if ( $days <= 7 ) {
						++$activity['active_7'];
					}

					if ( $days <= self::INACTIVE_DAYS ) {
						++$activity['active_30'];
					} else {
						++$activity['inactive'];
					}
				}

				$rows[] = array(
					'id'         => $user_id,
					'name'       => (string) $user->display_name,
					'email'      => (string) $user->user_email,
					'phone'      => (string) get_user_meta( $user_id, Profile::META_PHONE, true ),
					'city'       => (string) get_user_meta( $user_id, Profile::META_CITY, true ),
					'tier'       => null === $tier ? '—' : Tiers::label( $tier ),
					'tier_slug'  => (string) $tier,
					'registered' => (string) $user->user_registered,
					'expires_at' => Membership::expires_at( $user_id ),
					'last_day'   => $last,
					'completed'  => count( $done ),
					'in_progress' => count( array_diff_key( $position, $done ) ),
					'saved'      => count( self::map( $user_id, Progress::META_SAVED ) ),
					'streak'     => Progress::streak( $user_id ),
				);
			}

			$offset += self::BATCH;
		} while ( count( $batch ) === self::BATCH );

		return array(
			'rows'      => $rows,
			'by_tier'   => $by_tier,
			'activity'  => $activity,
			'started'   => $started,
			'completed' => $completed,
			'read'      => $read,
			'tier_of'   => $tier_of,
		);
	}

	/**
	 * Junta às aulas o que só a passada pelos jogadores sabe.
	 *
	 * @param array<int, array<string, mixed>> $lessons Aulas.
	 * @param array<string, mixed>             $players Resultado de `players()`.
	 * @return array<int, array<string, mixed>>
	 */
	private static function with_audience( array $lessons, array $players ): array {
		$questions = self::questions_by_lesson();

		foreach ( $lessons as $id => $lesson ) {
			$started   = $players['started'][ $id ] ?? array();
			$completed = $players['completed'][ $id ] ?? array();

			// Quem concluiu conta como quem começou, mesmo tendo marcado na
			// mão sem passar pelo vídeo: senão a taxa de conclusão passaria
			// de 100%.
			$lessons[ $id ]['started']    = count( array_unique( array_merge( $started, $completed ) ) );
			$lessons[ $id ]['completed']  = count( $completed );
			$lessons[ $id ]['watchers']   = array_values( array_unique( array_merge( $started, $completed ) ) );
			$lessons[ $id ]['finishers']  = array_values( $completed );
			$lessons[ $id ]['questions']  = $questions[ $id ]['total'] ?? 0;
			$lessons[ $id ]['unanswered'] = $questions[ $id ]['unanswered'] ?? 0;

			// Quantos jogadores TÊM o tier desta aula. É o denominador
			// honesto da conclusão: cobrar audiência de quem nem pode
			// assistir faria toda aula Platinum parecer um fracasso.
			$lessons[ $id ]['audience'] = self::reach( (string) get_post_meta( $id, Access::META_MINIMUM_TIER, true ), $players['tier_of'] );
		}

		return array_values( $lessons );
	}

	/**
	 * Quantos jogadores alcançam um tier mínimo.
	 *
	 * @param string             $minimum Slug do tier mínimo, ou vazio.
	 * @param array<int, string> $tier_of Tier de cada jogador.
	 */
	private static function reach( string $minimum, array $tier_of ): int {
		$floor = Tiers::exists( $minimum ) ? Tiers::level( $minimum ) : 0;
		$total = 0;

		foreach ( $tier_of as $tier ) {
			if ( '' !== $tier && Tiers::level( $tier ) >= $floor ) {
				++$total;
			}
		}

		return $total;
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Dúvidas                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Todas as dúvidas das aulas, agrupadas.
	 *
	 * @return array<string, mixed>
	 */
	private static function questions(): array {
		$threads = self::threads();
		$open    = array();
		$total   = 0;

		foreach ( $threads as $thread ) {
			++$total;

			if ( ! $thread['answered'] ) {
				$open[] = $thread;
			}
		}

		// Mais antigas primeiro: a dúvida esquecida há duas semanas é a que
		// custa caro, não a que chegou hoje.
		usort( $open, static fn( array $a, array $b ): int => strcmp( $a['date'], $b['date'] ) );

		return array(
			'total'      => $total,
			'unanswered' => $open,
		);
	}

	/**
	 * Dúvidas por aula: total e quantas seguem sem resposta.
	 *
	 * @return array<int, array{total: int, unanswered: int}>
	 */
	private static function questions_by_lesson(): array {
		$by_lesson = array();

		foreach ( self::threads() as $thread ) {
			$lesson_id = $thread['lesson_id'];

			if ( ! isset( $by_lesson[ $lesson_id ] ) ) {
				$by_lesson[ $lesson_id ] = array(
					'total'      => 0,
					'unanswered' => 0,
				);
			}

			++$by_lesson[ $lesson_id ]['total'];

			if ( ! $thread['answered'] ) {
				++$by_lesson[ $lesson_id ]['unanswered'];
			}
		}

		return $by_lesson;
	}

	/**
	 * As conversas das aulas: a pergunta e se a equipe já respondeu.
	 *
	 * Calculado uma vez por requisição — `questions()` e
	 * `questions_by_lesson()` pedem a mesma coisa de ângulos diferentes.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private static function threads(): array {
		static $threads = null;

		if ( null !== $threads ) {
			return $threads;
		}

		$comments = get_comments(
			array(
				'post_type' => Lessons::POST_TYPE,
				'status'    => 'approve',
				'orderby'   => 'comment_date_gmt',
				'order'     => 'ASC',
			)
		);

		$answered = array();
		$roots    = array();

		foreach ( $comments as $comment ) {
			$parent = (int) $comment->comment_parent;

			if ( $parent > 0 ) {
				if ( Questions::from_team( $comment ) ) {
					$answered[ $parent ] = true;
				}

				continue;
			}

			// Pergunta é o que um jogador escreveu na raiz; a equipe também
			// pode abrir uma linha, e essa não é dúvida de ninguém.
			if ( Questions::from_team( $comment ) ) {
				continue;
			}

			$roots[] = $comment;
		}

		$threads = array();

		foreach ( $roots as $comment ) {
			$id          = (int) $comment->comment_ID;
			$lesson_id   = (int) $comment->comment_post_ID;
			$threads[]   = array(
				'id'        => $id,
				'lesson_id' => $lesson_id,
				'lesson'    => html_entity_decode( get_the_title( $lesson_id ), ENT_QUOTES, 'UTF-8' ),
				'author'    => (string) $comment->comment_author,
				'date'      => (string) $comment->comment_date,
				'excerpt'   => wp_trim_words( (string) $comment->comment_content, 22 ),
				'answered'  => isset( $answered[ $id ] ),
			);
		}

		return $threads;
	}

	/* ---------------------------------------------------------------------- */
	/*                             Notificações                               */
	/* ---------------------------------------------------------------------- */

	/**
	 * As notificações publicadas, com alcance e leitura.
	 *
	 * @param array<string, mixed> $players Resultado de `players()`.
	 * @return array<int, array<string, mixed>>
	 */
	private static function notifications( array $players ): array {
		$posts = get_posts(
			array(
				'post_type'        => Notifications::POST_TYPE,
				'post_status'      => 'publish',
				'posts_per_page'   => 100,
				'orderby'          => 'date',
				'order'            => 'DESC',
				'suppress_filters' => true,
			)
		);

		$rows = array();

		foreach ( $posts as $post ) {
			$id     = (int) $post->ID;
			$target = (int) get_post_meta( $id, Notifications::META_USER, true );

			// Recado individual alcança uma pessoa, por mais alto que seja o
			// tier pedido — é a mesma regra que o site aplica ao entregar.
			$audience = $target > 0
				? 1
				: self::reach( (string) get_post_meta( $id, Notifications::META_MINIMUM_TIER, true ), $players['tier_of'] );

			$rows[] = array(
				'id'       => $id,
				'title'    => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
				'type'     => (string) get_post_meta( $id, Notifications::META_TYPE, true ),
				'date'     => (string) $post->post_date,
				'target'   => $target,
				'audience' => $audience,
				'read'     => (int) ( $players['read'][ $id ] ?? 0 ),
			);
		}

		return $rows;
	}

	/* ---------------------------------------------------------------------- */
	/*                                Auxiliares                              */
	/* ---------------------------------------------------------------------- */

	/**
	 * Um mapa aula => valor da meta do jogador.
	 *
	 * @param int    $user_id Jogador.
	 * @param string $meta    Chave da meta.
	 * @return array<int, int>
	 */
	private static function map( int $user_id, string $meta ): array {
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
	 * O último dia em que o jogador abriu uma aula (`AAAA-MM-DD`), ou vazio.
	 *
	 * É o que temos de "último acesso": o WordPress não guarda data de login,
	 * e o site é headless — quem entra pelo front nem passa pelo wp-login.
	 *
	 * @param int $user_id Jogador.
	 */
	private static function last_day( int $user_id ): string {
		$stored = get_user_meta( $user_id, Progress::META_DAYS, true );

		if ( ! is_array( $stored ) || array() === $stored ) {
			return '';
		}

		$days = array_filter(
			$stored,
			static fn( $day ): bool => is_string( $day ) && 1 === preg_match( '/^\d{4}-\d{2}-\d{2}$/', $day )
		);

		if ( array() === $days ) {
			return '';
		}

		return (string) max( $days );
	}
}
