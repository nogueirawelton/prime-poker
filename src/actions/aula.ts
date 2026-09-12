"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  adicionarDuvida,
  alternarConcluida,
  alternarSalva,
} from "@/services/aula-detalhe";

/**
 * Server Actions são endpoints públicos: o guard do layout não protege estas
 * chamadas, então cada uma confere a sessão por conta própria.
 */
async function exigirSessao() {
  const sessao = await getSession();
  if (!sessao) redirect("/login");
}

export async function salvarAula(slug: string) {
  await exigirSessao();

  await alternarSalva(slug);

  // Sem o `refresh`, o botão continuaria mostrando o estado anterior até a
  // próxima navegação.
  refresh();
}

export async function concluirAula(slug: string) {
  await exigirSessao();

  await alternarConcluida(slug);

  refresh();
}

export type DuvidaState = { error?: string };

/** Envia a dúvida do jogador ao instrutor da aula. */
export async function enviarDuvida(
  slug: string,
  _estado: DuvidaState,
  formData: FormData,
): Promise<DuvidaState> {
  await exigirSessao();

  const texto = String(formData.get("texto") ?? "").trim();

  // Validação mínima e no servidor: o cliente só desabilita o botão, e isso
  // é conveniência, não garantia.
  if (!texto) return { error: "Escreva sua dúvida antes de enviar." };
  if (texto.length > 2000) {
    return { error: "Dúvida muito longa: use no máximo 2000 caracteres." };
  }

  await adicionarDuvida(slug, texto);

  refresh();

  return {};
}
