// Assuntos do formulário de contato. Ajuste para o negócio do cliente
// (ex.: tipos de evento, serviços oferecidos).
//
// Ficam separados do schema (contato.ts) de propósito: a página do formulário
// importa esta lista já no carregamento, enquanto o Zod (bem mais pesado) só
// é baixado quando a pessoa envia o formulário.
export const ASSUNTOS = ['Orçamento', 'Dúvida', 'Parceria', 'Outro'] as const;

export type Assunto = (typeof ASSUNTOS)[number];
