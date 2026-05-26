"use client";

import { Instructors } from "@/@types/pages/Home";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

type CarrouselProps = {
  content: Instructors["instructors"];
};

export function Carrousel({ content }: CarrouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 42 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );

  return (
    <div
      data-el="swiper"
      className="mx-auto mt-12 grid max-w-screen-xl grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-4 lg:gap-12"
    >
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="-translate-y-[26px] cursor-pointer"
      >
        <CaretLeftIcon className="text-prime-light size-12" />
      </button>

      <div ref={emblaRef} className="overflow-hidden">
        <div className="-ml-3 flex md:-ml-6 lg:-ml-12">
          {content?.nodes.map((instructor, key) => (
            <div
              key={key}
              className="min-w-0 shrink-0 grow-0 basis-full pl-3 sm:basis-1/2 md:basis-1/3 md:pl-6 lg:basis-1/5 lg:pl-12"
            >
              <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
                <Image
                  src={instructor.featuredImage?.node?.mediaItemUrl}
                  width={200}
                  height={200}
                  alt=""
                  className="absolute top-0 left-0 h-full w-full object-cover object-top"
                />
              </div>

              <div className="mt-2 text-center">
                <h3 className="text-prime-light text-lg font-bold">
                  {instructor.title}
                </h3>
                <strong className="text-prime-red/80 font-medium">
                  {instructor.tags?.nodes[0].name}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => emblaApi?.scrollNext()}
        className="-translate-y-[26px] cursor-pointer"
      >
        <CaretRightIcon className="text-prime-light size-12" />
      </button>
    </div>
  );
}
