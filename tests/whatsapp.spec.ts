import { test, expect, type Page } from '@playwright/test';

// O botão flutuante do WhatsApp não pode atrapalhar o uso no celular:
// nem cobrir o fim da página, nem ficar sobre o campo que a pessoa está
// preenchendo (teclado virtual aberto).

const MOBILE = { width: 390, height: 800 };
const DESKTOP = { width: 1280, height: 800 };

const whatsappButton = (page: Page) =>
  page.getByRole('link', { name: /conversar pelo whatsapp/i });

test.describe('Botão do WhatsApp', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test.describe('celular', () => {
    test.use({ viewport: MOBILE });

    for (const path of ['/', '/contato', '/privacidade']) {
      test(`não cobre o fim da página ${path}`, async ({ page }) => {
        await page.goto(path);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const button = await whatsappButton(page).boundingBox();
        // Base da última linha de texto do rodapé, medida pelo texto em si
        // (um parágrafo centralizado ocupa a largura toda, mas o texto não)
        const lastTextBottom = await page.evaluate(() => {
          const footer = document.querySelector('footer')!;
          const range = document.createRange();
          range.selectNodeContents(footer);
          return Math.max(...[...range.getClientRects()].map((r) => r.bottom));
        });

        expect(button).not.toBeNull();
        expect(lastTextBottom).toBeLessThanOrEqual(button!.y);
      });
    }

    test('some enquanto um campo do formulário está em foco e volta depois', async ({ page }) => {
      await page.goto('/contato');
      await expect(whatsappButton(page)).toBeVisible();

      await page.getByLabel('Nome Completo').focus();
      await expect(whatsappButton(page)).toBeHidden();

      await page.getByLabel('Nome Completo').blur();
      await expect(whatsappButton(page)).toBeVisible();
    });
  });

  test('no desktop continua visível com um campo em foco', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/contato');
    await page.getByLabel('Nome Completo').focus();
    await expect(whatsappButton(page)).toBeVisible();
  });
});
