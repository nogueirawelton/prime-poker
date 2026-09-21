"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Banner } from "@/@types/pages/Home";
import {
  Carousel,
  CarouselDots,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
} from "@/components/ui/carousel";
import { HeroPicture } from "@/components/ui/hero-picture";
import { NativeVideo } from "@/components/ui/native-video";
import { ScaledVideo } from "@/components/ui/scaled-video";

type MediaSwiperProps = {
  content: Banner["medias"];
};

type Media = Banner["medias"][number]["media"]["mobile"];

const videoSrc = (media: Media) =>
  media.video.origin === "local"
    ? media.video.file?.node?.mediaItemUrl
    : media.video.url;

/** Um vídeo, escolhido por breakpoint via CSS. */
function VideoSlide({
  media,
  hasPoster,
  className,
}: {
  media: Media;
  hasPoster: boolean;
  className: string;
}) {
  const src = videoSrc(media);
  if (!src) return null;

  if (media.video.origin === "local") {
    return <NativeVideo src={src} fadeIn={hasPoster} className={className} />;
  }

  // YouTube e afins: iframe com proporção fixa, precisa ser escalado.
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <ScaledVideo
        src={src}
        loop
        muted
        playing
        className="size-full! object-cover!"
      />
    </div>
  );
}

/**
 * Um slide do banner.
 *
 * A imagem e o vídeo não são alternativas: quando o slide é de vídeo e há uma
 * imagem cadastrada, ela vira o **poster**. O poster é servido como
 * `<picture>` otimizado e com art direction, pinta no primeiro frame e responde
 * pelo LCP; o vídeo entra por cima depois do `load`. Como a imagem cadastrada é
 * o primeiro frame do próprio vídeo, a troca não produz salto visual.
 *
 * Com `type: "image"` nos dois breakpoints o slide é só imagem, e nenhum vídeo
 * é baixado — é o que o campo do CMS significa.
 */
function Slide({
  media,
  priority,
}: {
  media: Banner["medias"][number]["media"];
  priority: boolean;
}) {
  const mobileImage = media.mobile.image?.node?.mediaItemUrl;
  const desktopImage = media.desktop.image?.node?.mediaItemUrl;

  // O `<picture>` exige os dois lados: é ele quem escolhe, antes de baixar,
  // qual versão o navegador pega.
  const poster = mobileImage && desktopImage;

  return (
    <>
      {poster && (
        <HeroPicture
          mobileSrc={mobileImage}
          desktopSrc={desktopImage}
          alt=""
          priority={priority}
        />
      )}

      {media.mobile.type === "video" && (
        <VideoSlide
          media={media.mobile}
          hasPoster={!!poster}
          className="lg:hidden"
        />
      )}

      {media.desktop.type === "video" && (
        <VideoSlide
          media={media.desktop}
          hasPoster={!!poster}
          className="hidden lg:block"
        />
      )}
    </>
  );
}

/** A paginação vive num slot do banner, fora da árvore do carrossel. */
function Pagination() {
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    setTarget(document.querySelector("[data-pagination='banner']"));
  }, []);

  if (!target) return null;

  return createPortal(
    <CarouselDots className="flex items-center justify-center gap-3" />,
    target,
  );
}

export function MediaSwiper({ content }: MediaSwiperProps) {
  return (
    <Carousel autoplay={10000} className="absolute inset-0 z-10">
      <CarouselViewport className="h-full">
        <CarouselTrack className="h-full">
          {content.map(({ media }, key) => (
            <CarouselSlide key={key} className="relative min-w-full">
              <Slide media={media} priority={key === 0} />
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>

      <Pagination />
    </Carousel>
  );
}
