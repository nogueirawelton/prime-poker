"use client";

import { cn } from "@/utils/cn";
import { useConsent } from "./consent-provider";
import { CookieBanner } from "./cookie-banner";
import { PreferencesDialog } from "./preferences-dialog";

export { ConsentProvider } from "./consent-provider";

/** Barra + modal. Renderize uma vez, dentro do <ConsentProvider>. */
export function CookieConsent() {
  return (
    <>
      <CookieBanner />
      <PreferencesDialog />
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
