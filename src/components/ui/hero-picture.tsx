/**
 * Imagem de destaque com art direction (mobile ≠ desktop).
 *
 * Por que não `next/image`: ele não tem art direction. O banner renderizava
 * as duas imagens e escondia uma com `lg:hidden` — mas `display: none` não
 * impede o download, e as duas ainda vinham marcadas como `priority`. O
 * celular baixava o hero de desktop inteiro sem nunca mostrá-lo.
 *
 * Com `<picture>` + `media` quem escolhe é o navegador, antes de baixar
 * qualquer byte. As URLs continuam passando pelo otimizador do Next, então
 * AVIF/WebP e o cache continuam valendo.
 */

/** Precisa acompanhar `deviceSizes` no next.config.ts. */
const MOBILE_WIDTHS = [640, 768, 1080];
const DESKTOP_WIDTHS = [1280, 1920];

/** Precisa acompanhar `qualities` no next.config.ts. */
const QUALITY = 75;

/** Mesmo ponto de corte do `lg:` do Tailwind. */
export const DESKTOP_MEDIA = "(min-width: 1024px)";

/**
 * A barra final não é cosmética: o projeto roda com `trailingSlash: true`, e
 * sem ela o otimizador responde 308 para a versão com barra — um redirect
 * extra bem no caminho da imagem de LCP.
 */
function optimized(src: string, width: number) {
  return `/_next/image/?url=${encodeURIComponent(src)}&w=${width}&q=${QUALITY}`;
}

function srcSet(src: string, widths: Array<number>) {
  return widths.map((width) => `${optimized(src, width)} ${width}w`).join(", ");
}

export const heroSources = (mobileSrc: string, desktopSrc: string) => ({
  mobile: {
    src: optimized(mobileSrc, MOBILE_WIDTHS.at(-1) as number),
    srcSet: srcSet(mobileSrc, MOBILE_WIDTHS),
  },
  desktop: {
    srcSet: srcSet(desktopSrc, DESKTOP_WIDTHS),
  },
});

type HeroPictureProps = {
  mobileSrc: string;
  desktopSrc: string;
  alt: string;
  /** Só o primeiro slide: carrega cedo e com prioridade alta. */
  priority?: boolean;
  className?: string;
};

export function HeroPicture({
  mobileSrc,
  desktopSrc,
  alt,
  priority = false,
  className = "",
}: HeroPictureProps) {
  const sources = heroSources(mobileSrc, desktopSrc);

  return (
    <picture>
      <source
        media={DESKTOP_MEDIA}
        srcSet={sources.desktop.srcSet}
        sizes="100vw"
      />
      <img
        src={sources.mobile.src}
        srcSet={sources.mobile.srcSet}
        sizes="100vw"
        alt={alt}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={`absolute inset-0 size-full object-cover ${className}`}
      />
    </picture>
  );
}

/**
 * Preload do hero do primeiro slide.
 *
 * O `<link>` é içado para o <head> pelo React 19. O `media` em cada um
 * garante que o celular só pré-carregue a versão mobile — é o equivalente ao
 * que o `priority` do `next/image` faria, mas respeitando a art direction.
 */
export function HeroPreload({
  mobileSrc,
  desktopSrc,
}: {
  mobileSrc: string;
  desktopSrc: string;
}) {
  const sources = heroSources(mobileSrc, desktopSrc);

  return (
    <>
      <link
        rel="preload"
        as="image"
        media={`not all and ${DESKTOP_MEDIA}`}
        imageSrcSet={sources.mobile.srcSet}
        imageSizes="100vw"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        media={DESKTOP_MEDIA}
        imageSrcSet={sources.desktop.srcSet}
        imageSizes="100vw"
        fetchPriority="high"
      />
    </>
  );
}
