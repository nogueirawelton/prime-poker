"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import { Instructors } from "@/@types/pages/Home";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import "swiper/css";
import { Autoplay, Navigation } from "swiper/modules";

type CarrouselProps = {
  content: Instructors["instructors"];
};

export function Carrousel({ content }: CarrouselProps) {
  return (
    <div
      data-el="swiper"
      className="mx-auto mt-12 grid max-w-screen-xl grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-4 lg:gap-12"
    >
      <button
        data-prev="instructors"
        className="-translate-y-[26px] cursor-pointer"
      >
        <CaretLeftIcon className="text-prime-light size-12" />
      </button>

      <div>
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            prevEl: "[data-prev='instructors']",
            nextEl: "[data-next='instructors']",
          }}
          autoplay={{
            delay: 5000,
          }}
          slidesPerView={1}
          spaceBetween={12}
          speed={700}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 48,
            },
          }}
          loop
        >
          {content?.nodes.map((instructor, key) => (
            <SwiperSlide key={key}>
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
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <button
        data-next="instructors"
        className="-translate-y-[26px] cursor-pointer"
      >
        <CaretRightIcon className="text-prime-light size-12" />
      </button>
    </div>
  );
}
