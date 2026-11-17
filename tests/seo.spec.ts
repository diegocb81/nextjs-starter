import { test, expect } from '@playwright/test';
import { CONTACT, SITE_NAME, SITE_URL } from '../src/lib/site';

// Garante que os ajustes de SEO não regridam sem ninguém perceber.
// Os valores esperados vêm de src/lib/site.ts: trocar os dados do cliente
// não exige alterar este teste.

test.describe('SEO', () => {
  test('robots.txt bloqueia o painel e aponta o sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    const body = await response.text();

    expect(response.ok()).toBe(true);
    expect(body).toContain('Disallow: /admin');
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test('sitemap.xml lista as páginas públicas e não o painel', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    const body = await response.text();

    expect(response.ok()).toBe(true);
    for (const path of ['', '/contato', '/privacidade']) {
      expect(body).toContain(`<loc>${SITE_URL}${path}</loc>`);
    }
    expect(body).not.toContain('/admin');
  });

  test('a home tem URL canônica e dados estruturados do negócio', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE_URL);

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    const business = JSON.parse(jsonLd ?? '{}');
    expect(business).toMatchObject({
      '@context': 'https://schema.org',
      name: SITE_NAME,
      telephone: CONTACT.phoneE164,
    });
  });

  test('o formulário tem título e URL canônica próprios', async ({ page }) => {
    await page.goto('/contato');

    await expect(page).toHaveTitle(`Contato | ${SITE_NAME}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}/contato`);
  });

  test('o painel pede aos buscadores para não ser indexado', async ({ page }) => {
    await page.goto('/admin/login');

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('o site público pode ser indexado', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
  });

  test('o favicon e a imagem de compartilhamento são servidos como imagem', async ({ page, request }) => {
    await page.goto('/');

    const icon = await page.locator('link[rel="icon"]').first().getAttribute('href');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

    for (const url of [icon!, new URL(ogImage!).pathname]) {
      const response = await request.get(url);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('image/png');
    }
  });
});
