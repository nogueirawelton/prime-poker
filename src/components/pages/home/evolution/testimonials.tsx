"use client";

import { Evolution } from "@/@types/pages/Home";
import { UserIcon } from "@phosphor-icons/react";
import Image from "next/image";
import "swiper/css";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export type TestimonialsProps = {
  content: Evolution["successStories"];
};

export function Testimonials({ content }: TestimonialsProps) {
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
        {content.nodes.map((item, index) => (
          <SwiperSlide key={index}>
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
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        data-pagination="testimonials"
        className="mt-6 flex items-center justify-center gap-2"
      />
    </div>
  );
}
