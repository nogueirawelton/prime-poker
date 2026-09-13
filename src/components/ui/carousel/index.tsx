"use client";

import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { Chip } from "@/icons/chip";

/** Opções compartilhadas por todos os carrosséis do projeto. */
const DEFAULT_OPTIONS: EmblaOptionsType = { loop: true, duration: 42 };
const DEFAULT_AUTOPLAY_DELAY = 5000;

type CarouselApi = {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  emblaApi: EmblaCarouselType | undefined;
  selectedIndex: number;
  scrollSnaps: number[];
  /** `false` quando os slides cabem todos na viewport — nada a navegar. */
  canScroll: boolean;
  scrollTo: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
};

const CarouselContext = createContext<CarouselApi | null>(null);

export function useCarousel() {
  const context = use(CarouselContext);

  if (!context) {
    throw new Error("useCarousel precisa estar dentro de <Carousel>.");
  }

  return context;
}

type CarouselProps = ComponentProps<"div"> & {
  options?: EmblaOptionsType;
  /** Delay do autoplay em ms, ou `false` para desligar. */
  autoplay?: number | false;
};

export function Carousel({
  options,
  autoplay = DEFAULT_AUTOPLAY_DELAY,
  children,
  ...props
}: CarouselProps) {
  const plugins = useMemo(
    () =>
      autoplay === false
        ? []
        : [Autoplay({ delay: autoplay, stopOnInteraction: false })],
    [autoplay],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { ...DEFAULT_OPTIONS, ...options },
    plugins,
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;

    function sync(api: EmblaCarouselType) {
      setSelectedIndex(api.selectedScrollSnap());
      setScrollSnaps(api.scrollSnapList());
    }

    sync(emblaApi);

    // `reInit` mantém os snaps corretos após resize/mudança de breakpoint.
    emblaApi.on("select", sync).on("reInit", sync);

    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi]);

  /**
   * Antes do Embla inicializar assumimos que dá para navegar: é o caso comum,
   * e supor o contrário faria as setas piscarem para dentro da tela no mount.
   * Com `loop`, o próprio Embla desliga o loop quando não há slides suficientes,
   * então a lista de snaps cai para um só.
   */
  const canScroll = !emblaApi || scrollSnaps.length > 1;

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const value = useMemo(
    () => ({
      emblaRef,
      emblaApi,
      selectedIndex,
      scrollSnaps,
      canScroll,
      scrollTo,
      scrollPrev,
      scrollNext,
    }),
    [
      emblaRef,
      emblaApi,
      selectedIndex,
      scrollSnaps,
      canScroll,
      scrollTo,
      scrollPrev,
      scrollNext,
    ],
  );

  return (
    <CarouselContext value={value}>
      <div {...props}>{children}</div>
    </CarouselContext>
  );
}

/** Área visível: recebe o ref do Embla e recorta o overflow. */
export function CarouselViewport({
  className,
  ...props
}: ComponentProps<"div">) {
  const { emblaRef } = useCarousel();

  return (
    <div
      ref={emblaRef}
      className={twMerge("overflow-hidden", className)}
      {...props}
    />
  );
}

/**
 * Trilho flex que contém os slides.
 *
 * Quando tudo cabe na viewport os slides são centralizados — encostados à
 * esquerda com sobra à direita o carrossel parece quebrado. Com slides demais
 * o `justify-center` sairia pela esquerda, por isso só entra com `!canScroll`.
 */
export function CarouselTrack({ className, ...props }: ComponentProps<"div">) {
  const { canScroll } = useCarousel();

  return (
    <div
      className={twMerge("flex", !canScroll && "justify-center", className)}
      {...props}
    />
  );
}

/** Slide individual. A largura vem do `basis-*` passado por className. */
export function CarouselSlide({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={twMerge("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  );
}

type DotState = { index: number; selected: boolean };

type CarouselDotsProps = Omit<ComponentProps<"div">, "children"> & {
  /**
   * Personaliza o marcador. Sem isso, usa o bullet padrão do projeto:
   * a ficha de pôquer do banner.
   */
  children?: (state: DotState) => ReactNode;
};

/** Bullet padrão de todos os carrosséis do projeto. */
function ChipDot({ selected }: DotState) {
  return (
    <Chip
      className={twMerge(
        "text-prime-light transition-all duration-500",
        selected ? "opacity-100" : "opacity-50",
      )}
    />
  );
}

export function CarouselDots({ children, ...props }: CarouselDotsProps) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();

  const renderDot = children ?? ChipDot;

  return (
    <div {...props}>
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Ir para o slide ${index + 1}`}
          aria-current={index === selectedIndex}
          onClick={() => scrollTo(index)}
        >
          {renderDot({ index, selected: index === selectedIndex })}
        </button>
      ))}
    </div>
  );
}

/** Some quando não há o que navegar — seta inerte é ruído. */
export function CarouselPrevious({ ...props }: ComponentProps<"button">) {
  const { scrollPrev, canScroll } = useCarousel();

  if (!canScroll) return null;

  return (
    <button
      type="button"
      aria-label="Slide anterior"
      onClick={scrollPrev}
      {...props}
    />
  );
}

/** Some quando não há o que navegar — seta inerte é ruído. */
export function CarouselNext({ ...props }: ComponentProps<"button">) {
  const { scrollNext, canScroll } = useCarousel();

  if (!canScroll) return null;

  return (
    <button
      type="button"
      aria-label="Próximo slide"
      onClick={scrollNext}
      {...props}
    />
  );
}
