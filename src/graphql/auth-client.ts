import "server-only";

import {
  ClientError,
  GraphQLClient,
  type RequestDocument,
} from "graphql-request";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/**
 * GraphQL em nome do jogador logado.
 *
 * Irmão do `query()`/`mutate()` de `client.tsx`, com duas diferenças que não
 * são opcionais:
 *
 * - **Sem `"use cache"`.** A resposta é de UM usuário; cacheada no servidor,
 *   seria servida a outro.
 * - **Envia o `Authorization`.** Sem ele o WordPress trata a requisição como
 *   anônima e campos como `viewer` e `playerTier` voltam nulos.
 *
 * O token vem do cookie, que o proxy já renovou antes da página rodar.
 */
const ENDPOINT = `${process.env.NEXT_PUBLIC_ADMIN_URL}/graphql`;

/**
 * Mensagens de sessão recusada pelo plugin JWT.
 *
 * Só aparecem com o debug do WPGraphQL ligado (`debugMessage`); com ele
 * desligado o erro vira um "Internal server error" genérico. Por isso isto é
 * só um atalho — a decisão final é a validação local em `isSessionFailure`.
 */
const TOKEN_ERROR =
  /expired token|signature verification|invalid.?(jwt|token)/i;

async function createAuthClient() {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) redirect("/login");

  return new GraphQLClient(ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

/**
 * A falha foi da sessão, e não da consulta?
 *
 * Se o WordPress acusou o token, sim. Senão, confere o token localmente: se
 * ele não vale mais, a causa é a sessão; se vale, o erro é da consulta e deve
 * subir como erro de verdade, em vez de mandar alguém logado para o login.
 */
async function isSessionFailure(error: unknown) {
  if (error instanceof ClientError) {
    const messages = (error.response.errors ?? []).map(
      (gqlError) =>
        `${gqlError.message} ${gqlError.extensions?.debugMessage ?? ""}`,
    );

    if (messages.some((message) => TOKEN_ERROR.test(message))) return true;
  }

  return !(await getSession());
}

/** Leitura autenticada, nunca cacheada. */
export async function authQuery<T>(
  document: RequestDocument,
  variables?: Record<string, unknown>,
): Promise<T> {
  const client = await createAuthClient();

  try {
    return await client.request<T>(document, variables);
  } catch (error) {
    if (await isSessionFailure(error)) redirect("/login");

    throw error;
  }
}

/**
 * Escrita autenticada. Mesma chamada do `authQuery` — o nome separado deixa
 * explícito no uso que aquilo muda estado no WordPress.
 */
export const authMutate = authQuery;
