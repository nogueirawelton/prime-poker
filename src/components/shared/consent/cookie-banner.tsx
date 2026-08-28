"use client";

import { SmartLink } from "@/components/ui/smart-link";
import { useConsent } from "./consent-provider";

export function CookieBanner() {
  const { consent, ready, acceptAll, rejectAll, openPreferences } =
    useConsent();

  // Não renderiza no servidor nem antes de lermos a escolha (evita flicker),
  // e some assim que o usuário já decidiu.
  if (!ready || consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 lg:inset-x-auto lg:bottom-4 lg:left-4 lg:max-w-md">
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-zinc-800 p-5 shadow-2xl">
        <div className="space-y-1">
          <strong className="font-bold text-base text-prime-light">
            Nós usamos cookies
          </strong>
          <p className="text-prime-light/70 text-sm leading-relaxed">
            Utilizamos cookies e outras tecnologias semelhantes para melhorar
            sua experiência. De acordo com a nossa Política de Privacidade, ao
            continuar navegando, você aceita estas condições. Acesse nossa{" "}
            <SmartLink
              href="/politica-de-privacidade"
              className="text-prime-light underline underline-offset-2 transition-colors duration-500 hover:text-prime-red"
            >
              Política de Privacidade
            </SmartLink>{" "}
            e confira como tratamos os dados pessoais.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={rejectAll}
            className="flex-1 rounded-lg border border-white/20 px-4 py-2.5 font-semibold text-prime-light text-sm transition-colors duration-500 hover:bg-prime-light hover:text-prime-dark"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="flex-1 rounded-lg bg-prime-red px-4 py-2.5 font-semibold text-prime-light text-sm transition-colors duration-500 hover:bg-prime-light hover:text-prime-red"
          >
            Aceitar
          </button>
        </div>

        <button
          type="button"
          onClick={openPreferences}
          className="self-center text-prime-light/70 text-xs underline underline-offset-2 transition-colors duration-500 hover:text-prime-light"
        >
          Personalizar preferências
        </button>
      </div>
    </div>
  );
}
