import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "@/components/shared/consent/config";

/** Dados do lead como vêm dos formulários, antes da normalização. */
export type LeadData = {
  /** nome completo, dividido no primeiro espaço */
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  /** só dígitos, já com DDI (ex.: `5511999998888`) */
  phone?: string;
};

/** Formato `user_data` do Google, que mapeia direto para `em`/`ph`/`fn`/`ln` do Meta. */
type UserData = {
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
};

type DataLayerWindow = Window & { dataLayer?: unknown[] };

/** Mesma leitura do `<ConsentInit>`: só vale a escolha da versão atual. */
function hasMarketingConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;

    const stored = JSON.parse(raw);
    return stored?.version === CONSENT_VERSION && !!stored.marketing;
  } catch {
    return false;
  }
}

function toUserData(lead: LeadData): UserData {
  const [first, ...rest] = (lead.fullName ?? "").trim().split(/\s+/);
  const firstName = (lead.firstName ?? first ?? "").trim();
  const lastName = (lead.lastName ?? rest.join(" ")).trim();
  const email = lead.email?.trim().toLowerCase();
  const phone = lead.phone?.replace(/\D/g, "");

  // Campos vazios ficam de fora: o Meta pontua pior um valor em branco do
  // que a ausência dele.
  return Object.fromEntries(
    Object.entries({
      email,
      phone_number: phone ? `+${phone}` : undefined,
      first_name: firstName,
      last_name: lastName,
    }).filter(([, value]) => value),
  );
}

/**
 * Envia um evento para o GTM.
 *
 * Os formulários são enviados por JS, então o trigger nativo de "Envio de
 * formulário" do GTM não sabe se deu certo: quem avisa é o próprio site,
 * depois do sucesso. O push vai direto no `dataLayer` — se o gtm.js ainda
 * não carregou (ele espera o navegador ficar ocioso), o evento fica na fila
 * e é processado quando ele subir.
 *
 * `lead` vira `user_data` (texto puro, para a correspondência avançada do
 * Meta) e só é enviado com consentimento de marketing — sem ele, o evento
 * vai sem os dados pessoais. Nunca mapear `user_data` em tags do GA4: o
 * Google proíbe PII no Analytics.
 */
export function trackEvent(
  event: string,
  params?: Record<string, unknown>,
  lead?: LeadData,
) {
  if (typeof window === "undefined") return;

  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];

  if (!lead || !hasMarketingConsent()) {
    w.dataLayer.push({ event, ...params });
    return;
  }

  w.dataLayer.push({ event, ...params, user_data: toUserData(lead) });
  // O GTM guarda o último valor de cada chave: sem limpar, os dados do lead
  // seguiriam disponíveis para as tags dos próximos eventos.
  w.dataLayer.push({ user_data: undefined });
}
