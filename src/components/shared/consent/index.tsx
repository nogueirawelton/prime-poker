"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { useConsent } from "./consent-provider";
import { CookieBanner } from "./cookie-banner";

/**
 * O painel de preferências carrega Radix Dialog + Switch e só aparece quando
 * o visitante pede para ajustar as categorias. Deixá-lo montado em toda
 * página custava esse peso a quem apenas aceita ou recusa na barra.
 */
const PreferencesDialog = dynamic(
  () => import("./preferences-dialog").then((mod) => mod.PreferencesDialog),
  { ssr: false },
);

export { ConsentProvider } from "./consent-provider";

/** Barra + modal. Renderize uma vez, dentro do <ConsentProvider>. */
export function CookieConsent() {
  const { preferencesOpen } = useConsent();

  // Uma vez aberto, fica montado: desmontar junto com o fechamento cortaria a
  // animação de saída do próprio Radix. O custo só é pago por quem abriu.
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (preferencesOpen) setEverOpened(true);
  }, [preferencesOpen]);

  return (
    <>
      <CookieBanner />
      {everOpened && <PreferencesDialog />}
    </>
  );
}

/**
 * Link para reabrir as preferências (rodapé, política de privacidade, etc.).
 * A LGPD exige que o usuário possa revisar/retirar o consentimento a qualquer
 * momento — por isso este gatilho fica sempre acessível.
 */
export function ManagePreferencesButton({
  className,
  children = "Preferências de cookies",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { openPreferences } = useConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className={cn(
        "underline underline-offset-2 transition-colors duration-500 hover:text-prime-red",
        className,
      )}
    >
      {children}
    </button>
  );
}
