import { z } from 'zod';
import { ASSUNTOS } from './assuntos';

export { ASSUNTOS };

// Validação usada no navegador (mensagens no formulário) e no servidor
// (rota /api/contato): a mesma regra nos dois lados.
export const contatoSchema = z.object({
  nome: z.string().trim().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),

  // Aceita qualquer domínio válido (.org, .net, .gov.br, .edu.br...).
  // O trim evita reprovar um e-mail correto por causa de um espaço colado junto.
  email: z.string().trim().email({ message: "Digite um e-mail válido" }),

  // Validação baseada na quantidade de números reais (DDD + 8 ou 9 dígitos)
  telefone: z.string().refine((val) => {
    const apenasNumeros = val.replace(/\D/g, "");
    return apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
  }, { message: "WhatsApp inválido. Informe DDD + número (8 ou 9 dígitos)" }),

  assunto: z.enum(ASSUNTOS, { message: "Selecione um assunto" }),
  mensagem: z.string().trim().min(10, { message: "Conte-nos um pouco mais (mínimo 10 caracteres)" }),
  sobrenome: z.string().optional(), // Honeypot: campo invisível que só robôs preenchem
});

export type ContatoData = z.infer<typeof contatoSchema>;
