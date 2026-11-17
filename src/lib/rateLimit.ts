// Limitador simples em memória (janela fixa por chave, normalmente o IP).
//
// Limitação conhecida: em hospedagem serverless cada instância tem a própria
// memória, então isto é uma barreira de "melhor esforço" contra abuso básico,
// não uma garantia. Para algo definitivo, usar um armazenamento compartilhado
// (ex.: Upstash) ou o firewall da hospedagem.

type Entry = { count: number; resetAt: number };

const hits = new Map<string, Entry>();
const MAX_KEYS = 5000;

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    // Evita crescimento sem fim do mapa em caso de muitos IPs diferentes
    if (hits.size >= MAX_KEYS) {
      for (const [k, v] of hits) {
        if (v.resetAt <= now) hits.delete(k);
      }
      if (hits.size >= MAX_KEYS) hits.clear();
    }
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  return {
    allowed: entry.count <= limit,
    retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}
