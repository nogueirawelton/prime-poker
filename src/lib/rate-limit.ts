import "server-only";

type Bucket = {
  count: number;
  /** Instante (ms) em que a janela atual expira. */
  resetAt: number;
};

/**
 * Limitador de taxa por chave, em memória.
 *
 * Proposital e assumidamente simples: o alvo são envios repetidos de
 * formulário, não um ataque coordenado. O mapa vive no processo, então reseta a
 * cada deploy e não é compartilhado entre instâncias serverless — quem precisar
 * de garantia forte tem de trocar por um armazenamento externo (Redis, KV).
 *
 * Mesmo assim resolve o caso real: um mesmo visitante (ou script ingênuo)
 * martelando a rota bate no limite dentro da mesma instância que o atende.
 */
const buckets = new Map<string, Bucket>();

/** Evita que o mapa cresça indefinidamente com chaves já expiradas. */
function cleanup(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  /** Segundos até a janela liberar de novo — vai no header `Retry-After`. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > 500) cleanup(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      success: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { success: true, retryAfter: 0 };
}

/**
 * IP de origem da requisição.
 *
 * `x-forwarded-for` é preenchido pela Vercel e pelos proxies à frente do app;
 * o primeiro endereço da lista é o do cliente. Sem ele, todos caem na mesma
 * chave `unknown` — o limite passa a valer para o conjunto, que é o
 * comportamento conservador desejado.
 */
export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return request.headers.get("x-real-ip") ?? "unknown";
}
