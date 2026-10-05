/**
 * Envia um evento para o GTM.
 *
 * Os formulários são enviados por JS, então o trigger nativo de "Envio de
 * formulário" do GTM não sabe se deu certo: quem avisa é o próprio site,
 * depois do sucesso. O push vai direto no `dataLayer` — se o gtm.js ainda
 * não carregou (ele espera o navegador ficar ocioso), o evento fica na fila
 * e é processado quando ele subir.
 *
 * Não mandar dados pessoais (nome, e-mail, telefone) nos parâmetros.
 */
export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}
