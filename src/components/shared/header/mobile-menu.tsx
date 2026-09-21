"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useCallback, useState } from "react";

const MenuMobileDialog = dynamic(
  () => import("./mobile-menu-dialog").then((mod) => mod.MenuMobileDialog),
  { ssr: false },
);

const preload = () => import("./mobile-menu-dialog");

/**
 * Gatilho do menu mobile.
 *
 * Enquanto ninguém toca no botão, só o ícone existe — o Radix Dialog e o
 * painel ficam fora do bundle. O `preload` no `pointerdown` chega antes do
 * `click`, então na prática o painel abre sem espera perceptível.
 */
export function MenuMobileTrigger({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  const warm = useCallback(() => {
    preload();
  }, []);

  if (mounted) return <MenuMobileDialog>{children}</MenuMobileDialog>;

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
