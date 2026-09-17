<?php
/**
 * Limpa o cache do front a cada publicação.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Cache;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Avisa o Next.js quando algo que ele exibe muda no WordPress.
 *
 * O front guarda as respostas do GraphQL em cache por horas. Sem este aviso,
 * quem publica recarrega o site e continua vendo a versão antiga até o cache
 * vencer sozinho.
 *
 * Cada mudança vira uma ou mais TAGS — as mesmas de `src/lib/cache-tags.ts`
 * no front. Renomear uma tag lá exige renomear aqui.
 *
 * As tags de uma requisição são acumuladas e enviadas uma única vez, no
 * `shutdown`: salvar um post dispara vários hooks (post, termos, meta do
 * Yoast), e sem o acúmulo cada um viraria uma chamada ao front.
 */
final class Revalidation {

	/** Option com as URLs do front, uma por linha (produção, staging…). */
	public const OPTION = 'prime_poker_revalidate_urls';

	private const PAGE = 'prime-poker-cache';

	/**
	 * Tags pendentes desta requisição, como chaves para não repetir.
	 *
	 * @var array<string, true>
	 */
	private static array $pendentes = array();

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'wp_after_insert_post', array( self::class, 'on_post' ), 10, 4 );
		add_action( 'before_delete_post', array( self::class, 'on_delete_post' ), 10, 2 );

		add_action( 'saved_term', array( self::class, 'on_term' ), 10, 3 );
		add_action( 'delete_term', array( self::class, 'on_delete_term' ), 10, 3 );

		add_action( 'wp_insert_comment', array( self::class, 'on_new_comment' ), 10, 2 );
		add_action( 'transition_comment_status', array( self::class, 'on_comment_status' ), 10, 3 );
		add_action( 'edit_comment', array( self::class, 'on_edit_comment' ) );
		add_action( 'delete_comment', array( self::class, 'on_edit_comment' ) );

		add_action( 'shutdown', array( self::class, 'dispatch' ) );

		add_action( 'admin_menu', array( self::class, 'menu' ) );
		add_action( 'admin_init', array( self::class, 'register_setting' ) );
		add_action( 'admin_post_prime_poker_flush_cache', array( self::class, 'flush_now' ) );
	}

	/* ---------------------------------------------------------------------- */
	/*                              Mapeamento                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Tags afetadas por um post, pelo tipo.
	 *
	 * Tipo desconhecido que aparece no GraphQL cai em `cms`, que limpa todo o
	 * conteúdo do WordPress: é mais caro, mas nunca deixa o site desatualizado
	 * quando um CPT novo surgir antes de ganhar o próprio mapeamento.
	 *
	 * @return array<int, string>
	 */
	private static function tags_for_post( \WP_Post $post ): array {
		switch ( $post->post_type ) {
			case 'post':
				// A página do post também leva `posts`, então esta tag sozinha
				// cobre listagem, destaques, relacionados, sitemap e o post.
				return array( 'posts', 'categories' );

			case 'page':
				// O Yoast da página é salvo junto com ela e o front o busca à
				// parte, sob `seo`. A home ainda tem os campos ACF, sob `home`.
				return 'home' === $post->post_name ? array( 'home', 'seo' ) : array( 'seo' );

			// Slugs do WordPress; no GraphQL eles aparecem como Instrutor e
			// Depoimento. Hoje só aparecem na home.
			case 'instructor':
			case 'testimonial':
				return array( 'home' );
		}

		$tipo = get_post_type_object( $post->post_type );

		if ( $tipo && ! empty( $tipo->show_in_graphql ) ) {
			return array( 'cms' );
		}

		return array();
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Hooks                                  */
	/* ---------------------------------------------------------------------- */

	/**
	 * Criação, edição, publicação, despublicação e lixeira.
	 *
	 * O `wp_after_insert_post` roda depois de termos e metadados salvos — o
	 * `save_post` roda antes, e o front poderia rebuscar o post sem a
	 * categoria nova. A lixeira também passa por aqui (`wp_trash_post` usa
	 * `wp_update_post`).
	 *
	 * @param int           $post_id     ID do post.
	 * @param \WP_Post      $post        Post salvo.
	 * @param bool          $update      Se é atualização.
	 * @param \WP_Post|null $post_before Estado anterior, em atualizações.
	 */
	public static function on_post( int $post_id, \WP_Post $post, bool $update, $post_before ): void {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		$antes = $post_before instanceof \WP_Post ? $post_before->post_status : 'new';

		// Só interessa o que o site exibe: estava publicado ou passou a estar.
		// Rascunho salvo de novo não muda nada no front.
		if ( 'publish' !== $post->post_status && 'publish' !== $antes ) {
			return;
		}

		self::queue( self::tags_for_post( $post ) );
	}

	/**
	 * Exclusão definitiva de um post que ainda estava publicado.
	 *
	 * O caminho normal é lixeira → excluir, e a lixeira já limpou o cache;
	 * isto cobre a exclusão direta (WP-CLI, `EMPTY_TRASH_DAYS` = 0).
	 *
	 * @param int      $post_id ID do post.
	 * @param \WP_Post $post    Post excluído.
	 */
	public static function on_delete_post( int $post_id, $post ): void {
		if ( $post instanceof \WP_Post && 'publish' === $post->post_status ) {
			self::queue( self::tags_for_post( $post ) );
		}
	}

	/**
	 * Termo criado ou editado.
	 *
	 * @param int    $term_id  ID do termo.
	 * @param int    $tt_id    ID da taxonomia do termo.
	 * @param string $taxonomy Taxonomia.
	 */
	public static function on_term( int $term_id, int $tt_id, string $taxonomy ): void {
		if ( 'category' === $taxonomy ) {
			// O nome da categoria aparece nos cards dos posts.
			self::queue( array( 'categories', 'posts' ) );
		}

		if ( 'post_tag' === $taxonomy ) {
			// As tags dos instrutores são as especialidades exibidas na home.
			self::queue( array( 'home' ) );
		}
	}

	/**
	 * Termo excluído.
	 *
	 * @param int    $term_id  ID do termo.
	 * @param int    $tt_id    ID da taxonomia do termo.
	 * @param string $taxonomy Taxonomia.
	 */
	public static function on_delete_term( int $term_id, int $tt_id, string $taxonomy ): void {
		self::on_term( $term_id, $tt_id, $taxonomy );
	}

	/**
	 * Comentário novo, só se já nasceu aprovado.
	 *
	 * Comentário retido na moderação não aparece no site; ele limpa o cache
	 * quando for aprovado, pelo `transition_comment_status`.
	 *
	 * @param int         $comment_id ID do comentário.
	 * @param \WP_Comment $comment    Comentário.
	 */
	public static function on_new_comment( int $comment_id, $comment ): void {
		if ( $comment instanceof \WP_Comment && '1' === (string) $comment->comment_approved ) {
			self::queue_comments( $comment );
		}
	}

	/**
	 * Aprovação, reprovação, spam e lixeira.
	 *
	 * @param string      $new_status Status novo.
	 * @param string      $old_status Status anterior.
	 * @param \WP_Comment $comment    Comentário.
	 */
	public static function on_comment_status( $new_status, $old_status, $comment ): void {
		if ( $comment instanceof \WP_Comment && ( 'approved' === $new_status || 'approved' === $old_status ) ) {
			self::queue_comments( $comment );
		}
	}

	/**
	 * Comentário editado ou excluído.
	 *
	 * @param int|string $comment_id ID do comentário.
	 */
	public static function on_edit_comment( $comment_id ): void {
		$comment = get_comment( (int) $comment_id );

		if ( $comment instanceof \WP_Comment ) {
			self::queue_comments( $comment );
		}
	}

	/**
	 * A tag de comentários é por post: `comments:<databaseId do post>`.
	 */
	private static function queue_comments( \WP_Comment $comment ): void {
		$post_id = (int) $comment->comment_post_ID;

		if ( $post_id > 0 ) {
			self::queue( array( "comments:{$post_id}" ) );
		}
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Envio                                  */
	/* ---------------------------------------------------------------------- */

	/**
	 * Acumula tags para o envio no fim da requisição.
	 *
	 * @param array<int, string> $tags Tags.
	 */
	private static function queue( array $tags ): void {
		foreach ( $tags as $tag ) {
			self::$pendentes[ $tag ] = true;
		}
	}

	/**
	 * URLs do front configuradas, sem barra final.
	 *
	 * @return array<int, string>
	 */
	public static function urls(): array {
		$linhas = preg_split( '/\R/', (string) get_option( self::OPTION, '' ) ) ?: array();
		$urls   = array();

		foreach ( $linhas as $linha ) {
			$url = esc_url_raw( trim( $linha ) );

			if ( '' !== $url ) {
				$urls[] = untrailingslashit( $url );
			}
		}

		return array_values( array_unique( $urls ) );
	}

	/**
	 * Envia as tags acumuladas a cada front configurado.
	 */
	public static function dispatch(): void {
		if ( array() === self::$pendentes ) {
			return;
		}

		$tags            = array_keys( self::$pendentes );
		self::$pendentes = array();

		self::send( $tags, false );
	}

	/**
	 * Chama `/api/revalidate` em cada front.
	 *
	 * Sem bloqueio por padrão: quem clicou em "Publicar" não espera o front
	 * responder. Uma falha aqui nunca pode impedir a publicação — no pior caso
	 * o conteúdo aparece quando o cache vencer sozinho.
	 *
	 * @param array<int, string> $tags     Tags; vazio limpa o conjunto padrão do front.
	 * @param bool               $blocking Se espera a resposta (usado pelo botão manual).
	 * @return array<string, int|string> Resultado por URL: status HTTP ou mensagem de erro.
	 */
	private static function send( array $tags, bool $blocking ): array {
		/**
		 * Tags enviadas ao front — ponto para acrescentar ou remover.
		 *
		 * @param array<int, string> $tags Tags.
		 */
		$tags = (array) apply_filters( 'prime_poker_revalidate_tags', $tags );

		$query = implode(
			'&',
			array_map( static fn( $tag ) => 'tag=' . rawurlencode( (string) $tag ), $tags )
		);

		$resultados = array();

		foreach ( self::urls() as $base ) {
			$url = $base . '/api/revalidate/' . ( '' !== $query ? '?' . $query : '' );

			$resposta = wp_remote_get(
				$url,
				array(
					'blocking' => $blocking,
					'timeout'  => $blocking ? 15 : 3,
				)
			);

			$resultados[ $base ] = is_wp_error( $resposta )
				? $resposta->get_error_message()
				: (int) wp_remote_retrieve_response_code( $resposta );
		}

		return $resultados;
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Painel                                 */
	/* ---------------------------------------------------------------------- */

	/**
	 * Configurações → Cache do site.
	 */
	public static function menu(): void {
		add_options_page(
			__( 'Cache do site', 'prime-poker' ),
			__( 'Cache do site', 'prime-poker' ),
			'manage_options',
			self::PAGE,
			array( self::class, 'render' )
		);
	}

	/**
	 * Registra a option com sanitização.
	 */
	public static function register_setting(): void {
		register_setting(
			self::PAGE,
			self::OPTION,
			array(
				'type'              => 'string',
				'default'           => '',
				'sanitize_callback' => static function ( $valor ): string {
					$linhas = preg_split( '/\R/', (string) $valor ) ?: array();
					$urls   = array_filter( array_map( static fn( $l ) => esc_url_raw( trim( $l ) ), $linhas ) );

					return implode( "\n", array_unique( $urls ) );
				},
			)
		);
	}

	/**
	 * Botão "Limpar cache agora": limpa tudo e mostra o retorno de cada front.
	 */
	public static function flush_now(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Sem permissão.', 'prime-poker' ), 403 );
		}

		check_admin_referer( 'prime_poker_flush_cache' );

		set_transient( 'prime_poker_flush_result', self::send( array(), true ), 60 );

		wp_safe_redirect( admin_url( 'options-general.php?page=' . self::PAGE ) );
		exit;
	}

	/**
	 * Tela de configuração.
	 */
	public static function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$resultado = get_transient( 'prime_poker_flush_result' );
		delete_transient( 'prime_poker_flush_result' );
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Cache do site', 'prime-poker' ); ?></h1>

			<p>
				<?php esc_html_e( 'O site guarda o conteúdo do WordPress em cache. Ao publicar, editar ou excluir posts, páginas, instrutores, depoimentos, categorias, tags e comentários, o plugin avisa cada endereço abaixo para buscar a versão nova.', 'prime-poker' ); ?>
			</p>

			<?php if ( is_array( $resultado ) ) : ?>
				<div class="notice notice-info">
					<?php if ( array() === $resultado ) : ?>
						<p><?php esc_html_e( 'Nenhum endereço configurado.', 'prime-poker' ); ?></p>
					<?php else : ?>
						<?php foreach ( $resultado as $base => $status ) : ?>
							<p>
								<code><?php echo esc_html( $base ); ?></code> →
								<?php
								echo 200 === $status
									? esc_html__( 'cache limpo', 'prime-poker' )
									: esc_html( (string) $status );
								?>
							</p>
						<?php endforeach; ?>
					<?php endif; ?>
				</div>
			<?php endif; ?>

			<form method="post" action="options.php">
				<?php settings_fields( self::PAGE ); ?>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row">
							<label for="<?php echo esc_attr( self::OPTION ); ?>"><?php esc_html_e( 'Endereços do site', 'prime-poker' ); ?></label>
						</th>
						<td>
							<textarea
								id="<?php echo esc_attr( self::OPTION ); ?>"
								name="<?php echo esc_attr( self::OPTION ); ?>"
								rows="4"
								class="large-text code"
								placeholder="https://primepokerteam.com.br"
							><?php echo esc_textarea( (string) get_option( self::OPTION, '' ) ); ?></textarea>
							<p class="description">
								<?php esc_html_e( 'Um por linha, sem caminho: produção e staging.', 'prime-poker' ); ?>
							</p>
						</td>
					</tr>
				</table>

				<?php submit_button(); ?>
			</form>

			<hr>

			<h2><?php esc_html_e( 'Limpar manualmente', 'prime-poker' ); ?></h2>
			<p><?php esc_html_e( 'Força todos os endereços a buscarem tudo de novo no WordPress. Útil depois de mudanças que não passam pelos hooks, como importações.', 'prime-poker' ); ?></p>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="prime_poker_flush_cache">
				<?php wp_nonce_field( 'prime_poker_flush_cache' ); ?>
				<?php submit_button( __( 'Limpar cache agora', 'prime-poker' ), 'secondary', 'submit', false ); ?>
			</form>
		</div>
		<?php
	}
}
