<?php
/**
 * Redefinição de senha pelo front.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

use PrimePoker\Cache\Revalidation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * E-mail de redefinição com link para o site, e sessões encerradas na troca.
 *
 * O `sendPasswordResetEmail` do WPGraphQL monta o e-mail com os mesmos filtros
 * do núcleo (`retrieve_password_title` / `retrieve_password_message`), então
 * um único ajuste cobre o front, o "Perdeu a senha?" do wp-login.php e o
 * "Enviar redefinição de senha" da lista de usuários.
 */
final class PasswordReset {

	/**
	 * Cabeçalho em que o front informa o próprio endereço.
	 *
	 * Serve para o link do e-mail voltar ao ambiente de onde o pedido saiu
	 * (produção ou staging). Só é aceito se estiver entre os endereços de
	 * Configurações → Cache do site: sem essa lista, qualquer um poderia pedir
	 * a redefinição de uma conta alheia informando o próprio domínio — e o
	 * e-mail legítimo entregaria a chave a esse domínio.
	 */
	private const HEADER = 'HTTP_X_PRIME_FRONT_URL';

	/** Caminho da página de redefinição no front. */
	private const PATH = '/redefinir-senha/';

	/** Meta do plugin JWT com o segredo do usuário. */
	private const JWT_SECRET_META = 'graphql_jwt_auth_secret';

	/**
	 * HTML montado nesta requisição, para o `wp_mail` reconhecer o e-mail.
	 */
	private static ?string $html = null;

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_filter( 'retrieve_password_title', array( self::class, 'title' ), 10, 3 );
		add_filter( 'retrieve_password_message', array( self::class, 'message' ), 10, 4 );
		add_filter( 'wp_mail', array( self::class, 'as_html' ) );

		add_action( 'after_password_reset', array( self::class, 'end_sessions' ) );
		add_action( 'profile_update', array( self::class, 'end_sessions_on_password_change' ), 10, 3 );
		add_filter( 'graphql_jwt_auth_validate_token', array( self::class, 'check_user_secret' ) );
	}

	/* ---------------------------------------------------------------------- */
	/*                                 E-mail                                 */
	/* ---------------------------------------------------------------------- */

	/**
	 * Assunto.
	 *
	 * @param string $title Assunto padrão.
	 */
	public static function title( $title ): string {
		return sprintf(
			/* translators: %s: nome do site. */
			__( 'Redefinição de senha — %s', 'prime-poker' ),
			self::site_name()
		);
	}

	/**
	 * Corpo em HTML, com o link para o front.
	 *
	 * Sem endereço do front configurado, mantém a mensagem padrão: um link
	 * para o wp-login.php ainda funciona, um link para lugar nenhum não.
	 *
	 * @param string   $message    Mensagem padrão.
	 * @param string   $key        Chave de redefinição.
	 * @param string   $user_login Login do usuário.
	 * @param \WP_User $user       Usuário.
	 */
	public static function message( $message, $key, $user_login, $user ): string {
		$front = self::front_url();

		if ( null === $front || ! $user instanceof \WP_User ) {
			return (string) $message;
		}

		$link = add_query_arg(
			array(
				'key'   => $key,
				'login' => rawurlencode( $user_login ),
			),
			$front . self::PATH
		);

		self::$html = self::template( $user, $link );

		return self::$html;
	}

	/**
	 * Marca como HTML só o e-mail montado acima.
	 *
	 * Pelo filtro do `wp_mail`, e não pelo `wp_mail_content_type` global:
	 * este não sabe qual e-mail está saindo e transformaria em HTML qualquer
	 * outro enviado na mesma requisição.
	 *
	 * @param array<string, mixed> $args Argumentos do `wp_mail`.
	 * @return array<string, mixed>
	 */
	public static function as_html( array $args ): array {
		if ( null === self::$html || ( $args['message'] ?? null ) !== self::$html ) {
			return $args;
		}

		self::$html = null;

		$headers   = (array) ( $args['headers'] ?? array() );
		$headers[] = 'Content-Type: text/html; charset=UTF-8';

		$args['headers'] = $headers;

		return $args;
	}

	/**
	 * Endereço do front para o link.
	 *
	 * O informado pelo front vence se estiver na lista; senão, o primeiro da
	 * lista (produção, por convenção).
	 */
	private static function front_url(): ?string {
		$permitidos = Revalidation::urls();

		if ( array() === $permitidos ) {
			return null;
		}

		$pedido = isset( $_SERVER[ self::HEADER ] )
			? untrailingslashit( esc_url_raw( wp_unslash( (string) $_SERVER[ self::HEADER ] ) ) )
			: '';

		return in_array( $pedido, $permitidos, true ) ? $pedido : $permitidos[0];
	}

	/**
	 * Nome do site, sem entidades HTML.
	 */
	private static function site_name(): string {
		return wp_specialchars_decode( (string) get_option( 'blogname' ), ENT_QUOTES );
	}

	/**
	 * HTML do e-mail.
	 *
	 * Tabelas e estilos inline porque é o que Gmail e Outlook respeitam. Sem
	 * imagem de logo: SVG é bloqueado pela maioria dos clientes e imagem
	 * externa costuma vir oculta até o usuário liberar.
	 *
	 * @param \WP_User $user Usuário.
	 * @param string   $link Link de redefinição.
	 */
	private static function template( \WP_User $user, string $link ): string {
		$horas = (int) round( (int) apply_filters( 'password_reset_expiration', DAY_IN_SECONDS ) / HOUR_IN_SECONDS );
		$nome  = trim( (string) $user->first_name ) ?: trim( (string) $user->display_name );
		$site  = self::site_name();

		$saudacao = '' !== $nome
			/* translators: %s: primeiro nome. */
			? sprintf( __( 'Olá, %s!', 'prime-poker' ), $nome )
			: __( 'Olá!', 'prime-poker' );

		ob_start();
		?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo esc_html( self::title( '' ) ); ?></title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
	<tr>
		<td align="center" style="padding:32px 16px;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#221e1e;border-radius:12px;font-family:Montserrat,Arial,Helvetica,sans-serif;color:#ffffff;">
				<tr>
					<td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.1);">
						<span style="font-size:18px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
							Prime <span style="color:#ff1820;">Poker</span> Team
						</span>
					</td>
				</tr>
				<tr>
					<td style="padding:32px;">
						<h1 style="margin:0 0 16px;font-size:22px;font-weight:900;text-transform:uppercase;">
							<?php esc_html_e( 'Redefinir sua senha', 'prime-poker' ); ?>
						</h1>

						<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);">
							<?php echo esc_html( $saudacao ); ?>
						</p>

						<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);">
							<?php
							echo esc_html(
								sprintf(
									/* translators: %s: e-mail da conta. */
									__( 'Recebemos um pedido para redefinir a senha da conta %s. Clique no botão abaixo para criar uma nova senha.', 'prime-poker' ),
									$user->user_email
								)
							);
							?>
						</p>

						<table role="presentation" cellpadding="0" cellspacing="0">
							<tr>
								<td style="border-radius:6px;background:#ff1820;">
									<a href="<?php echo esc_url( $link ); ?>" style="display:inline-block;padding:16px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">
										<?php esc_html_e( 'Criar nova senha', 'prime-poker' ); ?>
									</a>
								</td>
							</tr>
						</table>

						<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.6);">
							<?php
							echo esc_html(
								sprintf(
									/* translators: %d: horas de validade do link. */
									_n( 'O link vale por %d hora e só pode ser usado uma vez.', 'O link vale por %d horas e só pode ser usado uma vez.', $horas, 'prime-poker' ),
									$horas
								)
							);
							?>
						</p>

						<p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.6);">
							<?php esc_html_e( 'Se você não pediu a redefinição, ignore este e-mail: sua senha continua a mesma.', 'prime-poker' ); ?>
						</p>

						<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.45);word-break:break-all;">
							<?php esc_html_e( 'Se o botão não funcionar, copie e cole este endereço no navegador:', 'prime-poker' ); ?><br>
							<a href="<?php echo esc_url( $link ); ?>" style="color:#ff1820;"><?php echo esc_html( $link ); ?></a>
						</p>
					</td>
				</tr>
				<tr>
					<td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:rgba(255,255,255,0.45);">
						<?php echo esc_html( $site ); ?>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>
</body>
</html>
		<?php
		return (string) ob_get_clean();
	}

	/* ---------------------------------------------------------------------- */
	/*                                Sessões                                 */
	/* ---------------------------------------------------------------------- */

	/**
	 * Senha redefinida: derruba as sessões abertas.
	 *
	 * Quem pede redefinição muitas vezes suspeita que a conta foi acessada por
	 * outra pessoa. Trocar o segredo JWT do usuário invalida todo refresh token
	 * já emitido; o access token em uso ainda vale até expirar (1 hora).
	 *
	 * @param \WP_User $user Usuário.
	 */
	public static function end_sessions( $user ): void {
		if ( $user instanceof \WP_User ) {
			self::rotate_secret( $user->ID );
		}
	}

	/**
	 * Troca de senha pelo painel (perfil ou edição de usuário).
	 *
	 * @param int      $user_id       ID do usuário.
	 * @param \WP_User $old_user_data Estado anterior.
	 * @param array    $userdata      Dados gravados.
	 */
	public static function end_sessions_on_password_change( $user_id, $old_user_data, $userdata = array() ): void {
		if ( ! $old_user_data instanceof \WP_User ) {
			return;
		}

		// `$userdata` traz o hash gravado (WP 5.8+); o `get_userdata` cobre
		// versões anteriores.
		$nova = $userdata['user_pass'] ?? get_userdata( (int) $user_id )->user_pass ?? '';

		if ( '' !== $nova && $nova !== $old_user_data->user_pass ) {
			self::rotate_secret( (int) $user_id );
		}
	}

	/**
	 * Gera um segredo novo para o usuário.
	 *
	 * Mesmo formato do plugin JWT (`uniqid`), gravado na mesma meta. Não mexe
	 * em quem teve o segredo revogado: o plugin trata isso como bloqueio.
	 */
	private static function rotate_secret( int $user_id ): void {
		if ( get_user_meta( $user_id, 'graphql_jwt_auth_secret_revoked', true ) ) {
			return;
		}

		update_user_meta( $user_id, self::JWT_SECRET_META, uniqid( 'graphql_jwt_', true ) );
	}

	/**
	 * Recusa refresh token emitido com um segredo antigo.
	 *
	 * O plugin JWT grava o segredo do usuário dentro do refresh token, mas na
	 * validação só confere se o segredo foi REVOGADO — nunca se ainda é o
	 * atual. Sem esta checagem, trocar o segredo não derrubaria sessão
	 * nenhuma.
	 *
	 * @param object|\WP_Error $token Token decodificado.
	 * @return object|\WP_Error
	 */
	public static function check_user_secret( $token ) {
		if ( ! is_object( $token ) || ! isset( $token->data->user->user_secret, $token->data->user->id ) ) {
			return $token;
		}

		$atual = (string) get_user_meta( (int) $token->data->user->id, self::JWT_SECRET_META, true );

		if ( '' === $atual || ! hash_equals( $atual, (string) $token->data->user->user_secret ) ) {
			return new \WP_Error(
				'invalid-jwt',
				__( 'Sessão encerrada. Entre novamente.', 'prime-poker' )
			);
		}

		return $token;
	}
}
