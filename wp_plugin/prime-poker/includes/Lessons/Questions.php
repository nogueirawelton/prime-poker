<?php
/**
 * Dúvidas dos jogadores nas aulas.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

use PrimePoker\Players\Profile;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * As dúvidas são comentários do WordPress no CPT aula.
 *
 * Comentário é a peça que o WordPress já tem pronta: painel de moderação,
 * resposta em linha, busca, exclusão, tudo de graça. O que este módulo faz é
 * fechá-la para a área do jogador e traduzi-la para o front.
 *
 * As três regras vieram das decisões de 20/09/2026:
 *
 * 1. **Quem responde é a equipe, em nome do instrutor.** Ninguém precisa de
 *    usuário novo no WordPress: quem responde pelo painel aparece com o nome
 *    do instrutor da aula (ver `author_label`).
 * 2. **Todos os jogadores da aula veem as dúvidas.** A pergunta de um serve
 *    aos outros; é o que faz a aula ficar mais completa com o tempo.
 * 3. **Sem moderação prévia.** Só jogador logado escreve, então a fila de
 *    aprovação custaria mais do que resolve — e uma dúvida que some da tela
 *    até alguém aprovar parece erro do site. A equipe ainda apaga ou edita
 *    pelo painel.
 *
 * Visitante anônimo não lê nada: nem pelo GraphQL, nem pelo REST.
 */
final class Questions {

	/** Limite da pergunta, em caracteres — o mesmo que o front avisa. */
	private const MAX_LENGTH = 2000;

	/**
	 * Marca do comentário que nasceu como PERGUNTA, no site.
	 *
	 * O que separa pergunta de resposta é por onde o comentário entrou, não
	 * quem o escreveu: alguém da equipe também estuda as aulas e pergunta
	 * pelo site, e a pergunta dele não é resposta do instrutor.
	 */
	private const META_QUESTION = '_prime_poker_question';

	/**
	 * Quem curtiu — lista de IDs de jogador.
	 *
	 * Vale para qualquer mensagem, pergunta ou resposta. Guardar quem curtiu,
	 * e não só o total, é o que permite desmarcar e contar uma vez por
	 * jogador.
	 */
	private const META_LIKES = '_prime_poker_likes';

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_filter( 'comments_open', array( self::class, 'open_for_players' ), 10, 2 );
		add_filter( 'option_thread_comments', array( self::class, 'enable_threads' ) );
		add_filter( 'pre_comment_approved', array( self::class, 'approve' ), 10, 2 );
		add_filter( 'graphql_data_is_private', array( self::class, 'hide_from_visitors' ), 10, 3 );
		add_filter( 'rest_pre_dispatch', array( self::class, 'guard_rest' ), 10, 3 );
		add_action( 'graphql_register_types', array( self::class, 'register' ) );
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Regras                                 */
	/* ---------------------------------------------------------------------- */

	/**
	 * Aula aceita dúvida de jogador; o resto do site segue como está.
	 *
	 * @param bool $open    Decisão do WordPress.
	 * @param int  $post_id ID do post.
	 */
	public static function open_for_players( $open, $post_id ): bool {
		$post = get_post( (int) $post_id );

		if ( ! $post instanceof \WP_Post || Content::POST_TYPE !== $post->post_type ) {
			return (bool) $open;
		}

		return Access::can_browse();
	}

	/**
	 * Liga os comentários aninhados.
	 *
	 * É o que faz o **Responder** do painel pendurar a resposta na pergunta,
	 * em vez de soltá-la no fim da lista — e é assim que o site sabe o que
	 * responde o quê. Com a opção desligada, toda resposta viraria uma
	 * pergunta órfã na tela do jogador.
	 *
	 * Ligado à força, e não pedido nas Configurações → Discussão, porque o
	 * site é headless: os únicos comentários que existem são as dúvidas das
	 * aulas, e elas precisam disto para funcionar.
	 *
	 * @param mixed $value Valor gravado na option.
	 */
	public static function enable_threads( $value ): int {
		return 1;
	}

	/**
	 * Dúvida de jogador entra aprovada.
	 *
	 * Só para as aulas: comentário em post do blog continua seguindo a
	 * configuração do WordPress.
	 *
	 * @param int|string           $approved Decisão do WordPress (1, 0 ou 'spam').
	 * @param array<string, mixed> $data     Dados do comentário.
	 * @return int|string
	 */
	public static function approve( $approved, $data ) {
		// Spam detectado por plugin continua spam: isto libera a fila de
		// moderação, não a proteção.
		if ( 'spam' === $approved || 'trash' === $approved ) {
			return $approved;
		}

		return self::is_lesson_comment( (int) ( $data['comment_post_ID'] ?? 0 ) ) ? 1 : $approved;
	}

	/**
	 * Esconde as dúvidas de quem não é jogador, no GraphQL.
	 *
	 * A aula já é privada para visitante; sem isto, os comentários dela
	 * continuariam legíveis pela consulta de comentários da raiz.
	 *
	 * @param bool   $is_private Decisão do WPGraphQL.
	 * @param string $model_name Model consultado.
	 * @param mixed  $data       Objeto do model.
	 */
	public static function hide_from_visitors( $is_private, $model_name, $data ): bool {
		if ( $is_private ) {
			return true;
		}

		if ( 'Comment' !== $model_name || ! $data instanceof \WP_Comment ) {
			return false;
		}

		return self::is_lesson_comment( (int) $data->comment_post_ID ) && ! Access::can_browse();
	}

	/**
	 * Fecha `/wp/v2/comments` para quem não é da equipe.
	 *
	 * A rota de comentários é pública por padrão e não sabe que a aula é
	 * privada: sem isto, as dúvidas sairiam por lá para qualquer visitante.
	 *
	 * @param mixed            $result  Resposta antecipada.
	 * @param \WP_REST_Server  $server  Servidor.
	 * @param \WP_REST_Request $request Requisição.
	 * @return mixed
	 */
	public static function guard_rest( $result, $server, $request ) {
		if ( null !== $result || ! $request instanceof \WP_REST_Request ) {
			return $result;
		}

		if ( ! preg_match( '#^/wp/v2/comments(/|$)#', $request->get_route() ) || current_user_can( 'edit_posts' ) ) {
			return $result;
		}

		return new \WP_Error(
			'rest_forbidden',
			__( 'Sem permissão para acessar as dúvidas das aulas.', 'prime-poker' ),
			array( 'status' => is_user_logged_in() ? 403 : 401 )
		);
	}

	/* ---------------------------------------------------------------------- */
	/*                                 GraphQL                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Campos da dúvida e a mutation de perguntar.
	 */
	public static function register(): void {
		register_graphql_fields(
			'Comment',
			array(
				'isInstructor' => array(
					'type'        => array( 'non_null' => 'Boolean' ),
					'description' => __( 'Se a resposta veio da equipe/instrutor, e não de um jogador.', 'prime-poker' ),
					'resolve'     => static fn( $comment ): bool => self::from_team( self::comment( $comment ) ),
				),
				'text'         => array(
					'type'        => array( 'non_null' => 'String' ),
					'description' => __( 'A dúvida em texto puro. O `content` do WPGraphQL vem com HTML; aqui não há o que formatar.', 'prime-poker' ),
					'resolve'     => static fn( $comment ): string => (string) ( self::comment( $comment )?->comment_content ?? '' ),
				),
				'authorLabel'  => array(
					'type'        => array( 'non_null' => 'String' ),
					'description' => __( 'Nome a exibir: o do instrutor da aula nas respostas da equipe, o do jogador nas perguntas.', 'prime-poker' ),
					'resolve'     => static fn( $comment ): string => self::author_label( self::comment( $comment ) ),
				),
				'authorAvatar' => array(
					'type'        => 'String',
					'description' => __( 'Foto de quem escreveu: a do instrutor da aula nas respostas da equipe, a do jogador nas perguntas. Null quando não há foto — aí o front mostra as iniciais.', 'prime-poker' ),
					'resolve'     => static fn( $comment ): ?string => self::author_avatar( self::comment( $comment ) ),
				),
				'isMine'       => array(
					'type'        => array( 'non_null' => 'Boolean' ),
					'description' => __( 'Se quem escreveu é o jogador logado. É o que libera responder dentro da própria conversa.', 'prime-poker' ),
					'resolve'     => static function ( $comment ): bool {
						$author = (int) ( self::comment( $comment )?->user_id ?? 0 );

						return $author > 0 && $author === get_current_user_id();
					},
				),
				'likeCount'    => array(
					'type'        => array( 'non_null' => 'Int' ),
					'description' => __( 'Quantos jogadores curtiram.', 'prime-poker' ),
					'resolve'     => static fn( $comment ): int => count( self::likes( self::comment_id( $comment ) ) ),
				),
				'liked'        => array(
					'type'        => array( 'non_null' => 'Boolean' ),
					'description' => __( 'Se o jogador logado curtiu.', 'prime-poker' ),
					'resolve'     => static fn( $comment ): bool => in_array( get_current_user_id(), self::likes( self::comment_id( $comment ) ), true ),
				),
			)
		);

		register_graphql_mutation(
			'askLessonQuestion',
			array(
				'description'         => __( 'Registra a dúvida do jogador logado na aula.', 'prime-poker' ),
				'inputFields'         => array(
					'lessonId' => array(
						'type'        => array( 'non_null' => 'Int' ),
						'description' => __( 'databaseId da aula.', 'prime-poker' ),
					),
					'text'     => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'A pergunta.', 'prime-poker' ),
					),
					'parentId' => array(
						'type'        => 'Int',
						'description' => __( 'databaseId da dúvida que está sendo respondida. Vazio abre uma dúvida nova.', 'prime-poker' ),
					),
				),
				'outputFields'        => array(
					'commentId' => array( 'type' => 'Int' ),
				),
				'mutateAndGetPayload' => static function ( array $input ): array {
					return array(
						'commentId' => self::ask(
							(int) $input['lessonId'],
							(string) $input['text'],
							(int) ( $input['parentId'] ?? 0 )
						),
					);
				},
			)
		);

		register_graphql_mutation(
			'toggleQuestionLike',
			array(
				'description'         => __( 'Curte ou descurte uma dúvida ou resposta.', 'prime-poker' ),
				'inputFields'         => array(
					'commentId' => array(
						'type'        => array( 'non_null' => 'Int' ),
						'description' => __( 'databaseId da dúvida.', 'prime-poker' ),
					),
				),
				'outputFields'        => array(
					'liked'     => array( 'type' => 'Boolean' ),
					'likeCount' => array( 'type' => 'Int' ),
				),
				'mutateAndGetPayload' => static fn( array $input ): array => self::toggle_like( (int) $input['commentId'] ),
			)
		);
	}

	/**
	 * Curte ou descurte uma mensagem.
	 *
	 * @param int $comment_id ID do comentário.
	 * @return array{liked: bool, likeCount: int}
	 * @throws \GraphQL\Error\UserError Se não for jogador ou a dúvida não existir.
	 */
	private static function toggle_like( int $comment_id ): array {
		$comment = get_comment( $comment_id );

		if ( ! Access::can_browse() ) {
			throw new \GraphQL\Error\UserError( __( 'É preciso estar logado como jogador.', 'prime-poker' ) );
		}

		if ( ! $comment instanceof \WP_Comment || ! self::is_lesson_comment( (int) $comment->comment_post_ID ) ) {
			throw new \GraphQL\Error\UserError( __( 'Dúvida não encontrada.', 'prime-poker' ) );
		}

		// Mesma régua de perguntar: quem não pode assistir vê a conversa —
		// ela é parte do convite ao upgrade —, mas não participa dela.
		if ( ! Access::can_watch( (int) $comment->comment_post_ID ) ) {
			throw new \GraphQL\Error\UserError( __( 'Sem acesso a esta aula.', 'prime-poker' ) );
		}

		$user_id = get_current_user_id();
		$likes   = self::likes( $comment_id );
		$liked   = in_array( $user_id, $likes, true );

		$likes = $liked
			? array_values( array_diff( $likes, array( $user_id ) ) )
			: array_merge( $likes, array( $user_id ) );

		update_comment_meta( $comment_id, self::META_LIKES, $likes );

		return array(
			'liked'     => ! $liked,
			'likeCount' => count( $likes ),
		);
	}

	/**
	 * Quem curtiu a dúvida.
	 *
	 * @param int $comment_id ID do comentário.
	 * @return array<int, int> IDs de jogador.
	 */
	private static function likes( int $comment_id ): array {
		if ( $comment_id <= 0 ) {
			return array();
		}

		$stored = get_comment_meta( $comment_id, self::META_LIKES, true );

		return is_array( $stored ) ? array_values( array_unique( array_map( 'intval', $stored ) ) ) : array();
	}

	/**
	 * Este comentário é uma resposta da equipe?
	 *
	 * Público porque as notificações precisam da mesma regra: avisar quem
	 * perguntou só faz sentido quando quem escreveu foi o outro lado.
	 *
	 * @param \WP_Comment|null $comment Comentário.
	 */
	public static function is_answer( ?\WP_Comment $comment ): bool {
		return self::from_team( $comment );
	}

	/**
	 * Grava a dúvida.
	 *
	 * Perguntar exige poder assistir, não só ver a aula: quem está olhando o
	 * card com cadeado ainda não tem o que perguntar sobre o conteúdo.
	 *
	 * @param int    $lesson_id ID da aula.
	 * @param string $text      A pergunta.
	 * @param int    $parent_id Dúvida sendo respondida; 0 abre uma nova.
	 * @throws \GraphQL\Error\UserError Se não puder perguntar ou o texto não servir.
	 */
	private static function ask( int $lesson_id, string $text, int $parent_id = 0 ): int {
		$post = get_post( $lesson_id );

		if ( ! $post instanceof \WP_Post || Content::POST_TYPE !== $post->post_type || 'publish' !== $post->post_status ) {
			throw new \GraphQL\Error\UserError( __( 'Aula não encontrada.', 'prime-poker' ) );
		}

		if ( ! Access::can_watch( $lesson_id ) ) {
			throw new \GraphQL\Error\UserError( __( 'Sem acesso a esta aula.', 'prime-poker' ) );
		}

		$text = trim( wp_strip_all_tags( $text ) );

		if ( '' === $text ) {
			throw new \GraphQL\Error\UserError( __( 'Escreva sua dúvida antes de enviar.', 'prime-poker' ) );
		}

		if ( mb_strlen( $text ) > self::MAX_LENGTH ) {
			throw new \GraphQL\Error\UserError( __( 'Dúvida muito longa.', 'prime-poker' ) );
		}

		// Responder algo de outra aula colocaria a resposta numa conversa que
		// o jogador nem está vendo.
		if ( $parent_id > 0 ) {
			$parent = get_comment( $parent_id );

			if ( ! $parent instanceof \WP_Comment || (int) $parent->comment_post_ID !== $lesson_id ) {
				throw new \GraphQL\Error\UserError( __( 'Dúvida não encontrada nesta aula.', 'prime-poker' ) );
			}
		}

		$user       = wp_get_current_user();
		$comment_id = wp_insert_comment(
			array(
				'comment_parent'       => $parent_id,
				'comment_post_ID'      => $lesson_id,
				'comment_content'      => $text,
				'user_id'              => $user->ID,
				'comment_author'       => $user->display_name,
				'comment_author_email' => $user->user_email,
				'comment_approved'     => 1,
				'comment_type'         => 'comment',
			)
		);

		if ( ! is_int( $comment_id ) || $comment_id <= 0 ) {
			throw new \GraphQL\Error\UserError( __( 'Não foi possível registrar a dúvida.', 'prime-poker' ) );
		}

		// É o que diferencia pergunta de resposta depois (ver `from_team`).
		add_comment_meta( $comment_id, self::META_QUESTION, 1, true );

		return $comment_id;
	}

	/* ---------------------------------------------------------------------- */
	/*                                Auxiliares                              */
	/* ---------------------------------------------------------------------- */

	/**
	 * O comentário é de uma aula?
	 *
	 * @param int $post_id ID do post comentado.
	 */
	private static function is_lesson_comment( int $post_id ): bool {
		$post = get_post( $post_id );

		return $post instanceof \WP_Post && Content::POST_TYPE === $post->post_type;
	}

	/**
	 * A resposta veio da equipe?
	 *
	 * Duas condições, e as duas importam:
	 *
	 * 1. **Não ter entrado pelo site como pergunta.** Quem é da equipe também
	 *    assiste às aulas e pergunta por lá; sem esta checagem, a pergunta
	 *    dele apareceria assinada pelo instrutor.
	 * 2. **Ter sido escrita por alguém com acesso ao painel** — é quem
	 *    responde em nome do instrutor. Pela capability, não pela role.
	 *
	 * Pública porque o painel de acompanhamento precisa da MESMA regra para
	 * separar dúvida de resposta; uma segunda definição de "veio da equipe"
	 * contaria dúvidas em aberto que não existem.
	 *
	 * @param \WP_Comment|null $comment Comentário.
	 */
	public static function from_team( ?\WP_Comment $comment ): bool {
		if ( ! $comment instanceof \WP_Comment ) {
			return false;
		}

		if ( metadata_exists( 'comment', (int) $comment->comment_ID, self::META_QUESTION ) ) {
			return false;
		}

		$user_id = (int) $comment->user_id;

		return $user_id > 0 && user_can( $user_id, 'edit_posts' );
	}

	/**
	 * Nome a exibir na conversa.
	 *
	 * A resposta da equipe sai com o nome do instrutor da aula — foi a
	 * decisão de quem responde. Aula sem instrutor cadastrado cai no nome de
	 * quem escreveu, que é melhor do que uma resposta sem assinatura.
	 *
	 * @param \WP_Comment|null $comment Comentário.
	 */
	private static function author_label( ?\WP_Comment $comment ): string {
		if ( ! $comment instanceof \WP_Comment ) {
			return '';
		}

		if ( ! self::from_team( $comment ) ) {
			return (string) $comment->comment_author;
		}

		$instructor_id = (int) get_post_meta( (int) $comment->comment_post_ID, 'instructor', true );
		$instructor    = $instructor_id > 0 ? get_post( $instructor_id ) : null;

		return $instructor instanceof \WP_Post && '' !== $instructor->post_title
			? $instructor->post_title
			: (string) $comment->comment_author;
	}

	/**
	 * Foto a exibir na conversa.
	 *
	 * Acompanha o `author_label`, e pelo mesmo motivo: a resposta da equipe
	 * sai em nome do instrutor da aula, então a cara dela é a **imagem
	 * destacada do instrutor**, e não a do membro da equipe que digitou. A
	 * pergunta do jogador sai com a foto que ele mesmo enviou no perfil.
	 *
	 * `null` quando não há foto. É de propósito: o `get_avatar_url()` do
	 * WordPress nunca volta vazio — sem Gravatar ele devolve a silhueta
	 * cinza —, e quem responde não é necessariamente um usuário com foto. Com
	 * `null`, o front cai nas iniciais, que ao menos dizem quem é.
	 *
	 * @param \WP_Comment|null $comment Comentário.
	 */
	private static function author_avatar( ?\WP_Comment $comment ): ?string {
		if ( ! $comment instanceof \WP_Comment ) {
			return null;
		}

		if ( ! self::from_team( $comment ) ) {
			$url = Profile::avatar_url( (int) $comment->user_id );

			return '' === $url ? null : $url;
		}

		$instructor_id = (int) get_post_meta( (int) $comment->comment_post_ID, 'instructor', true );
		$url           = $instructor_id > 0 ? get_the_post_thumbnail_url( $instructor_id, 'thumbnail' ) : false;

		return is_string( $url ) && '' !== $url ? $url : null;
	}

	/**
	 * ID do comentário a partir do model do WPGraphQL.
	 *
	 * @param mixed $comment Model de comentário do WPGraphQL.
	 */
	private static function comment_id( $comment ): int {
		return isset( $comment->databaseId ) ? (int) $comment->databaseId : 0;
	}

	/**
	 * `WP_Comment` a partir do model do WPGraphQL.
	 *
	 * @param mixed $comment Model de comentário do WPGraphQL.
	 */
	private static function comment( $comment ): ?\WP_Comment {
		$id = self::comment_id( $comment );

		return $id > 0 ? get_comment( $id ) : null;
	}
}
