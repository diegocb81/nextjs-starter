import { getSupabase } from '../lib/supabase';
import { DEFAULT_LEAD_STATUS, type LeadStatus } from '../lib/leadStatus';

// Tabela "leads" no Supabase. O SQL de criação, com as regras de acesso
// (RLS), está em supabase/schema.sql.

export interface LeadData {
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
  status?: string;
}

export interface Lead extends LeadData {
  id: string;
  created_at: string;
}

// Com RLS ativo, uma operação sem permissão não gera erro: o banco apenas
// ignora a linha. Pedimos de volta as linhas afetadas e, se nenhuma voltar,
// tratamos como falha, para o painel nunca exibir um sucesso que não houve.
function ensureAffected(rows: unknown[] | null, action: string) {
  if (!rows || rows.length === 0) {
    throw new Error(`Nenhum lead foi ${action}: sem permissão ou registro inexistente.`);
  }
}

export const leadService = {
  // Lista todos os leads, do mais recente para o mais antigo (painel)
  async getAll(): Promise<Lead[]> {
    const { data, error } = await getSupabase()
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar leads:', error.message);
      throw error;
    }

    return data as Lead[];
  },

  // Cria um lead (formulário público).
  // Sem .select(): o visitante anônimo só tem permissão de INSERT (RLS),
  // então pedir a linha de volta faria o banco recusar a operação.
  async create(data: LeadData): Promise<void> {
    const { error } = await getSupabase()
      .from('leads')
      .insert([{ ...data, status: DEFAULT_LEAD_STATUS }]);

    if (error) throw error;
  },

  // Atualiza apenas o status de um lead específico
  async updateStatus(id: string, status: LeadStatus): Promise<void> {
    const { data, error } = await getSupabase()
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select('id');

    if (error) {
      console.error('Erro ao atualizar status:', error.message);
      throw error;
    }
    ensureAffected(data, 'atualizado');
  },

  // Exclui definitivamente um lead (ex.: a pedido do titular, conforme a LGPD)
  async remove(id: string): Promise<void> {
    const { data, error } = await getSupabase()
      .from('leads')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      console.error('Erro ao excluir lead:', error.message);
      throw error;
    }
    ensureAffected(data, 'excluído');
  },
};
