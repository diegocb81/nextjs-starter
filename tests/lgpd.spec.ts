import { test, expect } from '@playwright/test';
import { PRIVACY, SITE_NAME } from '../src/lib/site';

// Garante que as informações exigidas pela LGPD continuem acessíveis.

test.describe('LGPD', () => {
  test('a política de privacidade cobre os temas obrigatórios', async ({ page }) => {
    await page.goto('/privacidade');

    await expect(page).toHaveTitle(`Política de Privacidade | ${SITE_NAME}`);
    await expect(page.getByRole('heading', { level: 1, name: 'Política de Privacidade' })).toBeVisible();

    for (const tema of [
      /responsável pelos seus dados/,
      /quais dados coletamos/i,
      /para que usamos/i,
      /base legal/i,
      /com quem compartilhamos/i,
      /por quanto tempo guardamos/i,
      /seus direitos/i,
    ]) {
      await expect(page.getByRole('heading', { level: 2, name: tema })).toBeVisible();
    }

    // Canal para o titular exercer os direitos
    await expect(page.getByRole('link', { name: PRIVACY.contactEmail }).first())
      .toHaveAttribute('href', `mailto:${PRIVACY.contactEmail}`);
  });

  test('sem CNPJ configurado, a política não mostra texto provisório', async ({ page }) => {
    test.skip(Boolean(PRIVACY.cnpj), 'CNPJ já configurado');
    await page.goto('/privacidade');

    await expect(page.getByText(/CNPJ/)).toHaveCount(0);
  });

  test('o rodapé leva à política em qualquer página pública', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Política de Privacidade' }).click();

    await expect(page).toHaveURL(/\/privacidade$/);
  });

  test('o formulário informa o uso dos dados no momento da coleta', async ({ page }) => {
    await page.goto('/contato');

    await expect(page.getByText('Usamos seus dados apenas para responder à sua mensagem.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Saiba mais na Política de Privacidade' }))
      .toHaveAttribute('href', '/privacidade');
  });
});
