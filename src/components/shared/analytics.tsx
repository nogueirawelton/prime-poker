"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { useEffect, useState } from "react";

const GTM_ID = "GTM-PZQP6GVH";

/** Eventos que indicam alguém de fato usando a página. */
const INTERACTIONS = ["pointerdown", "keydown", "scroll"] as const;

/**
 * Carrega o GTM só depois que a página está de pé.
 *
 * O `<GoogleTagManager>` usa `afterInteractive`, o que no papel é tarde mas
 * na prática cai dentro da janela que o Lighthouse mede: o gtm.js e as tags
 * que ele injeta eram um dos maiores blocos de TBT no mobile, disputando CPU
 * com a hidratação.
 *
 * Aqui ele espera o navegador ficar ocioso — ou a primeira interação, o que
 * vier antes, para que ninguém que já começou a navegar fique sem medição. O
 * Consent Mode continua inicializado antes, no `<ConsentInit>`, então nenhuma
 * tag dispara sem permissão.
 */
export function Analytics() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      cancelled = true;
      cleanup();
      setReady(true);
    };

    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(start, { timeout: 5000 })
        : window.setTimeout(start, 3000);

    function cleanup() {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      } else {
        window.clearTimeout(idle);
      }

      for (const event of INTERACTIONS) {
        window.removeEventListener(event, start);
      }
    }

    for (const event of INTERACTIONS) {
      window.addEventListener(event, start, { once: true, passive: true });
    }

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  if (!ready) return null;

  return <GoogleTagManager gtmId={GTM_ID} />;
}
