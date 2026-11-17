import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { hasTestUser, SKIP_WITHOUT_TEST_USER, testUser } from './support/env';

// A primeira chamada ao Supabase pode demorar (servidor de desenvolvimento
// compilando a página + projeto no plano gratuito "acordando").
const AUTH_TIMEOUT = 15000;

test.describe('Autenticação administrativa', () => {
  test.describe('com usuário de teste', () => {
    test.skip(!hasTestUser(), SKIP_WITHOUT_TEST_USER);

    test('entra com as credenciais corretas e acessa o painel', async ({ page }) => {
      const { email, password } = testUser();
      const login = new LoginPage(page);

      await login.goto();
      await login.login(email, password);

      // URL exata: /\/admin/ também casaria com /admin/login, e o teste
      // passaria mesmo com a senha errada (falso positivo).
      await expect(page).toHaveURL(/\/admin$/, { timeout: AUTH_TIMEOUT });
      // Título que só existe no painel logado
      await expect(page.getByRole('heading', { name: 'Contatos Recebidos' })).toBeVisible();
    });

    test('não entra com senha incorreta', async ({ page }) => {
      const { email } = testUser();
      const login = new LoginPage(page);

      await login.goto();
      await login.login(email, 'senha-incorreta-de-teste');

      await expect(login.invalidCredentials).toBeVisible({ timeout: AUTH_TIMEOUT });
      await expect(page).toHaveURL(/\/admin\/login$/);
    });
  });

  test('redireciona para o login quem acessa o painel sem sessão', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test('recusa um cookie de sessão forjado', async ({ page, context, baseURL }) => {
    // Cookie com o formato do Supabase, mas sem um token válido: o servidor
    // valida o token (getUser) e não pode aceitar só pela presença do cookie.
    await context.addCookies([
      { name: 'sb-forjado-auth-token', value: 'base64-eyJhY2Nlc3NfdG9rZW4iOiJ4In0', url: baseURL! },
    ]);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
