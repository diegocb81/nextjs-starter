import type { Locator, Page } from '@playwright/test';

// Page Object da página inicial (site público).
export class LandingPage {
  readonly nav: Locator;
  readonly menuButton: Locator;
  readonly mobileMenu: Locator;
  readonly whatsappButton: Locator;

  constructor(readonly page: Page) {
    this.nav = page.getByRole('navigation', { name: 'Navegação principal' });
    this.menuButton = page.getByRole('button', { name: /abrir menu|fechar menu/i });
    this.mobileMenu = page.locator('#menu-mobile');
    this.whatsappButton = page.getByRole('link', { name: /conversar pelo whatsapp/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  navLink(name: string) {
    return this.nav.getByRole('link', { name, exact: true });
  }
}
