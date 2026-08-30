import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { Chip } from "@/icons/chip";
import type { Post } from "@/services/blog";

type Variant = "card" | "hero";

/**
 * Capa do post: imagem destacada do WordPress quando existe, senão um
 * gradiente determinístico com a marca d'água da ficha — assim um post sem
 * imagem não abre um buraco no layout.
 */
export function PostCover({
  post,
  variant = "card",
  className = "",
  priority = false,
}: {
  post: Post;
  variant?: Variant;
  className?: string;
  priority?: boolean;
}) {
  const hero = variant === "hero";

  // twMerge: sem ele um `absolute` vindo de fora perde para o `relative`
  // daqui (conflito de position), e a capa colapsa para altura 0.
  const base = twMerge("relative overflow-hidden bg-zinc-800", className);

  if (post.image) {
    return (
      <div className={base}>
        <Image
          src={post.image.url}
          alt={post.image.alt}
          fill
          priority={priority}
          sizes={hero ? "100vw" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover"
        />
      </div>
    );
  }

  // O id do WordPress é opaco: o código do slug dá um ângulo estável.
  const seed = [...post.slug].reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  const angle = hero ? 200 + ((seed * 17) % 50) : (seed * 47) % 360;

  return (
    <div
      className={base}
      style={{
        backgroundImage: `linear-gradient(${angle}deg, rgba(255,24,32,${
          hero ? 0.7 : 0.35
        }) 0%, rgba(34,30,30,0.92) ${hero ? 60 : 55}%, rgba(0,0,0,1) 100%)`,
      }}
    >
      {hero ? (
        <Chip className="absolute top-1/2 right-4 size-64 -translate-y-1/2 text-prime-light/8 lg:right-24 lg:size-96" />
      ) : (
        <>
          <Chip className="absolute -right-6 -bottom-8 size-40 text-prime-light/5" />
          <Chip className="absolute top-4 left-4 size-8 text-prime-light/20" />
        </>
      )}
    </div>
  );
}
