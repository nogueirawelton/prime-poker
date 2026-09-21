import type { ApplicationPayload } from "@/components/shared/application-form/schema";

type GsheetsResponse = { message?: string };

/**
 * Registra um envio de formulário na planilha do Google.
 *
 * O destino real é um Apps Script publicado como Web App, mas o cliente nunca
 * o enxerga: quem fala com ele é `/api/gsheets`. A URL do script não aceita
 * autenticação, então deixá-la no bundle equivaleria a publicar um endpoint de
 * escrita aberto na planilha — o desvio pela rota é o que permite barrar
 * origem, taxa e payload inválido antes do repasse.
 *
 * Lança em caso de recusa, com a mensagem que a rota devolveu — mesmo contrato
 * de `wp()`, para os formulários tratarem os dois envios da mesma forma.
 */
export async function gsheets(data: ApplicationPayload) {
  const response = await fetch("/api/gsheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  let result: GsheetsResponse;

  try {
    result = await response.json();
  } catch {
    throw new Error("Não foi possível concluir o envio. Tente novamente.");
  }

  if (!response.ok) {
    throw new Error(result.message || "Não foi possível concluir o envio.");
  }

  return result;
}
