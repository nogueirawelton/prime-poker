import Script from "next/script";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "./config";

/**
 * Inicializa o Google Consent Mode v2 ANTES do container do GTM carregar.
 *
 * `strategy="beforeInteractive"` garante que este script vá para o <head> e
 * execute antes de qualquer script `afterInteractive` (que é como o
 * <GoogleTagManager> carrega). Assim o padrão "tudo negado" está setado antes
 * de qualquer tag disparar — nenhum cookie de analytics/marketing é gravado
 * sem consentimento (exigência da LGPD).
 *
 * Se o visitante já tiver decidido em uma visita anterior, restauramos a
 * escolha aqui mesmo (síncrono), então tags autorizadas já sobem sem flicker.
 */
export function ConsentInit() {
  const inline = `
(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    personalization_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  try {
    var raw = localStorage.getItem('${CONSENT_STORAGE_KEY}');
    if (raw) {
      var c = JSON.parse(raw);
      if (c && c.version === ${CONSENT_VERSION}) {
        gtag('consent', 'update', {
          analytics_storage: c.analytics ? 'granted' : 'denied',
          ad_storage: c.marketing ? 'granted' : 'denied',
          ad_user_data: c.marketing ? 'granted' : 'denied',
          ad_personalization: c.marketing ? 'granted' : 'denied',
          personalization_storage: c.marketing ? 'granted' : 'denied'
        });
        gtag('set', 'ads_data_redaction', !c.marketing);
      }
    }
  } catch (e) {}
})();
`;

  return (
    <Script
      id="consent-mode-init"
      strategy="beforeInteractive"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: script de consentimento inline precisa rodar antes do GTM
      dangerouslySetInnerHTML={{ __html: inline }}
    />
  );
}
