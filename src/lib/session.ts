import "server-only";

import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

/**
 * Leitura da sessão a partir do cookie de access token.
 *
 * A verificação é LOCAL: nada de rede. O wp-graphql-jwt-authentication assina
 * com HS256 e segredo compartilhado — o mesmo `GRAPHQL_JWT_AUTH_SECRET_KEY` do
 * wp-config.php precisa estar aqui como `WP_JWT_SECRET`. Por ser simétrico,
 * esse segredo assina tokens válidos: ele nunca pode chegar ao cliente, e é o
 * motivo do `server-only` no topo.
 */
const getKey = cache(async () => {
  const segredo = process.env.WP_JWT_SECRET;

  if (!segredo) throw new Error("WP_JWT_SECRET não está definido");

  return new TextEncoder().encode(segredo);
});

/** Formato do payload emitido pelo plugin. */
type JwtPayloadWp = {
  data?: { user?: { id?: string | number } };
  exp?: number;
};

export type Session = {
  userId: number;
  expiresAt: number | null;
};

export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<JwtPayloadWp>(token, await getKey(), {
      algorithms: ["HS256"],
    });

    const id = Number(payload.data?.user?.id);

    // Token válido mas sem id utilizável não é sessão: melhor tratar como
    // anônimo do que devolver um `userId` NaN adiante.
    if (!Number.isInteger(id) || id <= 0) return null;

    return { userId: id, expiresAt: payload.exp ?? null };
  } catch {
    return null;
  }
});

/**
 * Exige sessão: usado atrás do boundary de Suspense do grupo autenticado.
 *
 * O `use cache: private` é o que permite ler `cookies()` aqui — as diretivas
 * de cache comuns não podem, e o resultado deste escopo fica só no navegador,
 * nunca no servidor. Sem ele, cachear qualquer coisa derivada da sessão
 * serviria a sessão de um usuário para outro.
 *
 * O `redirect()` interrompe a renderização lançando, então ele não é cacheado:
 * só uma sessão resolvida entra no cache.
 */
export async function requireSession(): Promise<Session> {
  "use cache: private";

  const session = await getSession();
  if (!session) redirect("/login");

  return session;
}
