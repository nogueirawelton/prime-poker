<?php
/**
 * Ajustes da autenticação JWT.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validade do authToken emitido pelo wp-graphql-jwt-authentication.
 *
 * O padrão do plugin são 300 segundos. Como o front renova o token de forma
 * silenciosa no proxy, esses 5 minutos não derrubam ninguém — mas cada
 * renovação é uma ida ao WordPress, e a 300s isso acontece a cada 5 minutos de
 * navegação. Uma hora reduz as renovações em doze vezes sem mudar o modelo de
 * segurança de forma relevante: o refreshToken continua sendo o que de fato
 * sustenta a sessão, e revogá-lo continua encerrando o acesso.
 */
final class Auth {

	/**
	 * Validade do authToken, em segundos.
	 *
	 * Valor literal em vez de `HOUR_IN_SECONDS` para não depender da ordem de
	 * carregamento das constantes do núcleo na avaliação da constante.
	 */
	private const TOKEN_TTL = 3600;

	/**
	 * Registra os hooks.
	 *
	 * O filtro é inofensivo quando o plugin JWT não está instalado: ninguém o
	 * aplica, e nada acontece.
	 */
	public static function boot(): void {
		add_filter( 'graphql_jwt_auth_expire', array( self::class, 'token_ttl' ) );
	}

	/**
	 * Devolve a validade do authToken.
	 *
	 * @param mixed $expiration Validade em segundos definida pelo plugin JWT.
	 */
	public static function token_ttl( $expiration ) {
		/**
		 * Validade do authToken, em segundos.
		 *
		 * O front não replica este número: ele lê o `exp` do próprio token
		 * para saber quando renovar. Mudar aqui basta.
		 *
		 * @param int   $ttl        Validade em segundos.
		 * @param mixed $expiration Valor original do plugin JWT.
		 */
		return (int) apply_filters( 'prime_players_token_ttl', self::TOKEN_TTL, $expiration );
	}
}
