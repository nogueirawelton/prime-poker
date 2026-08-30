"use client";

import { ArrowRightIcon, ClockIcon } from "@phosphor-icons/react";
import Link from "next/link";
import {
  Carousel,
  CarouselDots,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
} from "@/components/ui/carousel";
import type { Post } from "@/services/blog";
import { PostCover } from "./post-cover";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function FeaturedCarousel({ posts }: { posts: Array<Post> }) {
  if (!posts.length) return null;

  return (
    <Carousel autoplay={7000} className="mt-8">
      <CarouselViewport>
        <CarouselTrack className="-ml-4 lg:-ml-6">
          {posts.map((post) => (
            <CarouselSlide key={post.id} className="pl-4 lg:pl-6">
              <Link
                href={`/blog/${post.slug}`}
                className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-xl border border-white/10 p-6 lg:min-h-[440px] lg:p-10"
              >
                <PostCover
                  post={post}
                  variant="hero"
                  className="absolute inset-0"
                />

                {/* Véu para o texto sobreviver a qualquer capa. */}
                <div className="absolute inset-0 bg-linear-to-t from-prime-dark via-55% via-prime-dark/55 to-transparent" />

                <div className="relative flex max-w-2xl flex-col gap-3">
                  {post.category && (
                    <span className="w-fit rounded-full bg-prime-red px-3 py-1 font-semibold text-prime-light text-xs uppercase">
                      {post.category.name}
                    </span>
                  )}

                  <h3 className="font-black text-2xl text-prime-light uppercase leading-tight lg:text-4xl">
                    {post.title}
                  </h3>

                  <p className="text-prime-light/80 text-sm lg:text-base">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-prime-light/60 text-xs">
                    <span className="font-medium text-prime-light/80">
                      {post.author}
                    </span>
                    <time dateTime={post.date}>
                      {dateFormatter.format(new Date(post.date))}
                    </time>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="size-3.5" />
                      {post.readingTime} min
                    </span>
                  </div>

                  <span className="mt-2 flex w-fit items-center gap-2 font-semibold text-prime-red text-sm uppercase transition-gap duration-500 group-hover:gap-4">
                    Ler artigo
                    <ArrowRightIcon className="size-5" weight="bold" />
                  </span>
                </div>
              </Link>
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>

      <CarouselDots className="mt-6 flex items-center justify-center gap-3" />
    </Carousel>
  );
}
