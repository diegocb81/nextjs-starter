import { describe, it, expect } from 'vitest';
import { contatoSchema } from './contato';

const valido = {
  nome: 'Maria Joaquina',
  email: 'maria@exemplo.com.br',
  telefone: '(48) 99947-7316',
  assunto: 'Orçamento',
  mensagem: 'Gostaria de um orçamento para o próximo mês.',
};

// Retorna os campos com erro, para as asserções ficarem legíveis
function camposComErro(data: unknown) {
  const result = contatoSchema.safeParse(data);
  return result.success ? [] : result.error.issues.map((i) => i.path[0]);
}

describe('contatoSchema', () => {
  it('aceita um contato completo e válido', () => {
    expect(contatoSchema.safeParse(valido).success).toBe(true);
  });

  it.each(['ana@ong.org', 'joao@empresa.net', 'contato@prefeitura.sc.gov.br', 'aluno@ufsc.edu.br'])(
    'aceita e-mail de qualquer domínio válido: %s',
    (email) => {
      expect(camposComErro({ ...valido, email })).toEqual([]);
    }
  );

  it('remove espaços colados ao e-mail', () => {
    const result = contatoSchema.parse({ ...valido, email: '  maria@exemplo.com  ' });
    expect(result.email).toBe('maria@exemplo.com');
  });

  it.each(['maria', 'maria@', '@exemplo.com', 'maria exemplo.com'])('recusa e-mail inválido: %s', (email) => {
    expect(camposComErro({ ...valido, email })).toEqual(['email']);
  });

  it.each([
    ['celular', '(48) 99947-7316', true],
    ['fixo', '(48) 3333-4444', true],
    ['sem DDD', '99947-7316', false],
    ['com dígitos demais', '(48) 99947-73161', false],
  ])('telefone %s (%s) válido: %s', (_desc, telefone, esperado) => {
    expect(camposComErro({ ...valido, telefone }).includes('telefone')).toBe(!esperado);
  });

  it('recusa assunto fora da lista', () => {
    expect(camposComErro({ ...valido, assunto: 'Spam' })).toEqual(['assunto']);
  });

  it('exige nome com pelo menos 3 caracteres', () => {
    expect(camposComErro({ ...valido, nome: 'Jo' })).toEqual(['nome']);
  });

  it('exige mensagem com pelo menos 10 caracteres', () => {
    expect(camposComErro({ ...valido, mensagem: 'Curto' })).toEqual(['mensagem']);
  });

  it('aponta todos os campos obrigatórios quando o formulário vem vazio', () => {
    const campos = camposComErro({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
    expect(new Set(campos)).toEqual(new Set(['nome', 'email', 'telefone', 'assunto', 'mensagem']));
  });

  it('aceita o campo honeypot preenchido (quem decide descartar é a API)', () => {
    expect(contatoSchema.safeParse({ ...valido, sobrenome: 'bot' }).success).toBe(true);
  });
});
