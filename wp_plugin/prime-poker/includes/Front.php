<?php
/**
 * Endereço do site (front) para links enviados pelo WordPress.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker;

use PrimePoker\Cache\Revalidation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolve para qual front um link deve apontar.
 *
 * O front informa o próprio endereço no cabeçalho `X-Prime-Front-Url`, para o
 * link voltar ao ambiente de onde a ação saiu (produção ou staging). Só vale
 * se estiver entre os endereços de Configurações → Cache do site: sem essa
 * lista, qualquer um poderia pedir a redefinição de uma conta alheia
 * informando o próprio domínio — e o e-mail legítimo entregaria a chave a ele.
 */
final class Front {

	private const HEADER = 'HTTP_X_PRIME_FRONT_URL';

	/**
	 * O endereço informado, se permitido; senão o primeiro da lista
	 * (produção, por convenção). `null` sem nenhum endereço configurado.
	 */
	public static function url(): ?string {
		$permitidos = Revalidation::urls();

		if ( array() === $permitidos ) {
			return null;
		}

		$pedido = isset( $_SERVER[ self::HEADER ] )
			? untrailingslashit( esc_url_raw( wp_unslash( (string) $_SERVER[ self::HEADER ] ) ) )
			: '';

		return in_array( $pedido, $permitidos, true ) ? $pedido : $permitidos[0];
	}
}
