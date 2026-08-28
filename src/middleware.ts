import { type NextRequest, NextResponse } from "next/server";

/**
 * Guard da área logada.
 *
 * O `matcher` cobre TUDO sob `/player` e não abre exceções — é por isso que
 * `/login` e `/cadastro` ficam fora desse prefixo, no grupo `(auth)`. Assim
 * nenhuma página pública precisa ser "liberada" aqui, que é onde bugs de
 * autenticação costumam entrar.
 */

/**
 * Enquanto não existe autenticação, o guard fica inerte para não trancar o
 * desenvolvimento fora de `/player`. Vire para `true` no mesmo commit em que
 * `getSession` passar a ler a sessão de verdade.
 */
const ENFORCE_AUTH = false;

const LOGIN_PATH = "/login";

// TODO: ler a sessão real (cookie assinado, JWT, NextAuth, WordPress...).
function getSession(_request: NextRequest): unknown | null {
  return null;
}

export function middleware(request: NextRequest) {
  if (!ENFORCE_AUTH) return NextResponse.next();

  if (getSession(request)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  // Preserva o destino para redirecionar de volta após o login.
  url.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/player", "/player/:path*"],
};
