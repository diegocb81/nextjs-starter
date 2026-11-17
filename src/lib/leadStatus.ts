// Status possíveis de um lead (contato recebido pelo site), em um único lugar:
// o painel, o serviço e os testes usam esta lista, então um status novo é
// adicionado só aqui (e no check da tabela em supabase/schema.sql) e o
// TypeScript aponta tudo o que precisa ser ajustado.
export const LEAD_STATUSES = ['Pendente', 'Em Contato', 'Finalizado'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const DEFAULT_LEAD_STATUS: LeadStatus = 'Pendente';

// Valores fora da lista (ex.: um dado antigo no banco) são tratados como o padrão
export function normalizeStatus(value: string | null | undefined): LeadStatus {
  return LEAD_STATUSES.includes(value as LeadStatus) ? (value as LeadStatus) : DEFAULT_LEAD_STATUS;
}
