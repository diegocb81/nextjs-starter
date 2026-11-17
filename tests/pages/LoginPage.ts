import type { Locator, Page } from '@playwright/test';

// Page Object da tela de login do painel: concentra os seletores em um lugar,
// para que uma mudança no layout exija ajuste só aqui, não em cada teste.
export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly invalidCredentials: Locator;

  constructor(readonly page: Page) {
    this.email = page.getByLabel('Email', { exact: true });
    this.password = page.getByLabel('Senha', { exact: true });
    this.submitButton = page.getByRole('button', { name: /^entrar$/i });
    this.invalidCredentials = page.getByText('Credenciais inválidas');
  }

  async goto() {
    await this.page.goto('/admin/login');
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}
