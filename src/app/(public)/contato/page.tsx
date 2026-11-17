'use client'

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ASSUNTOS } from '@/lib/schemas/assuntos';
import { formatTelefone } from '@/lib/phone';
// O schema (Zod) e o serviço (cliente do Supabase) são importados só no envio,
// dentro do handleSubmit: são as partes mais pesadas da página e não são
// necessárias para exibi-la. Menos JavaScript no carregamento = página pronta antes.

// Ordem dos campos na tela: usada para focar o primeiro que estiver com erro
const FIELD_ORDER = ['nome', 'email', 'telefone', 'assunto', 'mensagem'] as const;

const labelClass = "text-white/80 font-bold text-xs uppercase tracking-widest";
const inputClass = "w-full bg-transparent border-b border-white/10 py-1.5 text-sm text-white focus:outline-none placeholder:text-white/60";
const underlineClass = "absolute bottom-0 left-0 w-0 h-0.5 bg-marca transition-all duration-500 group-focus-within:w-full";
const errorClass = "text-red-400 text-xs italic absolute -bottom-0.5 left-0";

export default function ContatoPage() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tel, setTel] = useState("");
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  // Ao trocar o formulário pela mensagem de sucesso, o foco iria se perder.
  // Movê-lo para o título faz o leitor de tela anunciar a confirmação.
  useEffect(() => {
    if (enviado) successHeadingRef.current?.focus();
  }, [enviado]);

  // Atributos de acessibilidade comuns a todos os campos:
  // aria-invalid avisa que o campo está com erro e aria-describedby liga o
  // campo à mensagem, para que ela seja lida junto com o rótulo.
  const fieldA11y = (name: string) => ({
    id: `contato-${name}`,
    'aria-required': true,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `contato-${name}-erro` : undefined,
  });

  const renderError = (name: string, className = errorClass) =>
    errors[name] && (
      <span id={`contato-${name}-erro`} className={className}>
        {errors[name]}
      </span>
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    const rawData = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      telefone: formData.get('telefone'),
      assunto: formData.get('assunto'),
      mensagem: formData.get('mensagem'),
      sobrenome: formData.get('sobrenome'),
    };

    const { contatoSchema } = await import('@/lib/schemas/contato');
    const result = contatoSchema.safeParse(rawData);
    if (!result.success) {
      const formattedErrors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        // Mantém só a primeira mensagem de cada campo
        if (!formattedErrors[field]) formattedErrors[field] = issue.message;
      });
      setErrors(formattedErrors);
      setLoading(false);

      // Leva o foco ao primeiro campo com erro: quem usa teclado ou leitor de
      // tela descobre de imediato o que precisa corrigir.
      const firstInvalid = FIELD_ORDER.find((name) => formattedErrors[name]);
      if (firstInvalid) {
        (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      }
      return;
    }

    // Honeypot preenchido: provavelmente um robô. Não enviamos nada.
    if (rawData.sobrenome) {
      setLoading(false);
      return;
    }

    try {
      const { nome, email, telefone, assunto, mensagem } = result.data;
      const { leadService } = await import('@/services/leadService');
      await leadService.create({ nome, email, telefone, assunto, mensagem });

      // Aviso por e-mail para a empresa. Se falhar, o contato já está salvo
      // no painel, então a confirmação ao visitante é mantida.
      await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      setEnviado(true);
      toast.success("Mensagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      toast.error("Ocorreu um erro ao enviar sua mensagem.");
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <main className="h-screen flex flex-col items-center justify-center bg-fundo text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h1 ref={successHeadingRef} tabIndex={-1} className="text-3xl text-marca font-serif mb-2 outline-none">
            Mensagem Recebida!
          </h1>
          <p className="text-white/60 mb-8 text-sm font-light italic">Em breve entraremos em contato.</p>
          <Link
            href="/"
            className="inline-block border border-marca/30 text-marca px-8 py-3 text-[11px] uppercase tracking-widest font-bold hover:bg-marca/10 transition-all"
          >
            Voltar para Home
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center relative overflow-hidden px-8 pt-28 pb-8">
      <div className="relative z-10 max-w-4xl w-full flex flex-col">
        <header className="mb-8">
          {/* Só desliza, sem surgir do transparente: este texto é o elemento do
              LCP da página, e opacity 0 atrasava a medição em ~3s no 4G simulado */}
          <motion.div initial={{ y: -10 }} animate={{ y: 0 }}>
            <h1 className="text-4xl font-serif text-marca mb-2">Fale Conosco</h1>
            <p className="text-white/60 uppercase tracking-[0.3em] text-xs">Respondemos pelo WhatsApp ou e-mail</p>
            <p className="text-white/60 text-xs mt-4">Todos os campos são obrigatórios.</p>
          </motion.div>
        </header>

        {/* noValidate: a validação é feita pelo Zod, com mensagens em português
            e anunciadas a leitores de tela (em vez dos balões do navegador) */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 lg:gap-y-6">
          {/* Honeypot anti-spam: invisível para pessoas e ignorado por leitores de tela */}
          <input name="sobrenome" type="text" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          <div className="flex flex-col gap-1 group relative pb-4">
            <label htmlFor="contato-nome" className={labelClass}>Nome Completo</label>
            <div className="relative">
              <input name="nome" type="text" autoComplete="name" placeholder="Ex: Maria Joaquina" className={inputClass} {...fieldA11y('nome')} />
              <div className={underlineClass} />
            </div>
            {renderError('nome')}
          </div>

          <div className="flex flex-col gap-1 group relative pb-4">
            <label htmlFor="contato-email" className={labelClass}>E-mail</label>
            <div className="relative">
              {/* type="email" abre o teclado com @ no celular; autoComplete permite o preenchimento automático */}
              <input name="email" type="email" autoComplete="email" placeholder="seu@email.com" className={inputClass} {...fieldA11y('email')} />
              <div className={underlineClass} />
            </div>
            {renderError('email')}
          </div>

          <div className="flex flex-col gap-1 group relative pb-4">
            <label htmlFor="contato-telefone" className={labelClass}>WhatsApp</label>
            <div className="relative">
              <input
                name="telefone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={tel}
                onChange={(e) => setTel(formatTelefone(e.target.value))}
                placeholder="(11) 99999-9999"
                className={inputClass}
                {...fieldA11y('telefone')}
              />
              <div className={underlineClass} />
            </div>
            {renderError('telefone')}
          </div>

          <div className="flex flex-col gap-1 group relative pb-4">
            <label htmlFor="contato-assunto" className={labelClass}>Assunto</label>
            <div className="relative">
              <select
                name="assunto"
                defaultValue={ASSUNTOS[0]}
                className="w-full bg-transparent border-b border-white/10 py-1.5 text-sm text-white focus:outline-none cursor-pointer appearance-none pr-8"
                {...fieldA11y('assunto')}
              >
                {ASSUNTOS.map((assunto) => (
                  <option key={assunto} className="bg-fundo" value={assunto}>{assunto}</option>
                ))}
              </select>
              <div className="absolute right-0 bottom-2.5 pointer-events-none">
                <svg aria-hidden="true" width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-marca/50 group-focus-within:text-marca transition-colors">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={underlineClass} />
            </div>
            {renderError('assunto')}
          </div>

          <div className="flex flex-col gap-1 group md:col-span-2 relative pb-6">
            <label htmlFor="contato-mensagem" className={labelClass}>Mensagem</label>
            <div className="relative">
              <textarea name="mensagem" rows={3} className={`${inputClass} resize-none`} placeholder="Conte-nos brevemente..." {...fieldA11y('mensagem')}></textarea>
              <div className={underlineClass} />
            </div>
            {renderError('mensagem', "text-red-400 text-xs italic absolute bottom-0.5 left-0")}
          </div>

          <div className="md:col-span-2 mt-2">
            <button
              disabled={loading}
              type="submit"
              className={`w-full py-4 font-bold uppercase tracking-[0.3em] text-xs transition-all duration-500 flex items-center justify-center gap-3 ${
                loading
                ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed border border-white/5'
                : 'bg-marca text-fundo hover:bg-white hover:tracking-[0.4em]'
              }`}
            >
              {loading ? (
                <>
                  <div aria-hidden="true" className="w-3 h-3 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                  <span className="animate-pulse">Enviando...</span>
                </>
              ) : 'Enviar Mensagem'}
            </button>

            {/* Aviso no momento da coleta (LGPD). Sem checkbox de consentimento:
                a base legal é o pedido feito pelo próprio titular (art. 7º, V) */}
            <p className="mt-4 text-center text-xs text-white/60 leading-relaxed">
              Usamos seus dados apenas para responder à sua mensagem.{' '}
              <Link href="/privacidade" className="text-marca underline underline-offset-4 hover:text-white transition-colors">
                Saiba mais na Política de Privacidade
              </Link>
              .
            </p>
          </div>

          {/* Região "viva": o leitor de tela anuncia o resumo quando surgem erros */}
          <p role="alert" className="sr-only">
            {Object.keys(errors).length > 0 &&
              `O formulário tem ${Object.keys(errors).length} campo(s) com erro. Corrija os campos destacados.`}
          </p>
        </form>
      </div>
    </main>
  );
}
