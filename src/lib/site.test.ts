import { describe, it, expect } from 'vitest';
import { CONTACT, siteInitials, whatsappLinkFromPhone } from './site';

describe('whatsappLinkFromPhone', () => {
  it('adiciona o código do país a um celular digitado com máscara', () => {
    expect(whatsappLinkFromPhone('(48) 99947-7316')).toBe('https://wa.me/5548999477316');
  });

  it('não duplica o 55 quando o número já vem com código do país', () => {
    expect(whatsappLinkFromPhone('+55 48 99947-7316')).toBe('https://wa.me/5548999477316');
  });

  it('trata o DDD 55 (Santa Maria/RS) como DDD, não como código do país', () => {
    expect(whatsappLinkFromPhone('(55) 99999-8888')).toBe('https://wa.me/5555999998888');
  });

  it('aceita telefone fixo', () => {
    expect(whatsappLinkFromPhone('(48) 3333-4444')).toBe('https://wa.me/554833334444');
  });
});

describe('siteInitials', () => {
  it('usa as iniciais das duas primeiras palavras relevantes', () => {
    expect(siteInitials('Nome da Empresa')).toBe('NE');
    expect(siteInitials('Coffee Break da Ilha')).toBe('CB');
  });
});

describe('CONTACT', () => {
  it('o link e o número exibido do WhatsApp são o mesmo telefone', () => {
    expect(CONTACT.whatsappUrl).toBe(whatsappLinkFromPhone(CONTACT.whatsappDisplay));
  });
});
