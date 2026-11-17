import { describe, it, expect } from 'vitest';
import { LEAD_STATUSES, normalizeStatus } from './leadStatus';

describe('normalizeStatus', () => {
  it.each(LEAD_STATUSES)('mantém o status válido "%s"', (status) => {
    expect(normalizeStatus(status)).toBe(status);
  });

  it.each([null, undefined, '', 'Cancelado', 'pendente'])('trata "%s" como Pendente', (value) => {
    expect(normalizeStatus(value)).toBe('Pendente');
  });
});
