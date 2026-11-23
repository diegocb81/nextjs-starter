import { test, expect, type Request } from '@playwright/test';
import { ContactPage, type ContactForm } from './pages/ContactPage';
import { LEADS_API } from './support/supabase';

// O formulário, a máscara e a validação rodam de verdade no navegador.
// Só a "última milha" é simulada: a gravação no Supabase e o envio de e-mail.
// Assim nenhum lead falso vai para o banco e nenhum e-mail real é disparado,
// e o teste ainda confere exatamente o que seria enviado.

const contato: ContactForm = {
  nome: 'Cliente de Teste Playwright',
  email: 'teste@exemplo.com',
  telefone: '48999477316', // digitado sem máscara: a página formata
  assunto: 'Orçamento',
  mensagem: 'Teste de automação: pedido de orçamento.',
};

test.describe('Formulário de contato', () => {
  test('envia o contato com os dados corretos e mostra a confirmação', async ({ page }) => {
    const form = new ContactPage(page);
    let insert: Request | undefined;
    let email: Request | undefined;

    await page.route(LEADS_API, async (route) => {
      insert = route.request();
      // 201 sem corpo: é o que o Supabase devolve num insert sem .select()
      await route.fulfill({ status: 201, body: '' });
    });
    await page.route('**/api/contato', async (route) => {
      email = route.request();
      await route.fulfill({ json: { success: true } });
    });

    await form.goto();
    await form.fill(contato);
    await expect(form.telefone).toHaveValue('(48) 99947-7316');
    await form.submit();

    await expect(form.successHeading).toBeVisible();
    // A mensagem de sucesso recebe o foco (anunciada por leitores de tela)
    await expect(form.successHeading).toBeFocused();

    expect(insert?.method()).toBe('POST');
    expect(insert?.postDataJSON()).toEqual([
      {
        nome: contato.nome,
        email: contato.email,
        telefone: '(48) 99947-7316',
        assunto: contato.assunto,
        mensagem: contato.mensagem,
        status: 'Pendente',
      },
    ]);
    expect(email?.postDataJSON()).toMatchObject({
      nome: contato.nome,
      email: contato.email,
      assunto: contato.assunto,
    });
  });

  test('não envia nada quando o formulário tem erros', async ({ page }) => {
    const form = new ContactPage(page);
    let calls = 0;
    await page.route(LEADS_API, (route) => { calls++; return route.abort(); });
    await page.route('**/api/contato', (route) => { calls++; return route.abort(); });

    await form.goto();
    await form.fill({ ...contato, email: 'email-invalido', mensagem: 'curto' });
    await form.submit();

    await expect(page.getByText('Digite um e-mail válido')).toBeVisible();
    await expect(form.email).toHaveAttribute('aria-invalid', 'true');
    // O foco vai para o primeiro campo com erro
    await expect(form.email).toBeFocused();
    expect(calls).toBe(0);
  });

  test('avisa o usuário e mantém o formulário se o banco falhar', async ({ page }) => {
    const form = new ContactPage(page);
    let emailSent = false;
    await page.route(LEADS_API, (route) =>
      route.fulfill({ status: 500, json: { message: 'erro simulado' } })
    );
    await page.route('**/api/contato', (route) => { emailSent = true; return route.abort(); });

    await form.goto();
    await form.fill(contato);
    await form.submit();

    await expect(page.getByText('Ocorreu um erro ao enviar sua mensagem.')).toBeVisible();
    await expect(form.submitButton).toBeEnabled();
    await expect(form.nome).toHaveValue(contato.nome);
    // Se o contato não foi salvo, o e-mail também não pode sair
    expect(emailSent).toBe(false);
  });

  test('confirma o envio mesmo se o e-mail falhar, pois o contato já foi salvo', async ({ page }) => {
    const form = new ContactPage(page);
    await page.route(LEADS_API, (route) => route.fulfill({ status: 201, body: '' }));
    await page.route('**/api/contato', (route) => route.fulfill({ status: 502, json: { error: 'falha' } }));

    await form.goto();
    await form.fill(contato);
    await form.submit();

    // O lead está no painel; a empresa o verá mesmo sem o e-mail
    await expect(form.successHeading).toBeVisible();
  });

  test('a linha de destaque de cada campo encosta na base do campo', async ({ page }) => {
    await new ContactPage(page).goto();

    // Para cada campo: distância entre a base do campo (linha cinza) e a base
    // da linha de destaque que aparece no foco (div absoluta no fundo do contêiner)
    const gaps = await page.evaluate(() =>
      [...document.querySelectorAll('form input:not([name="sobrenome"]), form select, form textarea')].map((el) => {
        const line = el.parentElement!.querySelector('.absolute.bottom-0')!;
        return {
          campo: el.getAttribute('name'),
          distancia: Math.round(line.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom),
        };
      }),
    );

    expect(gaps).toHaveLength(5);
    for (const gap of gaps) expect(gap).toEqual({ campo: gap.campo, distancia: 0 });
  });
});

// Teste ponta a ponta REAL: grava no Supabase e envia e-mail de verdade.
// Fica desligado por padrão; para rodar: $env:E2E_REAL="1"; npx playwright test contact-flow
test.describe('Formulário de contato (integração real)', () => {
  test.skip(!process.env.E2E_REAL, 'Defina E2E_REAL=1 para gravar no banco e enviar e-mail de verdade');

  test('registra o contato no banco e envia o e-mail', async ({ page }) => {
    const form = new ContactPage(page);
    await form.goto();
    await form.fill({ ...contato, mensagem: 'Teste de integração real (pode ser apagado).' });
    await form.submit();

    await expect(form.successHeading).toBeVisible({ timeout: 20_000 });
  });
});
