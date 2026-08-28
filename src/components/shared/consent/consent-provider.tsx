"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CONSENT_ALL_DENIED,
  CONSENT_ALL_GRANTED,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  type ConsentValue,
  type StoredConsent,
} from "./config";

declare global {
  interface Window {
    // definido pelo <ConsentInit> (beforeInteractive)
    gtag?: (...args: unknown[]) => void;
  }
}

type ConsentContextValue = {
  /** escolha atual, ou null enquanto o usuário ainda não decidiu */
  consent: ConsentValue | null;
  /** false até lermos o localStorage no client (evita mismatch de hidratação) */
  ready: boolean;
  /** true quando o modal de preferências está aberto */
  preferencesOpen: boolean;
  setPreferencesOpen: (open: boolean) => void;
  openPreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (value: ConsentValue) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

/** Traduz nossas categorias para os sinais do Google Consent Mode v2. */
function applyConsent(value: ConsentValue) {
  window.gtag?.("consent", "update", {
    analytics_storage: value.analytics ? "granted" : "denied",
    ad_storage: value.marketing ? "granted" : "denied",
    ad_user_data: value.marketing ? "granted" : "denied",
    ad_personalization: value.marketing ? "granted" : "denied",
    personalization_storage: value.marketing ? "granted" : "denied",
  });
  window.gtag?.("set", "ads_data_redaction", !value.marketing);
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Lê a escolha salva só no client. O <ConsentInit> já restaurou os sinais no
  // GTM; aqui só sincronizamos o estado do React para decidir se a barra aparece.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as StoredConsent;
        if (stored.version === CONSENT_VERSION) {
          setConsent({
            analytics: !!stored.analytics,
            marketing: !!stored.marketing,
          });
        }
      }
    } catch {
      // localStorage indisponível / JSON inválido: trata como "sem decisão"
    }
    setReady(true);
  }, []);

  const save = useCallback((value: ConsentValue) => {
    const payload: StoredConsent = {
      ...value,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // se não der pra persistir, ao menos aplicamos na sessão atual
    }
    setConsent(value);
    applyConsent(value);
    setPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => save(CONSENT_ALL_GRANTED), [save]);
  const rejectAll = useCallback(() => save(CONSENT_ALL_DENIED), [save]);
  const openPreferences = useCallback(() => setPreferencesOpen(true), []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      ready,
      preferencesOpen,
      setPreferencesOpen,
      openPreferences,
      acceptAll,
      rejectAll,
      save,
    }),
    [
      consent,
      ready,
      preferencesOpen,
      openPreferences,
      acceptAll,
      rejectAll,
      save,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent precisa estar dentro de <ConsentProvider>");
  }
  return ctx;
}
