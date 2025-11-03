"use client";

import animations from "@/animations";
import { useGSAP, useGSAPConfig } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ComponentProps, createContext, useRef } from "react";
gsap.registerPlugin(useGSAP, ScrollTrigger);

const AnimationContext = createContext(null);

export type Wrapper = Record<
  string,
  (container: HTMLDivElement, dependencies: Array<any>) => void
>;

interface AnimationContainerProps extends ComponentProps<"div"> {
  animation?: string;
  options?: useGSAPConfig;
}

export function AnimationContainer({
  children,
  animation,
  options,
  ...props
}: AnimationContainerProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!animation || !container.current) return;

      const [page, section] = animation.split("/");
      const sectionFn = (animations as any)[page][section];

      let ctx: gsap.Context;

      const raf = requestAnimationFrame(() => {
        ctx = gsap.context(() => {
          sectionFn(container.current, options?.dependencies || []);
        }, container);
      });

      return () => {
        cancelAnimationFrame(raf);
        if (ctx) ctx.revert();
      };
    },
    {
      ...options,
    },
  );

  return (
    <AnimationContext value={null}>
      <div ref={container} {...props}>
        {children}
      </div>
    </AnimationContext>
  );
}
