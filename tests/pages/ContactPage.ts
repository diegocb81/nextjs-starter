import type { Locator, Page } from '@playwright/test';
import type { Assunto } from '../../src/lib/schemas/assuntos';

export type ContactForm = {
  nome: string;
  email: string;
  telefone: string;
  assunto: Assunto;
  mensagem: string;
};

// Page Object do formulário de contato. Os campos são localizados pelo
// rótulo, como um usuário (ou leitor de tela) os encontraria. "exact" evita
// confusão com outros elementos, ex.: o botão "Conversar pelo WhatsApp".
export class ContactPage {
  readonly nome: Locator;
  readonly email: Locator;
  readonly telefone: Locator;
  readonly assunto: Locator;
  readonly mensagem: Locator;
  readonly submitButton: Locator;
  readonly successHeading: Locator;

  constructor(readonly page: Page) {
    this.nome = page.getByLabel('Nome Completo', { exact: true });
    this.email = page.getByLabel('E-mail', { exact: true });
    this.telefone = page.getByLabel('WhatsApp', { exact: true });
    this.assunto = page.getByLabel('Assunto', { exact: true });
    this.mensagem = page.getByLabel('Mensagem', { exact: true });
    this.submitButton = page.getByRole('button', { name: /enviar mensagem/i });
    this.successHeading = page.getByRole('heading', { name: 'Mensagem Recebida!' });
  }

  async goto() {
    await this.page.goto('/contato');
  }

  async fill(data: ContactForm) {
    await this.nome.fill(data.nome);
    await this.email.fill(data.email);
    await this.telefone.fill(data.telefone);
    await this.assunto.selectOption(data.assunto);
    await this.mensagem.fill(data.mensagem);
  }

  async submit() {
    await this.submitButton.click();
  }
}
