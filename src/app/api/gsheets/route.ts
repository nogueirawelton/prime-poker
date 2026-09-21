import type { NextRequest } from "next/server";
import { applicationPayloadSchema } from "@/components/shared/application-form/schema";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/** Envios aceitos por IP dentro da janela. */
const LIMIT = 5;

const WINDOW_MS = 10 * 60 * 1000;

/** O Apps Script costuma responder rápido; acima disso o envio é abandonado. */
const TIMEOUT_MS = 10_000;

/**
 * A requisição saiu de uma página do próprio site?
 *
 * A comparação é contra o `Host` da própria requisição, não contra
 * `NEXT_PUBLIC_SITE_URL`: o domínio configurado é o de produção, e fixá-lo
 * recusaria o formulário em `localhost` e nos deploys de preview.
 *
 * Sem `Origin` o request não veio de um navegador — `fetch` sempre o envia em
 * POST, inclusive same-origin.
 */
function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) return false;

  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * Repasse do formulário de inscrição para a planilha do Google.
 *
 * A URL do Apps Script fica aqui, no servidor, e não no bundle: publicada, ela
 * aceitaria POST de qualquer um e a planilha viraria um formulário aberto. Esta
 * rota é o único caminho até ela, e por isso concentra as três barreiras:
 *
 * 1. `Origin` — só aceita o que sai do próprio site;
 * 2. taxa por IP — trava a repetição, mesmo vinda do navegador;
 * 3. schema — descarta payload malformado antes de gastar a chamada externa.
 *
 * Responde sempre JSON `{ message }`, no mesmo formato que o cliente já espera
 * dos demais envios.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return Response.json(
      { message: "Origem não autorizada." },
      { status: 403 },
    );
  }

  const { success, retryAfter } = rateLimit(`gsheets:${getClientIp(request)}`, {
    limit: LIMIT,
    windowMs: WINDOW_MS,
  });

  if (!success) {
    return Response.json(
      { message: "Muitos envios seguidos. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Corpo inválido." }, { status: 400 });
  }

  const parsed = applicationPayloadSchema.safeParse(body);

  if (!parsed.success) {
    // Mensagem genérica de propósito: o formulário já validou com este mesmo
    // schema, então chegar aqui inválido significa chamada fora do site. O
    // detalhe do campo vai para o log, não para a resposta.
    console.error(parsed.error.issues);
    return Response.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const scriptUrl = process.env.GOOGLE_SHEETS_SCRIPT_URL;

  if (!scriptUrl) {
    console.error("GOOGLE_SHEETS_SCRIPT_URL não configurada.");
    return Response.json(
      { message: "Integração indisponível no momento." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      // `text/plain` evita o preflight do Apps Script, que responde ao OPTIONS
      // sem os headers de CORS e derrubaria a chamada antes do POST.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Google Sheets respondeu ${response.status}: ${await response.text()}`,
      );
      return Response.json(
        { message: "Não foi possível registrar o envio." },
        { status: 502 },
      );
    }

    return Response.json({ message: "Envio registrado com sucesso!" });
  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Não foi possível registrar o envio." },
      { status: 502 },
    );
  }
}
