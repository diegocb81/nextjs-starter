'use client'

import { Fragment, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { leadService, type Lead } from '@/services/leadService';
import { whatsappLinkFromPhone } from '@/lib/site';
import { LEAD_STATUSES, normalizeStatus, type LeadStatus } from '@/lib/leadStatus';

const COLUMNS = 6;

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await leadService.getAll();
        setLeads(data || []);
      } catch (error) {
        toast.error("Erro ao sincronizar dados com o servidor.");
        console.error("Erro ao carregar leads:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  // Atualização otimista: muda na tela na hora e desfaz se o banco recusar
  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    const oldLeads = [...leads];

    try {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      await leadService.updateStatus(id, newStatus);
      toast.success(`Lead atualizado para: ${newStatus}`);
    } catch {
      setLeads(oldLeads);
      toast.error("Falha ao salvar alteração. Tente novamente.");
    }
  };

  // Exclusão definitiva (ex.: pedido de exclusão do titular, LGPD). Ao
  // contrário da troca de status, não é otimista: a linha só sai da tela
  // depois que o banco confirma, pois a ação não tem volta.
  const handleDelete = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Excluir definitivamente o contato de ${lead.nome}?\n\nEsta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeletingId(lead.id);
    try {
      await leadService.remove(lead.id);
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      toast.success(`Contato de ${lead.nome} excluído.`);
    } catch {
      toast.error("Não foi possível excluir o contato. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusStyles = (status: LeadStatus) => {
    switch (status) {
      case 'Finalizado': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'Em Contato': return 'text-sky-400 border-sky-500/20 bg-sky-500/5';
      default: return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
    }
  };

  const th = "p-4 text-[11px] uppercase tracking-[0.2em] text-marca/80 font-bold";

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-marca">Contatos Recebidos</h1>
          <p className="text-white/60 text-sm italic mt-1">
            {leads.length} contatos encontrados
          </p>
        </div>
      </header>

      {/* overflow-x-auto + largura mínima: no celular a tabela rola para o lado
          em vez de ter as colunas cortadas */}
      <div className="overflow-x-auto border border-white/5 rounded-xl bg-fundo/40 backdrop-blur-sm">
        <table className="w-full min-w-[760px] text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/3">
              <th scope="col" className={th}>Data</th>
              <th scope="col" className={th}>Cliente</th>
              <th scope="col" className={th}>Assunto</th>
              <th scope="col" className={th}>WhatsApp</th>
              <th scope="col" className={th}>Mensagem</th>
              <th scope="col" className={`${th} text-right`}>Ação / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={COLUMNS} className="p-20 text-center">
                  <div role="status" className="flex flex-col items-center gap-3">
                    <div className="w-5 h-5 border-2 border-marca border-t-transparent rounded-full animate-spin" />
                    <span className="text-white/60 italic text-sm">Sincronizando...</span>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS} className="p-20 text-center text-white/60 italic text-sm">
                  Nenhum contato recebido ainda.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const expanded = expandedId === lead.id;
                const detailsId = `mensagem-${lead.id}`;
                const status = normalizeStatus(lead.status);

                return (
                  <Fragment key={lead.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-white/2 transition-colors group"
                    >
                      <td className="p-4 text-[11px] font-mono text-white/60">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white/90 group-hover:text-marca transition-colors">{lead.nome}</span>
                          <a href={`mailto:${lead.email}`} className="text-[11px] text-white/60 tracking-tight hover:text-marca transition-colors">
                            {lead.email}
                          </a>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-white/60">
                        <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase text-[11px] tracking-tighter">
                          {lead.assunto}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium whitespace-nowrap">
                        <a
                          href={whatsappLinkFromPhone(lead.telefone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-marca underline underline-offset-4 decoration-white/20 transition-colors"
                        >
                          {lead.telefone}
                        </a>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : lead.id)}
                          aria-expanded={expanded}
                          aria-controls={detailsId}
                          className="text-[11px] uppercase tracking-[0.15em] font-bold text-marca/80 hover:text-marca border border-marca/20 hover:border-marca/50 rounded px-3 py-1.5 transition-colors"
                        >
                          {expanded ? 'Ocultar' : 'Ver'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-3">
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            aria-label={`Status do contato de ${lead.nome}`}
                            className={`
                              text-[11px] uppercase tracking-[0.15em] font-bold px-3 py-1.5 rounded border
                              bg-transparent cursor-pointer transition-all duration-300
                              hover:scale-105 active:scale-95
                              ${getStatusStyles(status)}
                            `}
                          >
                            {LEAD_STATUSES.map((option) => (
                              <option key={option} value={option} className="bg-[#1a1a1a] text-white">{option}</option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDelete(lead)}
                            disabled={deletingId === lead.id}
                            aria-label={`Excluir contato de ${lead.nome}`}
                            title="Excluir contato"
                            className="p-2 rounded border border-white/10 text-white/60 hover:text-red-400 hover:border-red-400/40 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {expanded && (
                      <tr id={detailsId} className="bg-white/2">
                        <td colSpan={COLUMNS} className="px-4 pb-5 pt-1">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-marca/80 font-bold mb-2">
                            Mensagem
                          </p>
                          {/* whitespace-pre-wrap preserva as quebras de linha digitadas pelo cliente */}
                          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap break-words max-w-3xl">
                            {lead.mensagem}
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
