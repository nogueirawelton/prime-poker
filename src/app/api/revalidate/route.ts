import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { CACHE_TAGS, isCacheTag } from "@/lib/cache-tags";

/**
 * Expurgo de cache sob demanda — chamado pelo WordPress a cada publicação.
 *
 * Aceita várias tags na mesma chamada (`?tag=posts&tag=post:slug`): uma
 * publicação invalida a listagem e o próprio post de uma vez. Sem `tag`, limpa
 * o conjunto padrão de `CACHE_TAGS`.
 *
 * A rota é aberta de propósito (decisão do projeto): o pior que um terceiro
 * consegue é forçar o site a buscar o conteúdo de novo no WordPress.
 *
 * `{ expire: 0 }` em vez de `"max"`: a chamada vem de fora de uma Server
 * Action, então não há janela de stale-while-revalidate aceitável aqui. Com
 * `"max"` o Next continuaria servindo o conteúdo antigo por até um ano
 * enquanto revalida no fundo — quem acabou de publicar recarregaria a home e
 * veria a versão velha, como se o cache não tivesse sido limpo.
 */
export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.getAll("tag");
  const unknownTags = requested.filter((tag) => !isCacheTag(tag));

  if (unknownTags.length > 0) {
    return Response.json(
      {
        message: `Tag desconhecida: ${unknownTags.map((tag) => `"${tag}"`).join(", ")}`,
        tags: CACHE_TAGS,
      },
      { status: 400 },
    );
  }

  const tags = requested.length > 0 ? requested : CACHE_TAGS;

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
