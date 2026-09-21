"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Evolution } from "@/@types/pages/Home";

// Chart.js é canvas puro: nada a ganhar renderizando no servidor.
const Chart = dynamic(() => import("./chart"), {
  ssr: false,
  loading: () => <Placeholder />,
});

/** Mesma altura do gráfico real, para a troca não empurrar o layout. */
function Placeholder() {
  return (
    <div
      aria-hidden="true"
      className="h-[275px] animate-pulse rounded-md bg-white/5 md:h-[425px]"
    />
  );
}

export function ChartLazy({
  content,
}: {
  content: Evolution["accumulatedEarnings"];
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Antes o `dynamic` disparava o download assim que o componente montava —
  // ou seja, logo depois da hidratação, com o gráfico ainda a três seções de
  // distância. As ~150 KB do Chart.js agora só saem quando ele se aproxima.
  useEffect(() => {
    const element = anchor.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        setVisible(true);
      },
      { rootMargin: "600px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={anchor}>
      {visible ? <Chart content={content} /> : <Placeholder />}
    </div>
  );
}
