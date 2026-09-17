import { ChatCircleIcon } from "@phosphor-icons/react/dist/ssr";
import type { Comment } from "@/services/blog";
import { iniciais } from "@/utils/iniciais";
import { CommentForm } from "./comment-form";
import { CommentReply } from "./comment-reply";

const formatador = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/** Quantos comentários existem, contando as respostas. */
function contar(comentarios: Array<Comment>): number {
  return comentarios.reduce(
    (total, comentario) => total + 1 + contar(comentario.replies),
    0,
  );
}

/**
 * Comentários do artigo.
 *
 * A conversa é a nativa do WordPress: mesma moderação, mesmo antispam e mesmo
 * painel que o time já usa — sem armazenamento paralelo no front.
 */
export function PostComments({
  postId,
  comentarios,
}: {
  postId: number;
  comentarios: Array<Comment>;
}) {
  const total = contar(comentarios);

  return (
    <section id="comentarios" className="mt-16 max-w-3xl scroll-mt-32">
      <h2 className="flex items-center gap-2 font-bold text-2xl text-prime-light lg:text-3xl">
        <ChatCircleIcon className="size-6 text-prime-red" aria-hidden="true" />
        Comentários
        {total > 0 && (
          <span className="font-normal text-lg text-prime-light/40">
            ({total})
          </span>
        )}
      </h2>

      {comentarios.length > 0 && (
        <ol className="mt-8 flex flex-col gap-8">
          {comentarios.map((comentario) => (
            <li key={comentario.id}>
              <Comentario comentario={comentario} postId={postId} />

              {comentario.replies.length > 0 && (
                <ol className="mt-6 flex flex-col gap-6 border-white/10 border-l pl-6">
                  {comentario.replies.map((resposta) => (
                    <li key={resposta.id}>
                      {/* Um nível só de recuo: a partir daqui as respostas
                          entram lado a lado, senão a conversa vira escada. */}
                      <Comentario comentario={resposta} postId={postId} />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10">
        {comentarios.length === 0 && (
          <p className="mb-4 text-prime-light/60 text-sm">
            Nenhum comentário ainda. Comece a conversa.
          </p>
        )}

        <CommentForm postId={postId} />
      </div>
    </section>
  );
}

function Comentario({
  comentario,
  postId,
}: {
  comentario: Comment;
  postId: number;
}) {
  return (
    <article className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-prime-light text-xs">
        {iniciais(comentario.author)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3">
          <strong className="font-bold text-prime-light text-sm">
            {comentario.author}
          </strong>
          <time
            dateTime={comentario.date}
            className="text-prime-light/40 text-xs"
          >
            {formatador.format(new Date(comentario.date))}
          </time>
        </div>

        {/* O HTML já vem sanitizado do WordPress, que aplica `kses` na
            publicação; `rich-text` só cuida da tipografia. */}
        <div
          className="rich-text mt-1 text-sm"
          dangerouslySetInnerHTML={{ __html: comentario.content }}
        />

        <CommentReply postId={postId} parentId={comentario.id} />
      </div>
    </article>
  );
}
