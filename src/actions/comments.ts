"use server";

import { ClientError } from "graphql-request";
import { updateTag } from "next/cache";
import { z } from "zod";
import { mutate } from "@/graphql/client";
import { CREATE_COMMENT } from "@/graphql/mutations/blog/CREATE_COMMENT";
import { traduzirErroWp } from "@/lib/wp-errors";
import { commentsTag } from "@/services/blog";

/** Mensagem genérica: o texto cru do WordPress não ajuda quem comenta. */
const FALHA = "Não foi possível enviar seu comentário. Tente de novo.";

/**
 * Os padrões cobrem português E inglês: o núcleo do WordPress responde no
 * idioma do site, os plugins GraphQL não são traduzidos.
 */
const ERROS_COMENTARIO: Array<[RegExp, string]> = [
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
  nome: z.string().trim().min(2, "Informe seu nome.").max(80),
  email: z.email("Informe um e-mail válido."),
  texto: z
    .string()
    .trim()
    .min(3, "Escreva seu comentário.")
    .max(2000, "Comentário muito longo: use no máximo 2000 caracteres."),
});

export type ComentarioState = {
  error?: string;
  fieldErrors?: {
    nome?: Array<string>;
    email?: Array<string>;
    texto?: Array<string>;
  };
  /** Publicado na hora. */
  ok?: boolean;
  /** Aceito, mas retido pela moderação do WordPress. */
  moderacao?: boolean;
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
export async function comentar(
  postId: number,
  parentId: string | null,
  _estado: ComentarioState,
  formData: FormData,
): Promise<ComentarioState> {
  // Campo isca: humano não preenche o que não vê. Responder "ok" sem gravar
  // evita que o bot fique tentando de novo.
  if (formData.get("website")) return { ok: true };

  const parsed = schema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    texto: formData.get("texto"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    const data = await mutate<CreateCommentResponse>(CREATE_COMMENT, {
      commentOn: postId,
      content: parsed.data.texto,
      author: parsed.data.nome,
      authorEmail: parsed.data.email,
      parent: parentId,
    });

    if (!data?.createComment?.success) return { error: FALHA };

    // `comment` nulo com `success` verdadeiro é comentário retido para
    // aprovação: ele existe, mas ainda não aparece na listagem.
    if (!data.createComment.comment) return { moderacao: true };

    // `updateTag`, e não `revalidateTag`: quem acabou de comentar precisa ver
    // o próprio comentário na volta, não a lista em cache de antes.
    updateTag(commentsTag(postId));

    return { ok: true };
  } catch (erro) {
    const bruta =
      erro instanceof ClientError
        ? (erro.response.errors?.[0]?.message ?? "")
        : "";

    console.error("comentar:", bruta || erro);

    return { error: traduzirErroWp(bruta, ERROS_COMENTARIO, FALHA) };
  }
}
