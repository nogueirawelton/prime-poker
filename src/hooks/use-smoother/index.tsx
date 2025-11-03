"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

gsap.registerPlugin(useGSAP, ScrollSmoother);

interface SmootherContextProps {
  scrollTo: (hash: string | null) => void;
}

const SmootherContext = createContext({} as SmootherContextProps);

export function SmootherProvider({ children }: { children: ReactNode }) {
  const [smoother, setSmoother] = useState<ScrollSmoother>();

  function scrollTo(hash: string | null) {
    if (hash) {
      const element: HTMLElement | null = document.querySelector(hash);
      if (element) {
        history.pushState(null, "", hash);
        smoother?.scrollTo(element.offsetTop - 96, true);
      }
    }
  }

  useGSAP(() => {
    setSmoother(
      ScrollSmoother.create({
        smooth: 0.75,
      }),
    );
  });

  useEffect(() => {
    const hash = location.hash;

    if (smoother && hash) {
      setTimeout(() => {
        scrollTo(hash);
      }, 2000);
    }
  }, [smoother]);

  return (
    <SmootherContext
      value={{
        scrollTo,
      }}
    >
      {children}
    </SmootherContext>
  );
}

export function useSmoother() {
  return useContext(SmootherContext);
}
