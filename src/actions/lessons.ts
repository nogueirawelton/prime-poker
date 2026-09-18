"use server";

import { redirect } from "next/navigation";

import type { LessonsSearchParams } from "@/lib/lessons-params";
import { parseFilter } from "@/lib/lessons-params";
import { getSession } from "@/lib/session";
import { type LessonsResult, listLessons } from "@/services/lessons";

/**
 * Próximo lote da listagem, pedido pela rolagem infinita.
 *
 * A action recebe os parâmetros crus da URL e os revalida com o mesmo
 * `parseFilter` da página: nada que venha do cliente entra no serviço sem
 * passar por essa peneira.
 *
 * A sessão é exigida aqui também — Server Actions são endpoints públicos, e
 * o guard do layout não protege esta chamada. A checagem usa `getSession`, e
 * não `requireSession`: esta última cacheia o resultado no navegador, o que
 * não faz sentido para uma chamada pontual de action.
 */
export async function loadLessons(
  params: LessonsSearchParams,
  page: number,
): Promise<LessonsResult> {
  const session = await getSession();
  if (!session) redirect("/login");

  const nextPage = Math.max(1, Math.floor(Number(page) || 1));

  return listLessons(parseFilter(params), nextPage);
}
