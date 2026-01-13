import { Banner as BannerType } from "@/@types/pages/Home";
import { FormDialog } from "@/components/globals/form-dialog";
import { AnimationContainer } from "@/hooks/use-animation";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { MediaSwiper } from "./media-swiper";

type BannerProps = {
  content: BannerType;
};

export function Banner({ content }: BannerProps) {
  return (
    <section className="relative h-[calc(100vh-7rem)]">
      <MediaSwiper content={content.medias} />

      <div className="relative z-10 h-full bg-[radial-gradient(transparent,black)]">
        <AnimationContainer
          animation="home/banner"
          className="text-prime-light relative z-20 mx-auto grid h-full max-w-screen-2xl items-center px-4 lg:px-8"
        >
          <div className="lg:pb-24">
            <h1
              className="break [&_strong]:text-prime-red break text-4xl font-bold uppercase lg:text-5xl"
              dangerouslySetInnerHTML={{
                __html: content.title,
              }}
            />

            <div
              className="break mt-4 lg:text-lg"
              dangerouslySetInnerHTML={{ __html: content.description }}
            />

            <div data-el="cta">
              <FormDialog>
                <button className="bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red mt-8 flex h-14 w-fit items-center gap-2 rounded-md px-4 text-sm font-medium transition-all duration-500 lg:text-base">
                  Faça Parte do Prime Poker Team{" "}
                  <CaretRightIcon className="size-6" />
                </button>
              </FormDialog>
            </div>
          </div>

          <div
            data-pagination="banner"
            className="absolute bottom-32 left-8 z-20 flex items-center justify-center gap-3"
          ></div>
        </AnimationContainer>
      </div>

      <Link
        href="#quem-somos"
        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 animate-bounce"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 173 173"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M86.4999 55.0338C60.043 99.2147 30.2592 3.7151 0 44.5342C31.685 85.3534 61.9442 127.853 86.4999 172.034C112.006 127.012 139.889 84.0911 173 44.5342C140.84 3.7151 111.531 98.3753 86.4999 55.0338Z"
            fill="#151515"
          />
          <path
            d="M86.4999 31.5339C60.043 75.7147 30.2592 -31.2852 0 9.53388C31.685 50.353 61.9442 92.853 86.4999 137.034C112.006 92.0115 139.889 49.0908 173 9.53388C140.84 -31.2852 111.531 74.8754 86.4999 31.5339Z"
            fill="#939393"
          />
        </svg>
      </Link>
    </section>
  );
}
