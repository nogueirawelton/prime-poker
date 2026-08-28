"use client";

import Image from "next/image";
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
import { ScaledVideo } from "@/components/ui/scaled-video";

type MediaSwiperProps = {
  content: Banner["medias"];
};

type Media = Banner["medias"][number]["media"]["mobile"];

/** Renderiza imagem ou vídeo conforme o tipo vindo do CMS. */
function Slide({
  media,
  priority,
  className,
}: {
  media: Media;
  priority: boolean;
  className: string;
}) {
  if (media.type === "image") {
    return (
      <Image
        src={media.image?.node?.mediaItemUrl}
        alt=""
        fill
        sizes="100vw"
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <ScaledVideo
        origin={media.video.origin === "local" ? "local" : "external"}
        src={
          media.video.origin === "local"
            ? media.video.file?.node?.mediaItemUrl
            : media.video.url
        }
        loop
        muted
        playing
        className="size-full! [&_video]:size-full [&_video]:object-cover"
      />
    </div>
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
              <Slide
                media={media.mobile}
                priority={key === 0}
                className="lg:hidden"
              />
              <Slide
                media={media.desktop}
                priority={key === 0}
                className="hidden lg:block"
              />
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>

      <Pagination />
    </Carousel>
  );
}
