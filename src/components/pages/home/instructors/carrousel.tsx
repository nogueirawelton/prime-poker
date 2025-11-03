"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import "swiper/css";
import { Autoplay, Navigation } from "swiper/modules";

export function Carrousel() {
  return (
    <div className="mx-auto mt-12 grid max-w-screen-xl grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-4 lg:gap-12">
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
          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-1.jpg"
                width={200}
                height={200}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Lucas "Aces"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                MTT Coach
              </strong>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-2.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Ana "Queen"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                Cash Game Coach
              </strong>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-3.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Pedro "Bluff"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                Spin & Go Coach
              </strong>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-2.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Juliana "Tilt"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                Mental Game Coach
              </strong>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-1.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Carlos "GTO"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                GTO Specialist
              </strong>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-1.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Lucas "Aces"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                MTT Coach
              </strong>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-2.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Ana "Queen"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                Cash Game Coach
              </strong>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-3.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Pedro "Bluff"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                Spin & Go Coach
              </strong>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-2.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Juliana "Tilt"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                Mental Game Coach
              </strong>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative flex aspect-square w-full flex-col items-center gap-4 overflow-hidden rounded-md">
              <Image
                src="/img/person-example-1.jpg"
                width={375}
                height={480}
                alt=""
                className="absolute top-0 left-0 h-full w-full object-cover object-top"
              />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-prime-light text-lg font-bold">
                Carlos "GTO"
              </h3>
              <strong className="text-prime-red/80 font-medium">
                GTO Specialist
              </strong>
            </div>
          </SwiperSlide>
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
