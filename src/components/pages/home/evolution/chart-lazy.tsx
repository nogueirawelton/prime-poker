"use client";

import dynamic from "next/dynamic";
import type { Evolution } from "@/@types/pages/Home";

// Chart.js é canvas puro: nada a ganhar renderizando no servidor.
// ssr:false mantém as ~150KB da lib fora do bundle inicial da home.
const Chart = dynamic(() => import("./chart"), {
  ssr: false,
  loading: () => (
    <div className="h-[275px] animate-pulse rounded-md bg-white/5 md:h-[425px]" />
  ),
});

export function ChartLazy({
  content,
}: {
  content: Evolution["accumulatedEarnings"];
}) {
  return <Chart content={content} />;
}
