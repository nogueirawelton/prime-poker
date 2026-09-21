"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Form = dynamic(() => import("./index").then((mod) => mod.Form), {
  ssr: false,
  loading: () => <FormSkeleton />,
});

/**
 * Distância em que o formulário começa a ser baixado. Generosa de propósito:
 * a seção fica no fim da home, então há scroll de sobra para o chunk chegar
 * antes de aparecer na tela.
 */
const PRELOAD_MARGIN = "800px";

/**
 * Esqueleto com a mesma altura e o mesmo ritmo do formulário real.
 *
 * Não é enfeite: sem ele a seção cresceria uns 600px quando o formulário
 * montasse, e isso é CLS puro — justamente o que a troca deveria evitar.
 */
function FormSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="flex items-center justify-between gap-4 px-8">
        {Array.from({ length: 4 }, (_, index) => index).map((index) => (
          <div key={index} className="contents">
            <span className="size-9 shrink-0 rounded-full bg-white/10" />
            {index < 3 && (
              <span className="block h-1 w-full rounded-full bg-white/10" />
            )}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 h-5 w-32 rounded bg-white/10" />

      <div className="mt-6">
        <div className="mb-6 h-4 w-56 rounded bg-white/10" />
        <div className="mx-auto h-8 w-48 rounded bg-white/10" />

        <div className="mt-4 flex flex-col gap-4">
          {Array.from({ length: 4 }, (_, index) => index).map((index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="h-5 w-40 rounded bg-white/10" />
              <div className="h-12 rounded-md bg-white/10" />
            </div>
          ))}
        </div>

        <div className="mt-6 h-12 rounded-md bg-white/10" />
      </div>
    </div>
  );
}

/**
 * Monta o formulário de inscrição só quando ele se aproxima da viewport.
 *
 * O formulário arrasta zod, react-hook-form, Radix Tabs e o input de
 * telefone — perto de 400 KB. Ele vive no fim da home, abaixo de cinco
 * seções: não há motivo para esse peso disputar banda com o banner.
 */
export function LazyForm() {
  const anchor = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = anchor.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        setVisible(true);
      },
      { rootMargin: PRELOAD_MARGIN },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return <div ref={anchor}>{visible ? <Form /> : <FormSkeleton />}</div>;
}
