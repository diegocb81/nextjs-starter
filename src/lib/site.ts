// Dados do site e da empresa em um único lugar.
// >>> Ao iniciar um projeto a partir do template, comece por este arquivo. <<<
// Todo o site (textos fixos, SEO, JSON-LD, política de privacidade, favicon)
// lê daqui, então trocar um dado é alterar uma linha.

export const SITE_URL = 'https://www.exemplo.com.br';

export const SITE_NAME = 'Nome da Empresa';

export const SITE_DESCRIPTION =
  'Descrição curta da empresa e do que ela oferece, usada no Google e nas prévias de compartilhamento.';

// Cores usadas em imagens geradas (favicon, og:image), que não leem o CSS.
// Mantenha iguais às variáveis --color-* de src/app/globals.css.
export const BRAND_COLORS = {
  fundo: '#1C1C1C',
  marca: '#D4AF37',
} as const;

// Formato internacional exigido pelo wa.me: país (55) + DDD + número
const WHATSAPP_NUMBER = '5511999999999';

export const CONTACT = {
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}`,
  // Formato internacional (E.164), usado nos dados estruturados para o Google
  phoneE164: `+${WHATSAPP_NUMBER}`,
  whatsappDisplay: '(11) 99999-9999',
  instagramUrl: 'https://instagram.com/empresa',
  instagramDisplay: '@empresa',
  email: 'contato@exemplo.com.br',
} as const;

// Endereço usado nos dados estruturados (JSON-LD). Cidade e estado bastam
// para negócios que atendem no local do cliente.
export const ADDRESS = {
  city: 'São Paulo',
  region: 'SP',
  country: 'BR',
} as const;

// Dados da Política de Privacidade (LGPD). O CNPJ fica vazio até ser
// confirmado com o cliente: enquanto vazio, a linha não aparece na página.
export const PRIVACY = {
  controller: SITE_NAME,
  cnpj: '',
  contactEmail: CONTACT.email,
  // Onde o banco de dados está hospedado (Supabase: Settings > General > Region)
  databaseLocation: 'São Paulo (Brasil)',
  // Atualize a cada mudança no texto da política
  updatedAt: '17 de novembro de 2026',
  retentionMonths: 12,
} as const;

// Monta o link de WhatsApp a partir de um telefone brasileiro digitado
// livremente, ex.: "(48) 99999-9999" -> https://wa.me/5548999999999
export function whatsappLinkFromPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits.startsWith('55') && digits.length > 11 ? digits : `55${digits}`}`;
}

// Iniciais do nome, usadas no favicon gerado (ex.: "Nome da Empresa" -> "NE").
// Palavras curtas como "da", "de", "e" são ignoradas.
export function siteInitials(name: string = SITE_NAME) {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
