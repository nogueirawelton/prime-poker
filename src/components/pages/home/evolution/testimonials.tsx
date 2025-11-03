"use client";

import Image from "next/image";
import "swiper/css";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export function Testimonials() {
  return (
    <div data-el="testimonials" className="mt-12">
      <h3 className="text-prime-light gap-2 text-center text-xl font-bold uppercase">
        Histórias de sucesso
      </h3>

      <Swiper
        slidesPerView={1}
        spaceBetween={32}
        speed={700}
        modules={[Autoplay, Pagination]}
        pagination={{
          el: "[data-pagination='testimonials']",
          bulletClass:
            "size-3 block rounded-sm cursor-pointer bg-prime-light/40 transition-all duration-500",
          bulletActiveClass: "!bg-prime-light",
          clickable: true,
        }}
        autoplay={{
          delay: 5000,
        }}
        breakpoints={{
          768: {
            slidesPerView: 2,
          },
        }}
        className="mt-8"
      >
        <SwiperSlide>
          <div className="border-l-prime-red/75 rounded-md border border-l-2 border-white/3 bg-white/3 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="flex size-14 overflow-hidden rounded-full">
                <Image
                  src="/img/person-example-1.jpg"
                  width={75}
                  height={75}
                  alt=""
                  className="object-cover object-top"
                />
              </div>

              <div className="text-prime-light">
                <h4 className="text-lg font-bold">Marcelo "Allln"</h4>
                <strong className="text-prime-red/85 text-sm font-medium">
                  +$120,000 em ganhos
                </strong>
              </div>
            </div>

            <p className="text-prime-light mt-4 text-sm italic lg:text-base">
              "Entrei no Prime Poker Team como um jogador recreativo e em 7 ano
              já estava ompetindo em torneios internacionais. A estrutura de
              coaching e o suporte psicológico foram fundamentais para minha
              evolução."
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="border-l-prime-red/75 rounded-md border border-l-2 border-white/3 bg-white/3 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="flex size-14 overflow-hidden rounded-full">
                <Image
                  src="/img/person-example-2.jpg"
                  width={75}
                  height={75}
                  alt=""
                  className="object-cover object-top"
                />
              </div>

              <div className="text-prime-light">
                <h4 className="text-lg font-bold">Fernanda "BluffQueen""</h4>
                <strong className="text-prime-red/85 text-sm font-medium">
                  +$85,000 em ganhos
                </strong>
              </div>
            </div>

            <p className="text-prime-light mt-4 text-sm italic lg:text-base">
              "O Prime Poker Team transformou meu jogo completamente. Antes eu
              era uma jogadora tiltada e inconsistente. Hoje tenho disciplina,
              um bankroll saudável e resultados consistentes mês após mês."
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="border-l-prime-red/75 rounded-md border border-l-2 border-white/3 bg-white/3 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="flex size-14 overflow-hidden rounded-full">
                <Image
                  src="/img/person-example-3.jpg"
                  width={75}
                  height={75}
                  alt=""
                  className="object-cover object-top"
                />
              </div>

              <div className="text-prime-light">
                <h4 className="text-lg font-bold">Marcelo "Allln"</h4>
                <strong className="text-prime-red/85 text-sm font-medium">
                  +$120,000 em ganhos
                </strong>
              </div>
            </div>

            <p className="text-prime-light mt-4 text-sm italic lg:text-base">
              "Entrei no Prime Poker Team como um jogador recreativo e em 7 ano
              já estava ompetindo em torneios internacionais. A estrutura de
              coaching e o suporte psicológico foram fundamentais para minha
              evolução."
            </p>
          </div>
        </SwiperSlide>
      </Swiper>

      <div
        data-pagination="testimonials"
        className="mt-6 flex items-center justify-center gap-2"
      />
    </div>
  );
}
