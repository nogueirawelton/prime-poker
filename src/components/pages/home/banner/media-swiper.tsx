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

/** Uma mídia de vídeo, escolhida por breakpoint via CSS. */
function VideoSlide({ media, className }: { media: Media; className: string }) {
  const src = videoSrc(media);

  if (media.video.origin === "local") {
    return <NativeVideo src={src} className={className} />;
  }

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
 * Quando mobile e desktop são imagens — o caso normal — vira um único
 * `<picture>` e o navegador baixa só a versão que vai mostrar. Se os tipos
 * divergirem (imagem num breakpoint, vídeo no outro) caímos no esquema antigo
 * de renderizar os dois e esconder um com CSS; aí não há como evitar.
 */
function Slide({
  media,
  priority,
}: {
  media: Banner["medias"][number]["media"];
  priority: boolean;
}) {
  const bothImages =
    media.mobile.type === "image" && media.desktop.type === "image";

  if (bothImages) {
    return (
      <HeroPicture
        mobileSrc={media.mobile.image?.node?.mediaItemUrl}
        desktopSrc={media.desktop.image?.node?.mediaItemUrl}
        alt=""
        priority={priority}
      />
    );
  }

  return (
    <>
      {media.mobile.type === "image" ? (
        <HeroPicture
          mobileSrc={media.mobile.image?.node?.mediaItemUrl}
          desktopSrc={media.mobile.image?.node?.mediaItemUrl}
          alt=""
          priority={priority}
          className="lg:hidden"
        />
      ) : (
        <VideoSlide media={media.mobile} className="lg:hidden" />
      )}

      {media.desktop.type === "image" ? (
        <HeroPicture
          mobileSrc={media.desktop.image?.node?.mediaItemUrl}
          desktopSrc={media.desktop.image?.node?.mediaItemUrl}
          alt=""
          priority={priority}
          className="hidden lg:block"
        />
      ) : (
        <VideoSlide media={media.desktop} className="hidden lg:block" />
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
