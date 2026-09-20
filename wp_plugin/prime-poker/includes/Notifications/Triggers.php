<?php
/**
 * Notificações que o site cria sozinho.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Notifications;

use PrimePoker\Lessons\Access;
use PrimePoker\Lessons\Content as Lessons;
use PrimePoker\Lessons\Questions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Os dois avisos automáticos desta versão.
 *
 * 1. **Aula publicada** — sai para quem tem o tier da aula. É o que traz o
 *    jogador de volta sem ninguém precisar escrever nada.
 * 2. **Dúvida respondida** — sai para quem perguntou, quando a equipe
 *    responde. Sem isto ele só descobre a resposta se voltar na aula por
 *    conta própria.
 *
 * O aviso da equipe não está aqui: aquele é escrito no painel.
 */
final class Triggers {

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'transition_post_status', array( self::class, 'lesson_published' ), 10, 3 );
		add_action( 'wp_insert_comment', array( self::class, 'question_answered' ), 10, 2 );
		add_action( 'transition_comment_status', array( self::class, 'comment_approved' ), 10, 3 );
	}

	/* ---------------------------------------------------------------------- */
	/*                              Aula publicada                            */
	/* ---------------------------------------------------------------------- */

	/**
	 * Aula que acabou de ir ao ar vira notificação.
	 *
	 * Só na passagem PARA publicada: salvar de novo uma aula já publicada
	 * avisaria o time inteiro a cada correção de vírgula.
	 *
	 * @param string   $new_status Novo status.
	 * @param string   $old_status Status anterior.
	 * @param \WP_Post $post       Post salvo.
	 */
	public static function lesson_published( $new_status, $old_status, $post ): void {
		if ( ! $post instanceof \WP_Post || Lessons::POST_TYPE !== $post->post_type ) {
			return;
		}

		if ( 'publish' !== $new_status || 'publish' === $old_status ) {
			return;
		}

		$title = trim( (string) $post->post_title );

		// Aula publicada sem título ainda não tem o que anunciar.
		if ( '' === $title ) {
			return;
		}

		Content::create(
			array(
				'type'         => 'aula',
				'title'        => 'Nova aula publicada',
				'description'  => self::describe_lesson( $post, $title ),
				'link'         => '/player/aulas/' . $post->post_name . '/',
				'minimum_tier' => Access::minimum_tier( $post->ID ),
			)
		);
	}

	/**
	 * "Título da aula, com Fulano." — ou só o título, sem instrutor.
	 *
	 * @param \WP_Post $post  Aula.
	 * @param string   $title Título já limpo.
	 */
	private static function describe_lesson( \WP_Post $post, string $title ): string {
		$instructor_id = (int) get_post_meta( $post->ID, 'instructor', true );
		$instructor    = $instructor_id > 0 ? get_post( $instructor_id ) : null;

		$name = $instructor instanceof \WP_Post ? trim( (string) $instructor->post_title ) : '';

		return '' !== $name ? "“{$title}”, com {$name}." : "“{$title}”.";
	}

	/* ---------------------------------------------------------------------- */
	/*                            Dúvida respondida                           */
	/* ---------------------------------------------------------------------- */

	/**
	 * Comentário novo: avisa quem perguntou, se for resposta da equipe.
	 *
	 * @param int         $comment_id ID do comentário.
	 * @param \WP_Comment $comment    Comentário.
	 */
	public static function question_answered( $comment_id, $comment = null ): void {
		if ( $comment instanceof \WP_Comment && '1' === (string) $comment->comment_approved ) {
			self::notify_asker( $comment );
		}
	}

	/**
	 * Resposta que só foi aprovada depois também avisa.
	 *
	 * As dúvidas das aulas entram aprovadas, mas uma resposta retida por um
	 * plugin antispam passaria batida sem isto.
	 *
	 * @param string      $new_status Novo status.
	 * @param string      $old_status Status anterior.
	 * @param \WP_Comment $comment    Comentário.
	 */
	public static function comment_approved( $new_status, $old_status, $comment ): void {
		if ( 'approved' === $new_status && 'approved' !== $old_status && $comment instanceof \WP_Comment ) {
			self::notify_asker( $comment );
		}
	}

	/**
	 * Avisa o autor da dúvida que ela foi respondida.
	 *
	 * @param \WP_Comment $comment Resposta.
	 */
	private static function notify_asker( \WP_Comment $comment ): void {
		$lesson = get_post( (int) $comment->comment_post_ID );

		if ( ! $lesson instanceof \WP_Post || Lessons::POST_TYPE !== $lesson->post_type ) {
			return;
		}

		// Só respostas da equipe: a réplica do próprio jogador dentro da
		// conversa não é notícia para ninguém.
		if ( ! Questions::is_answer( $comment ) ) {
			return;
		}

		$parent = (int) $comment->comment_parent > 0 ? get_comment( (int) $comment->comment_parent ) : null;
		$asker  = $parent instanceof \WP_Comment ? (int) $parent->user_id : 0;

		// Resposta sem pergunta identificada (comentário solto no painel) não
		// tem a quem avisar.
		if ( $asker <= 0 || $asker === (int) $comment->user_id ) {
			return;
		}

		Content::create(
			array(
				'type'        => 'suporte',
				'title'       => 'Sua dúvida foi respondida',
				'description' => self::describe_answer( $lesson ),
				'link'        => '/player/aulas/' . $lesson->post_name . '/',
				'user'        => $asker,
			)
		);
	}

	/**
	 * "Fulano respondeu você na aula Tal." — com o nome do instrutor da aula,
	 * que é como a resposta aparece para o jogador.
	 *
	 * @param \WP_Post $lesson Aula.
	 */
	private static function describe_answer( \WP_Post $lesson ): string {
		$instructor_id = (int) get_post_meta( $lesson->ID, 'instructor', true );
		$instructor    = $instructor_id > 0 ? get_post( $instructor_id ) : null;

		$name  = $instructor instanceof \WP_Post ? trim( (string) $instructor->post_title ) : '';
		$title = trim( (string) $lesson->post_title );

		return '' !== $name
			? "{$name} respondeu sua dúvida em “{$title}”."
			: "Sua dúvida em “{$title}” foi respondida.";
	}
}
