import type { JWTVerifyOptions } from "jose";

/**
 * Opções de verificação do access token do WordPress.
 *
 * Compartilhadas entre o proxy e o `getSession()` para os dois nunca
 * discordarem sobre o que é um token válido. Sem dependências de propósito:
 * o proxy não pode importar nada que arraste `next/cache`.
 *
 * `clockTolerance` porque o WordPress emite o token com `nbf` = `iat` = o
 * relógio DELE. Um servidor do WP poucos segundos adiantado em relação à
 * Vercel faz o token recém-emitido "ainda não valer" — e o login mandaria a
 * pessoa de volta para a tela de login. Medido em 17/09/2026: ~2s de
 * diferença.
 */
export const JWT_VERIFY_OPTIONS: JWTVerifyOptions = {
  algorithms: ["HS256"],
  clockTolerance: 30,
};
