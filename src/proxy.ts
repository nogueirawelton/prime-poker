import { decodeJwt, jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_OPTS, REMEMBER_COOKIE, refreshOptsFor } from "@/lib/cookies";

/**
 * A mutation vive inline aqui, e não em `graphql/mutations`, de propósito:
 * aquele módulo importa `gql` do cliente do projeto, que por sua vez importa
 * `next/cache`. Arrastar isso para dentro do proxy o impede de ser registrado
 * — o build ainda imprime "ƒ Proxy", mas o middleware-manifest sai vazio e ele
 * simplesmente nunca roda.
 */
const REFRESH_TOKEN = `
  mutation RefreshToken($token: String!) {
    refreshJwtAuthToken(input: { jwtRefreshToken: $token }) {
      authToken
    }
  }
`;

/**
 * Renovação silenciosa do access token.
 *
 * Roda antes da página para que a requisição atual já enxergue o token novo —
 * sem isso o primeiro acesso depois da expiração cairia no login.
 *
 * O `decodeJwt` NÃO verifica assinatura, e aqui isso é proposital: o proxy só
 * precisa saber se o token venceu. Quem valida de fato é o `getSession()`, com
 * o segredo, antes de qualquer decisão de acesso.
 */
function isExpired(token: string) {
  try {
    const { exp } = decodeJwt(token);
    // Margem de 5s para o token não vencer no meio do render.
    return !exp || exp * 1000 < Date.now() + 5000;
  } catch {
    return true;
  }
}

/** Manda para o login guardando o destino, para voltar depois de autenticar. */
function paraLogin(req: NextRequest) {
  const url = new URL("/login", req.url);
  url.searchParams.set("redirect", req.nextUrl.pathname);

  return NextResponse.redirect(url);
}

function cookieHeaderWith(req: NextRequest, accessToken: string) {
  const jar = new Map(req.cookies.getAll().map((c) => [c.name, c.value]));
  jar.set("access_token", accessToken);

  return Array.from(jar, ([name, value]) => `${name}=${value}`).join("; ");
}

/**
 * Pede um authToken novo ao WordPress.
 *
 * Usa `fetch` direto em vez do cliente GraphQL do projeto: aquele envolve as
 * chamadas em `"use cache"`, e uma renovação de token jamais pode ser servida
 * de cache — nem para o próprio usuário, nem, muito pior, para outro.
 */
async function refreshAuthToken(refreshToken: string) {
  const url = `${process.env.NEXT_PUBLIC_ADMIN_URL}/graphql`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: REFRESH_TOKEN,
        variables: { token: refreshToken },
      }),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();

    return (json?.data?.refreshJwtAuthToken?.authToken as string) ?? null;
  } catch (error) {
    console.error("proxy: falha ao renovar o token", error);
    return null;
  }
}

/** Rotas que exigem sessão. */
const PROTEGIDAS = ["/player"];

function ehProtegida(pathname: string) {
  return PROTEGIDAS.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`),
  );
}

/**
 * Validação completa do token, com assinatura.
 *
 * Aqui não basta olhar o `exp`: um cookie forjado passaria. O proxy é o único
 * ponto que consegue barrar ANTES de qualquer renderização — depois que o
 * shell é transmitido não há mais como responder 3xx, e o `redirect()` do
 * layout vira uma instrução no corpo, com o HTML da página já entregue junto.
 */
async function tokenValido(token: string | undefined) {
  if (!token) return false;

  const segredo = process.env.WP_JWT_SECRET;
  if (!segredo) {
    console.error("proxy: WP_JWT_SECRET não definido — acesso negado");
    return false;
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(segredo), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const protegida = ehProtegida(req.nextUrl.pathname);

  const access = req.cookies.get("access_token")?.value;

  if (access && !isExpired(access)) {
    if (protegida && !(await tokenValido(access))) return paraLogin(req);

    return NextResponse.next();
  }

  const refresh = req.cookies.get("refresh_token")?.value;
  if (!refresh) return protegida ? paraLogin(req) : NextResponse.next();

  const authToken = await refreshAuthToken(refresh);

  if (!authToken) return protegida ? paraLogin(req) : NextResponse.next();

  if (protegida && !(await tokenValido(authToken))) return paraLogin(req);

  const headers = new Headers(req.headers);
  headers.set("cookie", cookieHeaderWith(req, authToken));

  const response = NextResponse.next({ request: { headers } });

  response.cookies.set("access_token", authToken, ACCESS_OPTS);

  // O refreshToken do WPGraphQL JWT não é de uso único, então o valor não muda
  // — reescrevemos só para deslizar a janela de 30 dias do cookie.
  response.cookies.set(
    "refresh_token",
    refresh,
    refreshOptsFor(req.cookies.has(REMEMBER_COOKIE)),
  );

  return response;
}

/**
 * Só as rotas protegidas.
 *
 * A forma de OBJETO do matcher (`{ source, missing }`) desativa o proxy por
 * inteiro neste projeto: o build continua imprimindo "ƒ Proxy", o
 * middleware-manifest sai vazio e nada roda — sem erro nenhum. A forma de
 * string funciona, e restringir o alcance também evita o custo do proxy nas
 * páginas públicas.
 */
export const config = {
  matcher: ["/player", "/player/:path*"],
};
