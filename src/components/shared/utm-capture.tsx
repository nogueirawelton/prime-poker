"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureUtmParams } from "@/utils/utm";

/**
 * Guarda as UTMs assim que a página carrega.
 *
 * A captura precisa acontecer na chegada, não no envio do formulário: o
 * visitante navega por links internos antes de converter e a query string se
 * perde no caminho.
 */
export function UtmCapture() {
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: gatilho de rota
  useEffect(() => {
    captureUtmParams();
  }, [pathname]);

  return null;
}
