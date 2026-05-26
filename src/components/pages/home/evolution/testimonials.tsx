"use client";

import { Evolution } from "@/@types/pages/Home";
import { UserIcon } from "@phosphor-icons/react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type TestimonialsProps = {
  content: Evolution["successStories"];
};

export function Testimonials({ content }: TestimonialsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 42 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div data-el="testimonials" className="mt-12">
      <h3 className="text-prime-light gap-2 text-center text-xl font-bold uppercase">
        Histórias de sucesso
      </h3>

      <div ref={emblaRef} className="mt-8 overflow-hidden">
        <div className="-ml-8 flex">
          {content.nodes.map((item, index) => (
            <div
              key={index}
              className="min-w-0 shrink-0 grow-0 basis-full pl-8 md:basis-1/2"
            >
              <div className="border-l-prime-red/75 rounded-md border border-l-2 border-white/3 bg-white/3 px-6 py-8">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 overflow-hidden rounded-full">
                    {false ? (
                      <Image
                        src={item.featuredImage.node.mediaItemUrl}
                        width={75}
                        height={75}
                        alt=""
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="grid size-full place-items-center rounded-full border border-white/5 bg-white/3 text-white">
                        <UserIcon className="size-6" />
                      </div>
                    )}
                  </div>

                  <div className="text-prime-light">
                    <h4 className="text-lg font-bold">{item.title}</h4>
                    <strong className="text-prime-red/85 text-sm font-medium">
                      $
                      {Number(item.testimonialFields.earnings).toLocaleString(
                        "en-US",
                      )}
                    </strong>
                  </div>
                </div>

                <p className="text-prime-light mt-4 text-sm italic lg:text-base">
                  "{item.testimonialFields.testimonial}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`size-3 cursor-pointer rounded-sm transition-all duration-500 ${
              index === selectedIndex ? "bg-prime-light" : "bg-prime-light/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
