<?php
/**
 * Layout dos e-mails do site.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Mail;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Moldura HTML comum a todos os e-mails enviados pelo plugin.
 *
 * Tabelas e estilos inline porque é o que Gmail e Outlook respeitam. Sem
 * imagem de logo: SVG é bloqueado pela maioria dos clientes e imagem externa
 * costuma vir oculta até o usuário liberar — o nome em texto sempre aparece.
 */
final class Layout {

	/**
	 * Monta o HTML.
	 *
	 * Todo texto recebido é escapado aqui; nenhum parâmetro aceita HTML.
	 *
	 * @param array{
	 *     titulo: string,
	 *     saudacao?: string,
	 *     paragrafos?: array<int, string>,
	 *     botao?: array{texto: string, url: string},
	 *     notas?: array<int, string>,
	 *     link_reserva?: bool
	 * } $data Conteúdo.
	 */
	public static function render( array $data ): string {
		$button = $data['button'] ?? null;
		$site  = self::site_name();

		ob_start();
		?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo esc_html( $data['title'] ); ?></title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
	<tr>
		<td align="center" style="padding:32px 16px;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#27272a;border-radius:12px;font-family:Montserrat,Arial,Helvetica,sans-serif;color:#ffffff;">
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
							<?php echo esc_html( $data['title'] ); ?>
						</h1>

						<?php if ( ! empty( $data['greeting'] ) ) : ?>
							<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);">
								<?php echo esc_html( $data['greeting'] ); ?>
							</p>
						<?php endif; ?>

						<?php foreach ( $data['paragraphs'] ?? array() as $paragraph ) : ?>
							<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);">
								<?php echo esc_html( $paragraph ); ?>
							</p>
						<?php endforeach; ?>

						<?php if ( $button ) : ?>
							<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;">
								<tr>
									<td style="border-radius:6px;background:#ff1820;">
										<a href="<?php echo esc_url( $button['url'] ); ?>" style="display:inline-block;padding:16px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">
											<?php echo esc_html( $button['text'] ); ?>
										</a>
									</td>
								</tr>
							</table>
						<?php endif; ?>

						<?php foreach ( $data['notes'] ?? array() as $i => $note ) : ?>
							<p style="margin:<?php echo 0 === $i ? '24px' : '12px'; ?> 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.6);">
								<?php echo esc_html( $note ); ?>
							</p>
						<?php endforeach; ?>

						<?php if ( $button && ! empty( $data['fallback_link'] ) ) : ?>
							<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.45);word-break:break-all;">
								<?php esc_html_e( 'Se o botão não funcionar, copie e cole este endereço no navegador:', 'prime-poker' ); ?><br>
								<a href="<?php echo esc_url( $button['url'] ); ?>" style="color:#ff1820;"><?php echo esc_html( $button['url'] ); ?></a>
							</p>
						<?php endif; ?>
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

	/**
	 * Envia um e-mail montado com `render()`.
	 *
	 * @param string $to      Destinatário.
	 * @param string $subject Assunto.
	 * @param string $html    Corpo.
	 */
	public static function send( string $to, string $subject, string $html ): bool {
		return (bool) wp_mail( $to, $subject, $html, array( 'Content-Type: text/html; charset=UTF-8' ) );
	}

	/**
	 * Nome do site, sem entidades HTML.
	 */
	public static function site_name(): string {
		return wp_specialchars_decode( (string) get_option( 'blogname' ), ENT_QUOTES );
	}

	/**
	 * "Olá, Fulano!" pelo primeiro nome, ou "Olá!" sem nome.
	 *
	 * @param \WP_User $user Usuário.
	 */
	public static function greeting( \WP_User $user ): string {
		$nome = trim( (string) $user->first_name ) ?: trim( (string) $user->display_name );

		// O cadastro usa o e-mail como login; sem nome, o `display_name` pode
		// ser o próprio e-mail — melhor não chamar ninguém por ele.
		if ( '' === $nome || str_contains( $nome, '@' ) ) {
			return __( 'Olá!', 'prime-poker' );
		}

		/* translators: %s: primeiro nome. */
		return sprintf( __( 'Olá, %s!', 'prime-poker' ), $nome );
	}
}
