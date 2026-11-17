'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { SITE_NAME } from '@/lib/site';

const links = [
  { href: '/#home', label: 'Home' },
  { href: '/#servicos', label: 'Serviços' },
  { href: '/#contato', label: 'Contato' },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  // Fecha o menu mobile com a tecla Esc (esperado por quem navega pelo teclado)
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      aria-label="Navegação principal"
      className="fixed top-0 w-full z-50 bg-fundo/60 backdrop-blur-lg border-b border-marca/10"
    >
      <div className="flex justify-between items-center px-6 md:px-8 py-5 md:py-6">
        {/* Logo */}
        <Link
          href="/#home"
          onClick={() => setOpen(false)}
          className="text-lg md:text-xl font-bold uppercase flex items-center tracking-tighter"
        >
          <span className="text-marca">{SITE_NAME}</span>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex space-x-12 text-[11px] uppercase tracking-[0.25em] text-white/70">
          {links.map((link) => (
            // pl-[0.25em]: o espaçamento entre letras (tracking) também entra depois
            // da última letra, deixando o contorno de foco torto. O recuo à
            // esquerda, do mesmo tamanho, centraliza o texto no contorno.
            <Link key={link.href} href={link.href} className="pl-[0.25em] hover:text-marca transition-colors duration-300">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Botão de contato com pulsação (desktop) */}
        <div className="hidden md:block">
          <ContactLink />
        </div>

        {/* Botão do menu mobile */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          className="md:hidden p-2 -mr-2 text-marca"
        >
          {open ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Menu Mobile */}
      {open && (
        <div
          id="menu-mobile"
          className="md:hidden flex flex-col items-center gap-6 px-6 pt-4 pb-8 bg-fundo/95 border-t border-marca/10 text-xs uppercase tracking-[0.25em] text-white/70"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-1 pl-[0.25em] hover:text-marca transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
          <ContactLink onClick={() => setOpen(false)} />
        </div>
      )}
    </motion.nav>
  );
};

// O link já tem aparência de botão: não se coloca <button> dentro de <a>,
// pois é HTML inválido e confunde teclado e leitores de tela.
function ContactLink({ onClick }: { onClick?: () => void }) {
  return (
    <span className="relative inline-block">
      {/* Aura Dourada Sutil */}
      <span aria-hidden="true" className="absolute inset-0 bg-marca blur-sm rounded-sm animate-aura-soft" />
      <Link
        href="/contato"
        onClick={onClick}
        className="relative z-10 inline-block text-[11px] uppercase tracking-widest border border-marca/50 px-6 py-2 text-marca bg-fundo hover:bg-marca hover:text-fundo transition-all duration-500 ease-in-out"
      >
        Fale Conosco
      </Link>
    </span>
  );
}
