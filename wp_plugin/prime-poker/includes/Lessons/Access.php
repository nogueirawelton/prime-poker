<?php
/**
 * Quem vê as aulas e quem assiste a cada uma.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Lessons;

use PrimePoker\Players\Tiers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * As duas portas das aulas.
 *
 * 1. **Ver a aula** (título, trilha, duração, capa): qualquer jogador, de
 *    qualquer tier. É o que permite mostrar o card com cadeado e o convite ao
 *    upgrade. Visitante anônimo não vê nada — nem no GraphQL, nem no REST.
 * 2. **Assistir** (vídeo e materiais): só quem tem a capability do tier
 *    mínimo da aula. O conteúdo protegido nem sai do servidor para os outros.
 *
 * A equipe (`edit_posts`) passa pelas duas, para conferir o que publicou.
 */
final class Access {

	/** Meta do ACF com o tier mínimo (campo `minimum_tier`). */
	public const META_MINIMUM_TIER = 'minimum_tier';

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_filter( 'graphql_data_is_private', array( self::class, 'hide_from_visitors' ), 10, 3 );
		add_filter( 'rest_pre_dispatch', array( self::class, 'guard_rest' ), 10, 3 );
	}

	/**
	 * A pessoa logada pode ver o acervo?
	 */
	public static function can_browse(): bool {
		return current_user_can( Tiers::CAP_PLAYER_AREA ) || current_user_can( 'edit_posts' );
	}

	/**
	 * Tier mínimo da aula.
	 *
	 * Vazio ou desconhecido (tier removido, valor digitado à mão) vale como o
	 * tier mais baixo: uma aula sem regra fica aberta a todos os jogadores, em
	 * vez de trancada para todos sem ninguém perceber.
	 *
	 * @param int $post_id ID da aula.
	 */
	public static function minimum_tier( int $post_id ): string {
		$tier  = (string) get_post_meta( $post_id, self::META_MINIMUM_TIER, true );
		$slugs = Tiers::slugs();

		return Tiers::exists( $tier ) ? $tier : (string) reset( $slugs );
	}

	/**
	 * A pessoa logada pode assistir a esta aula?
	 *
	 * Por capability, nunca pelo nome do tier: quem tem `view_content_gold` é
	 * gold ou superior, e um tier novo no meio da hierarquia não muda nada aqui.
	 *
	 * @param int $post_id ID da aula.
	 */
	public static function can_watch( int $post_id ): bool {
		if ( current_user_can( 'edit_posts' ) ) {
			return true;
		}

		if ( ! current_user_can( Tiers::CAP_PLAYER_AREA ) ) {
			return false;
		}

		$capability = Tiers::content_capability( self::minimum_tier( $post_id ) );

		return null !== $capability && current_user_can( $capability );
	}

	/**
	 * Esconde as aulas de quem não é jogador, no GraphQL.
	 *
	 * Vale para a listagem e para a aula avulsa: as duas passam pelo model.
	 * Só acrescenta restrição — nunca torna público o que o WPGraphQL já
	 * considerou privado (rascunho, por exemplo).
	 *
	 * @param bool   $is_private Decisão do WPGraphQL.
	 * @param string $model_name Model consultado.
	 * @param mixed  $data       Objeto do model.
	 */
	public static function hide_from_visitors( $is_private, $model_name, $data ): bool {
		if ( $is_private ) {
			return true;
		}

		if ( 'PostObject' !== $model_name || ! $data instanceof \WP_Post || Content::POST_TYPE !== $data->post_type ) {
			return false;
		}

		return ! self::can_browse();
	}

	/**
	 * Fecha `/wp/v2/aula` para quem não é da equipe.
	 *
	 * O JSON do ACF registra a aula sem REST (editor clássico), então a rota
	 * nem existe. Isto cobre o dia em que alguém ligar "Show in REST API" no
	 * painel — o que troca o editor para o de blocos e, por padrão, serviria
	 * qualquer aula publicada a qualquer visitante.
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

		if ( ! preg_match( '#^/wp/v2/' . Content::POST_TYPE . '(/|$)#', $request->get_route() ) ) {
			return $result;
		}

		if ( current_user_can( 'edit_posts' ) ) {
			return $result;
		}

		return new \WP_Error(
			'rest_forbidden',
			__( 'Sem permissão para acessar as aulas.', 'prime-poker' ),
			array( 'status' => is_user_logged_in() ? 403 : 401 )
		);
	}
}
