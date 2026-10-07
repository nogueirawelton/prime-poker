"use client";

import { CaretLeftIcon, CaretRightIcon, UserIcon } from "@phosphor-icons/react";
import type { Evolution } from "@/@types/pages/Home";
import {
  Carousel,
  CarouselDots,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
} from "@/components/ui/carousel";
import { formatUsd } from "@/utils/currency";

export type TestimonialsProps = {
  content: Evolution["successStories"];
};

export function Testimonials({ content }: TestimonialsProps) {
  return (
    // Depoimento é texto longo: o padrão de 5s trocava o slide antes de dar
    // tempo de terminar a leitura.
    <Carousel data-el="testimonials" autoplay={9000} className="mt-12">
      <h3 className="gap-2 text-center font-bold text-prime-light text-xl uppercase">
        Histórias de sucesso
      </h3>

      <CarouselViewport className="mt-8">
        <CarouselTrack className="-ml-8">
          {content.nodes.map((item, index) => (
            <CarouselSlide key={index} className="pl-8 md:basis-1/2">
              {/* `h-full`: o slide já é esticado pelo trilho flex, então o
                  cartão acompanha o depoimento mais alto do carrossel. */}
              <div className="h-full rounded-md border border-white/3 border-l-2 border-l-prime-red/75 bg-white/3 px-6 py-8">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 overflow-hidden rounded-full">
                    {/* O avatar real segue desabilitado, como no código original
                        (`false ?`): a foto do depoimento nem sempre existe. */}
                    <div className="grid size-full place-items-center rounded-full border border-white/5 bg-white/3 text-white">
                      <UserIcon className="size-6" />
                    </div>
                  </div>

                  <div className="text-prime-light">
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <strong className="font-medium text-prime-red text-sm">
                      {formatUsd(item.testimonialFields.earnings)}
                    </strong>
                  </div>
                </div>

                <p className="mt-4 text-prime-light text-sm italic lg:text-base">
                  "{item.testimonialFields.testimonial}"
                </p>
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>

      {/* No mobile as setas ladeiam os bullets: com um depoimento por vez, o
          arraste sozinho não deixa claro que há mais histórias. */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <CarouselPrevious className="cursor-pointer md:hidden">
          <CaretLeftIcon className="size-8 text-prime-light" />
        </CarouselPrevious>

        <CarouselDots className="flex items-center justify-center gap-3" />

        <CarouselNext className="cursor-pointer md:hidden">
          <CaretRightIcon className="size-8 text-prime-light" />
        </CarouselNext>
      </div>
    </Carousel>
  );
}
