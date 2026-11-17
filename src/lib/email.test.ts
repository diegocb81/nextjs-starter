import { describe, it, expect } from 'vitest';
import { escapeHtml, singleLine } from './email';

describe('escapeHtml', () => {
  it('neutraliza tags HTML', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('neutraliza aspas, que permitiriam sair de um atributo', () => {
    expect(escapeHtml(`"onmouseover='x'`)).toBe('&quot;onmouseover=&#39;x&#39;');
  });

  it('escapa o & primeiro, sem escapar duas vezes', () => {
    expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;');
  });

  it('mantém texto comum e acentos intactos', () => {
    expect(escapeHtml('Café da manhã para 30 pessoas')).toBe('Café da manhã para 30 pessoas');
  });
});

describe('singleLine', () => {
  it('troca quebras de linha por espaço (evita injeção de cabeçalho no assunto)', () => {
    expect(singleLine('Maria\r\nBcc: alvo@exemplo.com')).toBe('Maria Bcc: alvo@exemplo.com');
  });

  it('remove espaços nas pontas', () => {
    expect(singleLine('  Maria \n')).toBe('Maria');
  });
});
