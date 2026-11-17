import Link from 'next/link';
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { CONTACT } from '@/lib/site';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';

// Componente de servidor: o conteúdo chega pronto no HTML. Só as animações
// de entrada (Reveal) rodam no navegador; o brilho e a seta são CSS.

const contactLinkClass = "group flex flex-col items-center gap-4";
const iconCircleClass = "w-12 h-12 border border-marca/20 rounded-full flex items-center justify-center group-hover:border-marca transition-all duration-500 group-hover:scale-110";
const labelClass = "text-white/60 text-sm font-light tracking-wide";

export const Contact = () => {
  return (
    <section id="contato" className="py-24 bg-fundo border-t border-marca/10 px-8 scroll-mt-28">
      <div className="max-w-4xl mx-auto text-center">

        <Reveal duration={0.6} className="mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-marca mb-4">Contato</h2>
          <p className="text-white/60 uppercase tracking-[0.3em] text-[11px]">
            Escolha o canal de sua preferência
          </p>
        </Reveal>

        {/* Canais de contato em cascata */}
        <RevealGroup stagger={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <RevealItem y={15} duration={0.6}>
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className={contactLinkClass}>
              <div className={iconCircleClass}>
                <FaWhatsapp className="text-marca text-xl" aria-hidden="true" />
              </div>
              <span className={labelClass}>{CONTACT.whatsappDisplay}<span className="sr-only"> (WhatsApp, abre em nova aba)</span></span>
            </a>
          </RevealItem>

          <RevealItem y={15} duration={0.6}>
            <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className={contactLinkClass}>
              <div className={iconCircleClass}>
                <FaInstagram className="text-marca text-xl" aria-hidden="true" />
              </div>
              <span className={labelClass}>{CONTACT.instagramDisplay}<span className="sr-only"> (Instagram, abre em nova aba)</span></span>
            </a>
          </RevealItem>

          <RevealItem y={15} duration={0.6}>
            <a href={`mailto:${CONTACT.email}`} className={contactLinkClass}>
              <div className={iconCircleClass}>
                <FaEnvelope className="text-marca text-xl" aria-hidden="true" />
              </div>
              <span className={labelClass}>{CONTACT.email}</span>
            </a>
          </RevealItem>
        </RevealGroup>

        <Reveal from={{ scale: 0.9 }} duration={0.6} delay={0.5} className="relative inline-block">
          <div aria-hidden="true" className="absolute inset-0 bg-marca rounded-sm blur-md animate-aura" />

          {/* Leva ao formulário, que registra o contato no painel */}
          <Link
            href="/contato"
            className="relative z-10 inline-block bg-marca hover:bg-white text-fundo px-12 py-4 rounded-sm font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl active:scale-95"
          >
            <span className="flex items-center gap-3">
              Enviar Mensagem
              <span className="text-sm animate-nudge" aria-hidden="true">→</span>
            </span>
          </Link>
        </Reveal>

      </div>
    </section>
  );
};
