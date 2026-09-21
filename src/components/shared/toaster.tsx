"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false },
);

/** Sinais de que alguém está de fato usando a página. */
const INTERACTIONS = ["pointerdown", "keydown"] as const;

/**
 * Container de toasts, montado na primeira interação.
 *
 * Todo toast do projeto nasce de uma ação do visitante — envio de
 * formulário, clique num botão. Nenhum dispara sozinho no carregamento, então
 * não há motivo para os ~42 KB da biblioteca entrarem antes disso: numa visita
 * que só lê a página, eles nunca são baixados.
 *
 * A mesma interação que monta o container costuma ser a que dispara o toast.
 * Não há corrida: chamadas a `toast()` feitas antes da montagem ficam na fila
 * da própria biblioteca e aparecem assim que o container entra.
 */
export function Toaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);

    for (const event of INTERACTIONS) {
      window.addEventListener(event, start, { once: true, passive: true });
    }

    return () => {
      for (const event of INTERACTIONS) {
        window.removeEventListener(event, start);
      }
    };
  }, []);

  if (!ready) return null;

  return <ToastContainer />;
}
