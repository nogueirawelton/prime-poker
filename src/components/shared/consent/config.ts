// Fonte única de verdade para o consentimento de cookies (Consent Mode v2).
// Importável tanto por Server quanto por Client Components.

export const CONSENT_STORAGE_KEY = "prime_cookie_consent";

// Suba a versão quando o texto/política ou as categorias mudarem:
// consentimentos gravados em versões antigas passam a ser reconsiderados.
export const CONSENT_VERSION = 1;

export type ConsentValue = {
  analytics: boolean;
  marketing: boolean;
};

export type StoredConsent = ConsentValue & {
  version: number;
  timestamp: string;
};

// Categorias que aparecem no modal de preferências (os "necessários" são
// implícitos e sempre ativos, por isso não entram aqui).
export const CONSENT_CATEGORIES: Array<{
  key: keyof ConsentValue;
  title: string;
  description: string;
}> = [
  {
    key: "analytics",
    title: "Análise de uso",
    description:
      "Nos ajudam a entender como você navega no site para melhorarmos a experiência (Google Analytics).",
  },
  {
    key: "marketing",
    title: "Marketing",
    description:
      "Permitem medir campanhas e mostrar anúncios mais relevantes para você (Google Ads).",
  },
];

export const CONSENT_ALL_GRANTED: ConsentValue = {
  analytics: true,
  marketing: true,
};

export const CONSENT_ALL_DENIED: ConsentValue = {
  analytics: false,
  marketing: false,
};
