import { test, expect } from '@playwright/test';

// Testes da rota /api/contato chamada diretamente, sem navegador.
// Nenhum destes casos chega a enviar e-mail: todos param antes (validação,
// honeypot ou limite de requisições).
//
// O limitador conta requisições por IP. Cada teste usa um IP próprio (faixa
// 203.0.113.x, reservada para documentação) para não interferir nos demais.

const valido = {
  nome: 'Teste API',
  email: 'teste@exemplo.com',
  telefone: '(48) 99947-7316',
  assunto: 'Dúvida',
  mensagem: 'Mensagem enviada pelo teste de API.',
};

const fromIp = (n: number) => ({ 'x-forwarded-for': `203.0.113.${n}` });

test.describe('API /api/contato', () => {
  test('recusa dados inválidos com 400', async ({ request }) => {
    const response = await request.post('/api/contato', {
      headers: fromIp(1),
      data: { ...valido, email: 'nao-e-email' },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Dados inválidos' });
  });

  test('recusa corpo que não é JSON com 400', async ({ request }) => {
    const response = await request.post('/api/contato', {
      headers: { ...fromIp(2), 'content-type': 'application/json' },
      data: 'isto não é json',
    });

    expect(response.status()).toBe(400);
  });

  test('finge sucesso para robôs que preenchem o honeypot, sem enviar nada', async ({ request }) => {
    const response = await request.post('/api/contato', {
      headers: fromIp(3),
      data: { ...valido, sobrenome: 'bot' },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });

  test('bloqueia com 429 após 5 requisições do mesmo IP', async ({ request }) => {
    const headers = fromIp(4);
    for (let i = 0; i < 5; i++) {
      const ok = await request.post('/api/contato', { headers, data: {} });
      expect(ok.status()).toBe(400);
    }

    const blocked = await request.post('/api/contato', { headers, data: {} });

    expect(blocked.status()).toBe(429);
    expect(Number(blocked.headers()['retry-after'])).toBeGreaterThan(0);
  });

  test('envia os cabeçalhos de segurança', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['strict-transport-security']).toContain('max-age=');
    expect(headers['x-powered-by']).toBeUndefined();
  });
});
