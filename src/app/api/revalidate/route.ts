import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { CACHE_TAGS, isCacheTag } from "@/lib/cache-tags";

/**
 * Expurgo de cache sob demanda — chamado pelo WordPress a cada publicação.
 *
 * `{ expire: 0 }` em vez de `"max"`: a chamada vem de fora de uma Server
 * Action, então não há janela de stale-while-revalidate aceitável aqui. Com
 * `"max"` o Next continuaria servindo o conteúdo antigo por até um ano
 * enquanto revalida no fundo — quem acabou de publicar recarregaria a home e
 * veria a versão velha, como se o cache não tivesse sido limpo.
 */
export async function GET(request: NextRequest) {
  const solicitada = request.nextUrl.searchParams.get("tag");

  if (solicitada && !isCacheTag(solicitada)) {
    return Response.json(
      {
        message: `Tag desconhecida: "${solicitada}"`,
        tags: CACHE_TAGS,
      },
      { status: 400 },
    );
  }

  const tags = solicitada ? [solicitada] : CACHE_TAGS;

  try {
    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }

    return Response.json({
      message: "Cache limpo com sucesso!",
      tags,
    });
  } catch (err) {
    return Response.json(err, {
      status: 500,
    });
  }
}
