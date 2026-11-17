import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Verificação automática de acessibilidade (WCAG 2.1 nível A e AA) com o axe.
// Ferramentas automáticas pegam só parte dos problemas (contraste, nomes
// acessíveis, rótulos, semântica); navegação por teclado e leitor de tela
// continuam exigindo teste manual.
// Toda página nova deve entrar na lista PAGES abaixo.

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const PAGES = [
  { name: 'página inicial', path: '/' },
  { name: 'contato', path: '/contato' },
  { name: 'política de privacidade', path: '/privacidade' },
  { name: 'login do painel', path: '/admin/login' },
];

// As animações de entrada mudam a opacidade do texto. Medir o contraste antes
// de terminarem gera falso alarme.
const ANIMATION_SETTLE_MS = 3000;

// As seções aparecem com animação ao entrar na tela. Rolamos a página inteira
// para que todo o conteúdo esteja visível antes da análise.
async function revealWholePage(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(ANIMATION_SETTLE_MS);
}

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  // Resumo legível no relatório em caso de falha
  const summary = results.violations.map((v) => ({
    regra: v.id,
    impacto: v.impact,
    descricao: v.help,
    elementos: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
  }));

  expect(summary).toEqual([]);
}

test.describe('Acessibilidade (axe, WCAG AA)', () => {
  // Sem animações contínuas a análise de contraste fica estável
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  for (const viewport of [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'mobile', width: 390, height: 800 },
  ]) {
    test.describe(viewport.name, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const { name, path } of PAGES) {
        test(name, async ({ page }) => {
          await page.goto(path);
          await revealWholePage(page);
          await expectNoViolations(page);
        });
      }

      test('formulário de contato com erros de validação', async ({ page }) => {
        await page.goto('/contato');
        await page.getByRole('button', { name: /enviar mensagem/i }).click();
        await expect(page.getByText(/pelo menos 3 caracteres/i)).toBeVisible();
        await page.waitForTimeout(ANIMATION_SETTLE_MS);
        await expectNoViolations(page);
      });
    });
  }

  test('menu mobile aberto', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.waitForTimeout(ANIMATION_SETTLE_MS);
    await expectNoViolations(page);
  });
});
