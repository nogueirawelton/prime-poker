import { twMerge } from "tailwind-merge";
import { Chip } from "@/icons/chip";
import type { Post } from "./mock";

type Variant = "card" | "hero";

/**
 * Capa provisória: gradiente determinístico a partir do id + marca d'água da
 * ficha. Evita depender de imagens remotas enquanto o conteúdo é mockado —
 * quando o CMS entrar, isto vira um `next/image`.
 */
export function PostCover({
  post,
  variant = "card",
  className = "",
}: {
  post: Post;
  variant?: Variant;
  className?: string;
}) {
  const hero = variant === "hero";

  // No hero o véu é opaco embaixo e o texto fica à esquerda: o ângulo é fixado
  // perto de 225° para o vermelho nascer no topo-direito, onde ele aparece.
  // Nos cards, gira livre para variar a grade.
  const angle = hero
    ? 200 + ((Number(post.id) * 17) % 50)
    : (Number(post.id) * 47) % 360;

  return (
    <div
      // twMerge: sem ele um `absolute` vindo de fora perde para o `relative`
      // daqui (conflito de position), e a capa colapsa para altura 0.
      className={twMerge(
        "relative overflow-hidden bg-prime-darkgray",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(${angle}deg, rgba(255,24,32,${
          hero ? 0.7 : 0.35
        }) 0%, rgba(34,30,30,0.92) ${hero ? 60 : 55}%, rgba(0,0,0,1) 100%)`,
      }}
    >
      {hero ? (
        // No hero o texto ocupa a esquerda: a ficha fica à direita, onde sobra
        // espaço e o véu inferior não a apaga.
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
