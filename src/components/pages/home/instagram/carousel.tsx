"use client";

import {
  Carousel,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
} from "@/components/ui/carousel";
import { Post } from "./post";

/**
 * Faixa full-bleed do feed: 5 posts na view no desktop, sem bullets — a
 * navegação é o autoplay e o arraste. Mostra menos slides do que o total para
 * o autoplay ter para onde correr.
 */
export function InstagramCarousel({ posts }: { posts: Array<any> }) {
  return (
    <Carousel autoplay={4000} options={{ align: "start" }} className="mt-12">
      <CarouselViewport>
        <CarouselTrack className="-ml-2">
          {posts.map((post, key) => (
            <CarouselSlide
              key={key}
              className="basis-4/5 pl-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
            >
              <div className="aspect-square">
                <Post content={post} />
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>
    </Carousel>
  );
}
