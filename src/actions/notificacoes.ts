"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { marcarComoLida, marcarTodasComoLidas } from "@/services/notificacoes";

/**
 * Server Actions são endpoints públicos: o guard do layout não protege estas
 * chamadas, então cada uma confere a sessão por conta própria.
 */
async function exigirSessao() {
  const sessao = await getSession();
  if (!sessao) redirect("/login");
}

/** Alterna o estado de leitura de uma notificação. */
export async function alternarLeitura(id: string, lida: boolean) {
  await exigirSessao();

  await marcarComoLida(id, lida);

  // Sem o `refresh`, o selo do sino e a lista continuariam mostrando o estado
  // anterior até a próxima navegação.
  refresh();
}

export async function lerTodas() {
  await exigirSessao();

  await marcarTodasComoLidas();

  refresh();
}
