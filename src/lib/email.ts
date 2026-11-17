// Os campos vêm do visitante: sem escapar, ele poderia injetar HTML
// (links falsos, imagens rastreadoras) no e-mail que a empresa recebe.
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Quebras de linha no assunto permitiriam injetar cabeçalhos de e-mail
export function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}
