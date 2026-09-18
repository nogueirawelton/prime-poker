import { ChatCircleIcon } from "@phosphor-icons/react/dist/ssr";
import type { Comment } from "@/services/blog";
import { initials } from "@/utils/initials";
import { CommentForm } from "./comment-form";
import { CommentReply } from "./comment-reply";

const formatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/** Quantos comentários existem, contando as respostas. */
function countComments(comments: Array<Comment>): number {
  return comments.reduce(
    (total, comment) => total + 1 + countComments(comment.replies),
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
  comments,
}: {
  postId: number;
  comments: Array<Comment>;
}) {
  const total = countComments(comments);

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

      {comments.length > 0 && (
        <ol className="mt-8 flex flex-col gap-8">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem comment={comment} postId={postId} />

              {comment.replies.length > 0 && (
                <ol className="mt-6 flex flex-col gap-6 border-white/10 border-l pl-6">
                  {comment.replies.map((response) => (
                    <li key={response.id}>
                      {/* Um nível só de recuo: a partir daqui as respostas
                          entram lado a lado, senão a conversa vira escada. */}
                      <CommentItem comment={response} postId={postId} />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10">
        {comments.length === 0 && (
          <p className="mb-4 text-prime-light/60 text-sm">
            Nenhum comentário ainda. Comece a conversa.
          </p>
        )}

        <CommentForm postId={postId} />
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  postId,
}: {
  comment: Comment;
  postId: number;
}) {
  return (
    <article className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-prime-light text-xs">
        {initials(comment.author)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3">
          <strong className="font-bold text-prime-light text-sm">
            {comment.author}
          </strong>
          <time dateTime={comment.date} className="text-prime-light/40 text-xs">
            {formatter.format(new Date(comment.date))}
          </time>
        </div>

        {/* O HTML já vem sanitizado do WordPress, que aplica `kses` na
            publicação; `rich-text` só cuida da tipografia. */}
        <div
          className="rich-text mt-1 text-sm"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />

        <CommentReply postId={postId} parentId={comment.id} />
      </div>
    </article>
  );
}
