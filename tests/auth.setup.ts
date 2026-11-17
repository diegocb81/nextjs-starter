import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { hasTestUser, SKIP_WITHOUT_TEST_USER, testUser } from './support/env';
import { ADMIN_STORAGE_STATE } from './support/paths';

// Faz o login real uma única vez e salva os cookies da sessão.
// Os testes do painel (projeto "admin") reaproveitam esse arquivo: ficam mais
// rápidos e não esbarram no limite de logins por minuto do Supabase.
setup('autenticar como admin', async ({ page }) => {
  setup.skip(!hasTestUser(), SKIP_WITHOUT_TEST_USER);

  const { email, password } = testUser();
  const login = new LoginPage(page);

  await login.goto();
  await login.login(email, password);

  // Projeto do plano gratuito pode demorar a "acordar" na primeira chamada
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20_000 });
  await expect(page.getByRole('heading', { name: 'Contatos Recebidos' })).toBeVisible();

  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
