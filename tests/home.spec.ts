import { test, expect } from '@playwright/test';
import { LandingPage } from './pages/LandingPage';
import { CONTACT, SITE_NAME } from '../src/lib/site';

test.describe('Página inicial', () => {
  // Erros de hidratação (HTML do servidor diferente do navegador) não quebram
  // a página visivelmente, mas fazem o React redesenhar tudo. Este teste pegou
  // um caso real no projeto de origem (carrossel com "reduzir movimento").
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`carrega sem erros de JavaScript (movimento: ${reducedMotion})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });

      await page.emulateMedia({ reducedMotion });
      await page.goto('/');
      await page.locator('#contato').scrollIntoViewIfNeeded();
      await page.waitForLoadState('networkidle');

      expect(errors).toEqual([]);
    });
  }

  test('tem o nome do site no título', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(SITE_NAME);
  });

  test('os links do menu apontam para as seções da página', async ({ page }) => {
    const home = new LandingPage(page);
    await home.goto();

    for (const [label, id] of [
      ['Home', 'home'],
      ['Serviços', 'servicos'],
      ['Contato', 'contato'],
    ]) {
      await expect(home.navLink(label)).toHaveAttribute('href', `/#${id}`);
      // A seção de destino precisa existir, senão o link não leva a lugar nenhum
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test('o botão Fale Conosco da navbar leva ao formulário', async ({ page }) => {
    const home = new LandingPage(page);
    await home.goto();

    await home.nav.getByRole('link', { name: 'Fale Conosco' }).click();

    await expect(page).toHaveURL(/\/contato$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Fale Conosco' })).toBeVisible();
  });

  test('o botão de WhatsApp abre a conversa com o número configurado em nova aba', async ({ page }) => {
    const home = new LandingPage(page);
    await home.goto();

    await expect(home.whatsappButton).toHaveAttribute('href', CONTACT.whatsappUrl);
    await expect(home.whatsappButton).toHaveAttribute('target', '_blank');
    // noopener impede que o site aberto controle a aba de origem
    await expect(home.whatsappButton).toHaveAttribute('rel', /noopener/);
  });

  test('o menu mobile abre, navega e fecha com Esc', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const home = new LandingPage(page);
    await home.goto();

    await home.menuButton.click();
    await expect(home.mobileMenu).toBeVisible();
    await expect(home.menuButton).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(home.mobileMenu).toBeHidden();

    await home.menuButton.click();
    await home.mobileMenu.getByRole('link', { name: 'Contato' }).click();
    await expect(page).toHaveURL(/#contato$/);
    // O menu fecha ao navegar
    await expect(home.mobileMenu).toBeHidden();
  });

  test('o rodapé e o WhatsApp não aparecem no painel', async ({ page }) => {
    await page.goto('/admin/login');

    await expect(page.locator('footer')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /conversar pelo whatsapp/i })).toHaveCount(0);
  });

  test('mostra a página 404 para endereços inexistentes', async ({ page }) => {
    const response = await page.goto('/pagina-que-nao-existe');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await page.getByRole('link', { name: 'Voltar para a Home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
