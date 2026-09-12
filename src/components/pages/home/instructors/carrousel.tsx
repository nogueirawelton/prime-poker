"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import type { Instructors } from "@/@types/pages/Home";
import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
} from "@/components/ui/carousel";

type CarrouselProps = {
  content: Instructors["instructors"];
};

export function Carrousel({ content }: CarrouselProps) {
  return (
    <Carousel
      data-el="swiper"
      className="mx-auto mt-12 grid max-w-screen-xl grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-4 lg:gap-12"
    >
      <CarouselPrevious className="-translate-y-[26px] cursor-pointer">
        <CaretLeftIcon className="size-12 text-prime-light" />
      </CarouselPrevious>

      <CarouselViewport>
        <CarouselTrack className="-ml-3 md:-ml-6 lg:-ml-12">
          {content?.nodes.map((instructor, key) => (
            <CarouselSlide
              key={key}
              className="pl-3 sm:basis-1/2 md:basis-1/3 md:pl-6 lg:basis-1/5 lg:pl-12"
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
                <h3 className="font-bold text-lg text-prime-light">
                  {instructor.title}
                </h3>
                <strong className="font-medium text-prime-red/80">
                  {instructor.tags?.nodes[0]?.name}
                </strong>
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>

      <CarouselNext className="-translate-y-[26px] cursor-pointer">
        <CaretRightIcon className="size-12 text-prime-light" />
      </CarouselNext>
    </Carousel>
  );
}
