import type { PostDetail } from "@/services/blog";
import { initials } from "@/utils/initials";

/**
 * Quem escreveu o artigo, ao fim da leitura.
 *
 * Iniciais no lugar do avatar: a foto do autor no WordPress vem do Gravatar,
 * um host que não está liberado em `images.remotePatterns` — e liberar um
 * domínio de terceiros só por isso não se paga.
 */
export function AuthorCard({ post }: { post: PostDetail }) {
  return (
    <aside className="mt-12 flex max-w-3xl items-start gap-4 rounded-xl border border-white/10 bg-white/3 p-6">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-prime-red/15 font-bold text-prime-red">
        {initials(post.author)}
      </span>

      <div className="min-w-0">
        <strong className="block font-bold text-prime-light">
          {post.author}
        </strong>

        {post.authorBio ? (
          <p className="mt-1 text-prime-light/70 text-sm leading-relaxed">
            {post.authorBio}
          </p>
        ) : (
          <p className="mt-1 text-prime-light/50 text-sm">Time Prime Poker.</p>
        )}
      </div>
    </aside>
  );
}
