"use server";

import { redirect } from "next/navigation";

import type { AulasSearchParams } from "@/lib/aulas-params";
import { parseFiltro } from "@/lib/aulas-params";
import { getSession } from "@/lib/session";
import { listarAulas, type PaginaAulas } from "@/services/aulas";

/**
 * Próximo lote da listagem, pedido pela rolagem infinita.
 *
 * A action recebe os parâmetros crus da URL e os revalida com o mesmo
 * `parseFiltro` da página: nada que venha do cliente entra no serviço sem
 * passar por essa peneira.
 *
 * A sessão é exigida aqui também — Server Actions são endpoints públicos, e
 * o guard do layout não protege esta chamada. A checagem usa `getSession`, e
 * não `requireSession`: esta última cacheia o resultado no navegador, o que
 * não faz sentido para uma chamada pontual de action.
 */
export async function carregarAulas(
  params: AulasSearchParams,
  pagina: number,
): Promise<PaginaAulas> {
  const sessao = await getSession();
  if (!sessao) redirect("/login");

  const proxima = Math.max(1, Math.floor(Number(pagina) || 1));

  return listarAulas(parseFiltro(params), proxima);
}
