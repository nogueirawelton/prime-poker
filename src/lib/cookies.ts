/** `false` em dev: o navegador descarta cookie `Secure` numa origem http. */
const secure = process.env.NODE_ENV === "production";

/**
 * Cookie do access token, sem `maxAge` — vive enquanto o navegador estiver
 * aberto.
 *
 * De propósito não replicamos aqui a validade do JWT. Quem sabe quando o token
 * vence é o próprio token (`exp`), e é isso que o proxy lê para decidir
 * renovar. Fixar um número aqui criaria uma segunda fonte de verdade para
 * sincronizar com o `graphql_jwt_auth_expire` do WordPress — e quando as duas
 * divergissem, o sintoma seria uma sessão que cai sem motivo aparente.
 */
export const ACCESS_OPTS = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
};

/** Sem maxAge → morre quando o navegador fecha. */
export const REFRESH_SESSION_OPTS = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
};

/**
 * 30 dias.
 *
 * O refreshToken do WPGraphQL JWT vale 365 dias, mas essa validade é do token,
 * não da nossa sessão: manter um cookie de sessão por um ano é longo demais
 * para o risco. Quem manda aqui é o cookie.
 */
export const REFRESH_PERSISTENT_OPTS = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/**
 * Marcador do "continuar conectado".
 *
 * Quem reescreve o cookie de refresh é o proxy, que nunca viu o formulário e
 * não saberia qual validade reaplicar. Diferente do Gesdinet, o WPGraphQL JWT
 * não rotaciona o refreshToken — mas o proxy ainda precisa reescrever o cookie
 * para renovar a janela de 30 dias.
 */
export const REMEMBER_COOKIE = "remember_session";

export const REMEMBER_OPTS = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export function refreshOptsFor(remember: boolean) {
  return remember ? REFRESH_PERSISTENT_OPTS : REFRESH_SESSION_OPTS;
}
