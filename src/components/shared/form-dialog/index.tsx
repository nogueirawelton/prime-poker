"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useCallback, useState } from "react";

const ApplicationDialog = dynamic(
  () => import("./application-dialog").then((mod) => mod.ApplicationDialog),
  { ssr: false },
);

/** Aquece o chunk antes do clique, para o diálogo abrir sem espera. */
const preload = () => import("./application-dialog");

/**
 * Gatilho do formulário de inscrição.
 *
 * Enquanto ninguém clica, só o botão existe — o diálogo inteiro (Radix,
 * react-hook-form, zod, input de telefone) fica fora do bundle. Antes esses
 * ~400 KB eram baixados em toda visita à home e ao blog, para um formulário
 * que a maioria nunca abre.
 *
 * `display: contents` no wrapper: ele precisa capturar o clique sem existir
 * para o layout, já que o botão vem de fora com as próprias margens.
 */
export function FormDialog({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Em ponteiro fino o hover antecipa o download; no toque, o `pointerdown`
  // ainda chega antes do `click`.
  const warm = useCallback(() => {
    preload();
  }, []);

  if (mounted) return <ApplicationDialog>{children}</ApplicationDialog>;

  return (
    // O alvo interativo real é o botão que vem em `children`; este wrapper
    // só captura o clique que borbulha dele para montar o diálogo. Dar
    // `role`/`tabIndex` ao span criaria uma segunda parada de tabulação para
    // o mesmo controle — pior de acessibilidade, não melhor. O teclado já
    // funciona: Enter no botão dispara `click`, que chega aqui.
    // biome-ignore lint/a11y/noStaticElementInteractions: o controle é o botão filho
    // biome-ignore lint/a11y/useKeyWithClickEvents: Enter no botão filho borbulha como clique
    <span
      className="contents"
      onClick={() => setMounted(true)}
      onPointerEnter={warm}
      onPointerDown={warm}
      onFocus={warm}
    >
      {children}
    </span>
  );
}
