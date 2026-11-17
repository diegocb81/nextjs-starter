import { test, expect, type Page, type Request, type Route } from '@playwright/test';
import { LEADS_API } from './support/supabase';
import { hasTestUser, SKIP_WITHOUT_TEST_USER } from './support/env';

// Painel administrativo. A sessão é real (salva pelo auth.setup.ts), mas os
// dados da tabela são simulados: os testes não leem nem alteram leads reais.

test.skip(!hasTestUser(), SKIP_WITHOUT_TEST_USER);

const leads = [
  {
    id: 'lead-1',
    created_at: '2026-11-10T13:00:00Z',
    nome: 'Ana Souza',
    email: 'ana@exemplo.com',
    telefone: '(48) 99911-2233',
    assunto: 'Orçamento',
    mensagem: 'Gostaria de um orçamento.\nPrazo: próximo mês.',
    status: 'Pendente',
  },
  {
    id: 'lead-2',
    created_at: '2026-11-09T10:00:00Z',
    nome: 'Bruno Lima',
    email: 'bruno@exemplo.com',
    telefone: '(48) 3333-4444',
    assunto: 'Dúvida',
    mensagem: 'Vocês atendem em outras cidades?',
    status: 'Finalizado',
  },
];

// "ok": o banco aplica a alteração; "error": responde com erro;
// "denied": responde 200 sem nenhuma linha, que é o que o Supabase faz quando
// a regra de segurança (RLS) bloqueia a operação, sem acusar erro.
type WriteOutcome = 'ok' | 'error' | 'denied';
type MockOptions = { data?: typeof leads; update?: WriteOutcome; remove?: WriteOutcome };

function respond(route: Route, outcome: WriteOutcome, id: string | undefined) {
  if (outcome === 'error') return route.fulfill({ status: 500, json: { message: 'erro simulado' } });
  // O serviço pede de volta as linhas afetadas (.select('id'))
  return route.fulfill({ json: outcome === 'ok' ? [{ id }] : [] });
}

// Simula a API do Supabase para a tabela leads. Retorna as requisições de
// escrita recebidas, para o teste conferir o que foi enviado.
async function mockLeads(page: Page, { data = leads, update = 'ok', remove = 'ok' }: MockOptions = {}) {
  const updates: Request[] = [];
  const deletes: Request[] = [];
  await page.route(LEADS_API, async (route) => {
    const request = route.request();
    const id = new URL(request.url()).searchParams.get('id')?.replace('eq.', '');
    if (request.method() === 'GET') return route.fulfill({ json: data });
    if (request.method() === 'PATCH') {
      updates.push(request);
      return respond(route, update, id);
    }
    if (request.method() === 'DELETE') {
      deletes.push(request);
      return respond(route, remove, id);
    }
    return route.abort();
  });
  return { updates, deletes };
}

const statusSelect = (page: Page, nome: string) => page.getByLabel(`Status do contato de ${nome}`);
const clientCell = (page: Page, nome: string) => page.getByRole('cell', { name: new RegExp(`^${nome}`) });

test.describe('Painel administrativo', () => {
  test('lista os contatos com e-mail, WhatsApp e status', async ({ page }) => {
    await mockLeads(page);
    await page.goto('/admin');

    await expect(page.getByText('2 contatos encontrados')).toBeVisible();
    await expect(clientCell(page, 'Ana Souza')).toBeVisible();
    await expect(page.getByRole('link', { name: 'ana@exemplo.com' })).toHaveAttribute('href', 'mailto:ana@exemplo.com');
    await expect(page.getByRole('link', { name: '(48) 99911-2233' })).toHaveAttribute('href', 'https://wa.me/5548999112233');
    await expect(statusSelect(page, 'Bruno Lima')).toHaveValue('Finalizado');
  });

  test('mostra e oculta a mensagem de um contato', async ({ page }) => {
    await mockLeads(page);
    await page.goto('/admin');

    await page.getByRole('button', { name: 'Ver' }).first().click();

    await expect(page.getByText('Prazo: próximo mês.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ocultar' })).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'Ocultar' }).click();
    await expect(page.getByText('Prazo: próximo mês.')).toBeHidden();
  });

  test('atualiza o status de um contato', async ({ page }) => {
    const { updates } = await mockLeads(page);
    await page.goto('/admin');

    await statusSelect(page, 'Ana Souza').selectOption('Em Contato');

    await expect(page.getByText('Lead atualizado para: Em Contato')).toBeVisible();
    expect(updates).toHaveLength(1);
    expect(updates[0].url()).toContain('id=eq.lead-1');
    expect(updates[0].postDataJSON()).toEqual({ status: 'Em Contato' });
  });

  test('desfaz a troca de status se o servidor recusar', async ({ page }) => {
    await mockLeads(page, { update: 'error' });
    await page.goto('/admin');

    await statusSelect(page, 'Ana Souza').selectOption('Finalizado');

    await expect(page.getByText('Falha ao salvar alteração. Tente novamente.')).toBeVisible();
    await expect(statusSelect(page, 'Ana Souza')).toHaveValue('Pendente');
  });

  test('desfaz a troca de status se o banco bloquear sem acusar erro (RLS)', async ({ page }) => {
    await mockLeads(page, { update: 'denied' });
    await page.goto('/admin');

    await statusSelect(page, 'Ana Souza').selectOption('Finalizado');

    await expect(page.getByText('Falha ao salvar alteração. Tente novamente.')).toBeVisible();
    await expect(statusSelect(page, 'Ana Souza')).toHaveValue('Pendente');
  });

  test('exclui um contato após confirmação', async ({ page }) => {
    const { deletes } = await mockLeads(page);
    await page.goto('/admin');

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Excluir definitivamente o contato de Ana Souza');
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Excluir contato de Ana Souza' }).click();

    await expect(page.getByText('Contato de Ana Souza excluído.')).toBeVisible();
    await expect(clientCell(page, 'Ana Souza')).toHaveCount(0);
    expect(deletes).toHaveLength(1);
    expect(deletes[0].url()).toContain('id=eq.lead-1');
  });

  test('não exclui nada se a confirmação for cancelada', async ({ page }) => {
    const { deletes } = await mockLeads(page);
    await page.goto('/admin');

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Excluir contato de Ana Souza' }).click();

    await expect(clientCell(page, 'Ana Souza')).toBeVisible();
    expect(deletes).toHaveLength(0);
  });

  test('mantém o contato na tela se o banco bloquear a exclusão sem acusar erro (RLS)', async ({ page }) => {
    await mockLeads(page, { remove: 'denied' });
    await page.goto('/admin');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Excluir contato de Ana Souza' }).click();

    await expect(page.getByText('Não foi possível excluir o contato. Tente novamente.')).toBeVisible();
    await expect(clientCell(page, 'Ana Souza')).toBeVisible();
  });

  test('informa quando não há contatos', async ({ page }) => {
    await mockLeads(page, { data: [] });
    await page.goto('/admin');

    await expect(page.getByText('Nenhum contato recebido ainda.')).toBeVisible();
  });

  test('envia quem já está logado direto para o painel', async ({ page }) => {
    await mockLeads(page);
    await page.goto('/admin/login');

    await expect(page).toHaveURL(/\/admin$/);
  });

  test('sai do painel e volta para o login', async ({ page }) => {
    await mockLeads(page);
    // A saída real encerraria a sessão no Supabase, derrubando os outros
    // testes que usam o mesmo usuário. Simulamos só a chamada ao servidor;
    // o navegador ainda apaga os próprios cookies, como no uso real.
    await page.route('**/auth/v1/logout*', (route) => route.fulfill({ status: 204, body: '' }));
    await page.goto('/admin');

    await page.getByRole('button', { name: 'Sair' }).click();

    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
