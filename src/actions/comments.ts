"use server";

import { ClientError } from "graphql-request";
import { updateTag } from "next/cache";
import { z } from "zod";
import { mutate } from "@/graphql/client";
import { CREATE_COMMENT } from "@/graphql/mutations/blog/CREATE_COMMENT";
import { translateWpError } from "@/lib/wp-errors";
import { commentsTag } from "@/services/blog";

/** Mensagem genérica: o texto cru do WordPress não ajuda quem comenta. */
const GENERIC_ERROR = "Não foi possível enviar seu comentário. Tente de novo.";

/**
 * Os padrões cobrem português E inglês: o núcleo do WordPress responde no
 * idioma do site, os plugins GraphQL não são traduzidos.
 */
const COMMENT_ERRORS: Array<[RegExp, string]> = [
  [
    /duplicate comment|comentário duplicado|already said that/i,
    "Você já enviou esse comentário.",
  ],
  [
    /comments are closed|comentários.*(fechad|encerrad)/i,
    "Os comentários deste artigo estão encerrados.",
  ],
  [
    /too quickly|slow down|muito rápido/i,
    "Aguarde um instante antes de comentar de novo.",
  ],
  [
    /must be logged in|não está autorizad|not allowed/i,
    "Este blog exige login para comentar.",
  ],
];

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
  email: z.email("Informe um e-mail válido."),
  text: z
    .string()
    .trim()
    .min(3, "Escreva seu comentário.")
    .max(2000, "Comentário muito longo: use no máximo 2000 caracteres."),
});

export type CommentState = {
  error?: string;
  fieldErrors?: {
    name?: Array<string>;
    email?: Array<string>;
    text?: Array<string>;
  };
  /** Publicado na hora. */
  ok?: boolean;
  /** Aceito, mas retido pela moderação do WordPress. */
  moderation?: boolean;
};

type CreateCommentResponse = {
  createComment?: {
    success?: boolean | null;
    comment?: { id: string } | null;
  } | null;
};

/**
 * Publica um comentário no post.
 *
 * O comentário vai para o WordPress pela mutation nativa, então ele passa
 * pelas mesmas regras de moderação e antispam já configuradas lá — nada de
 * armazenamento paralelo no front.
 */
export async function postComment(
  postId: number,
  parentId: string | null,
  _state: CommentState,
  formData: FormData,
): Promise<CommentState> {
  // Campo isca: humano não preenche o que não vê. Responder "ok" sem gravar
  // evita que o bot fique tentando de novo.
  if (formData.get("website")) return { ok: true };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    const data = await mutate<CreateCommentResponse>(CREATE_COMMENT, {
      commentOn: postId,
      content: parsed.data.text,
      author: parsed.data.name,
      authorEmail: parsed.data.email,
      parent: parentId,
    });

    if (!data?.createComment?.success) return { error: GENERIC_ERROR };

    // `comment` nulo com `success` verdadeiro é comentário retido para
    // aprovação: ele existe, mas ainda não aparece na listagem.
    if (!data.createComment.comment) return { moderation: true };

    // `updateTag`, e não `revalidateTag`: quem acabou de comentar precisa ver
    // o próprio comentário na volta, não a lista em cache de antes.
    updateTag(commentsTag(postId));

    return { ok: true };
  } catch (error) {
    const rawMessage =
      error instanceof ClientError
        ? (error.response.errors?.[0]?.message ?? "")
        : "";

    console.error("postComment:", rawMessage || error);

    return {
      error: translateWpError(rawMessage, COMMENT_ERRORS, GENERIC_ERROR),
    };
  }
}
