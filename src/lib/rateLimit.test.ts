import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from './rateLimit';

const WINDOW_MS = 10 * 60 * 1000;

// O limitador guarda estado em memória entre chamadas. Cada teste usa uma
// chave própria para não ser afetado pelos anteriores.
let key = 0;
const nextKey = () => `ip-de-teste-${++key}`;

describe('rateLimit', () => {
  beforeEach(() => {
    // Relógio falso: permite "avançar o tempo" sem esperar de verdade
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('permite até o limite de requisições na janela', () => {
    const ip = nextKey();
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(ip, 5, WINDOW_MS).allowed).toBe(true);
    }
  });

  it('bloqueia a requisição seguinte ao limite e informa quando tentar de novo', () => {
    const ip = nextKey();
    for (let i = 0; i < 5; i++) rateLimit(ip, 5, WINDOW_MS);

    vi.advanceTimersByTime(60_000);
    const result = rateLimit(ip, 5, WINDOW_MS);

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(9 * 60);
  });

  it('libera novamente depois que a janela expira', () => {
    const ip = nextKey();
    for (let i = 0; i < 6; i++) rateLimit(ip, 5, WINDOW_MS);

    vi.advanceTimersByTime(WINDOW_MS);

    expect(rateLimit(ip, 5, WINDOW_MS).allowed).toBe(true);
  });

  it('conta cada IP separadamente', () => {
    const ipA = nextKey();
    const ipB = nextKey();
    for (let i = 0; i < 6; i++) rateLimit(ipA, 5, WINDOW_MS);

    expect(rateLimit(ipA, 5, WINDOW_MS).allowed).toBe(false);
    expect(rateLimit(ipB, 5, WINDOW_MS).allowed).toBe(true);
  });
});
