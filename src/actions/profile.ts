"use server";

import { ClientError } from "graphql-request";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { cleanWpMessage } from "@/lib/wp-errors";
import {
  changePassword,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from "@/services/profile";

/**
 * Edição do perfil pelo próprio jogador.
 *
 * Todas as actions seguem a forma do `useActionState`: recebem o estado
 * anterior e o `FormData`, e devolvem `{ error }` ou `{ success }` em vez de
 * lançar. O erro aqui é quase sempre endereçado a quem preencheu o formulário
 * ("este e-mail já está em uso"), e a tela precisa mostrá-lo sem trocar de
 * página.
 *
 * Server Actions são endpoints públicos: o guard do layout não protege estas
 * chamadas, então cada uma confere a sessão por conta própria.
 */
async function ensureSession() {
  const session = await getSession();
  if (!session) redirect("/login");
}

export type ProfileState = {
  error?: string;
  /** Marca o envio bem-sucedido, para a tela dar o retorno e limpar campos. */
  success?: boolean;
};

/** Fallback quando nem o WordPress nem o plugin explicaram a falha. */
const GENERIC = "Não foi possível salvar. Tente novamente.";

/**
 * A mensagem que o jogador lê.
 *
 * Tudo o que o plugin recusa por regra de negócio (e-mail repetido, senha
 * atual errada, imagem grande demais) já vem escrito em português e pronto
 * para a tela — repassar é melhor que reescrever aqui e sair de sincronia com
 * o plugin. Só o que não tem mensagem própria cai no texto genérico.
 */
function toMessage(error: unknown): string {
  if (error instanceof ClientError) {
    const first = error.response.errors?.[0]?.message;

    return first ? cleanWpMessage(first) : GENERIC;
  }

  return error instanceof Error && error.message ? error.message : GENERIC;
}

/* -------------------------------------------------------------------------- */
/*                            Dados e contato                                 */
/* -------------------------------------------------------------------------- */

/**
 * O telefone é opcional aqui, ao contrário do formulário de inscrição: quem
 * já é jogador entrou por outro caminho e não pode ficar travado numa tela de
 * perfil por causa de um campo que ninguém pediu no cadastro.
 */
const profileSchema = z.object({
  name: z.string().trim().min(2, "Informe o seu nome."),
  email: z.email("Informe um e-mail válido."),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^(55\d{10,11}|(?!55)\d{8,15})$/.test(value),
      "Informe um número de WhatsApp válido, com DDD.",
    ),
  city: z.string().trim().max(80, "Use no máximo 80 caracteres."),
  bio: z.string().trim().max(600, "Use no máximo 600 caracteres."),
});

export async function saveProfile(
  _state: ProfileState,
  data: FormData,
): Promise<ProfileState> {
  await ensureSession();

  const parsed = profileSchema.safeParse({
    name: data.get("name") ?? "",
    email: data.get("email") ?? "",
    phone: data.get("phone") ?? "",
    city: data.get("city") ?? "",
    bio: data.get("bio") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC };
  }

  try {
    await updateProfile(parsed.data);
  } catch (error) {
    return { error: toMessage(error) };
  }

  // O nome e a foto aparecem no header e no painel: sem o `refresh`, o menu
  // continuaria com o nome antigo até a próxima navegação.
  refresh();

  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*                                   Senha                                    */
/* -------------------------------------------------------------------------- */

/**
 * Oito caracteres é o piso do plugin. A confirmação é conferida aqui e não lá
 * porque é erro de digitação na tela, não regra do WordPress.
 */
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a sua senha atual."),
    newPassword: z
      .string()
      .min(8, "A nova senha precisa ter ao menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "As senhas não conferem.",
  });

export async function savePassword(
  _state: ProfileState,
  data: FormData,
): Promise<ProfileState> {
  await ensureSession();

  const parsed = passwordSchema.safeParse({
    currentPassword: data.get("currentPassword") ?? "",
    newPassword: data.get("newPassword") ?? "",
    confirmPassword: data.get("confirmPassword") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC };
  }

  try {
    await changePassword(parsed.data.currentPassword, parsed.data.newPassword);
  } catch (error) {
    return { error: toMessage(error) };
  }

  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*                                    Foto                                    */
/* -------------------------------------------------------------------------- */

/**
 * Envia a nova foto de perfil.
 *
 * Recebe `FormData` porque é assim que o arquivo atravessa a fronteira do
 * cliente para o servidor sem virar base64 no caminho. Formato e tamanho quem
 * confere é o plugin, olhando o conteúdo do arquivo: validar só aqui seria
 * validar do lado que o atacante controla.
 */
export async function saveAvatar(
  _state: ProfileState,
  data: FormData,
): Promise<ProfileState> {
  await ensureSession();

  const file = data.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha uma imagem." };
  }

  try {
    await uploadAvatar(file);
  } catch (error) {
    return { error: toMessage(error) };
  }

  refresh();

  return { success: true };
}

/** Remove a foto e volta às iniciais do nome. */
export async function deleteAvatar(): Promise<ProfileState> {
  await ensureSession();

  try {
    await removeAvatar();
  } catch (error) {
    return { error: toMessage(error) };
  }

  refresh();

  return { success: true };
}
