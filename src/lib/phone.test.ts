import { describe, it, expect } from 'vitest';
import { formatTelefone } from './phone';

describe('formatTelefone', () => {
  it('formata celular com 11 dígitos', () => {
    expect(formatTelefone('48999477316')).toBe('(48) 99947-7316');
  });

  it('formata telefone fixo com 10 dígitos', () => {
    expect(formatTelefone('4833334444')).toBe('(48) 3333-4444');
  });

  it('remove caracteres que não são dígitos', () => {
    expect(formatTelefone('+ (48) 9.9947-7316')).toBe('(48) 99947-7316');
  });

  it('ignora dígitos além do 11º', () => {
    expect(formatTelefone('489994773169999')).toBe('(48) 99947-7316');
  });

  it.each([
    ['', ''],
    ['4', '4'],
    ['48', '48'],
    ['489', '(48) 9'],
    ['489999', '(48) 9999'],
    ['4899994', '(48) 9999-4'],
  ])('formata a digitação parcial "%s" como "%s"', (input, expected) => {
    expect(formatTelefone(input)).toBe(expected);
  });

  it('reformata um valor que já está mascarado sem duplicar símbolos', () => {
    const once = formatTelefone('48999477316');
    expect(formatTelefone(once)).toBe(once);
  });
});
