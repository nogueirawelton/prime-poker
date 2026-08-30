/**
 * Captura das UTMs para envio nos formulários.
 *
 * A leitura é da URL, mas o valor é persistido em `sessionStorage` na primeira
 * vez que aparece: o visitante costuma navegar por links internos antes de
 * converter, e nem todos preservam a query string. Sem isso a atribuição da
 * campanha se perde entre a landing e o formulário.
 */
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

const STORAGE_KEY = "prime:utm";

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

function read(): UtmParams {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    // sessionStorage indisponível (modo privado, cookies bloqueados).
    return {};
  }
}

/** Guarda as UTMs presentes na URL atual, se houver. */
export function captureUtmParams() {
  if (typeof window === "undefined") return;

  const search = new URLSearchParams(window.location.search);
  const found: UtmParams = {};

  for (const key of UTM_KEYS) {
    const value = search.get(key);
    if (value) found[key] = value;
  }

  if (!Object.keys(found).length) return;

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...read(), ...found }),
    );
  } catch {
    // Sem persistência: as UTMs valem só enquanto a URL as carregar.
  }
}

/**
 * UTMs para anexar ao envio. A URL atual tem prioridade sobre o que foi
 * guardado — se o visitante chegou por uma campanha nova, ela é a que vale.
 */
export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};

  captureUtmParams();

  const stored = read();
  const search = new URLSearchParams(window.location.search);
  const params: UtmParams = { ...stored };

  for (const key of UTM_KEYS) {
    const value = search.get(key);
    if (value) params[key] = value;
  }

  // O CF7 espera todos os campos declarados: string vazia em vez de ausente.
  return Object.fromEntries(
    UTM_KEYS.map((key) => [key, params[key] ?? ""]),
  ) as UtmParams;
}
