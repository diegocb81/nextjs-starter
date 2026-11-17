'use client'

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

// Variantes para a entrada das letras do título, uma após a outra
const sentenceVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.2,
    },
  },
};

// As letras já nascem visíveis e apenas sobem. Surgir do transparente
// (opacity 0) atrasaria o momento em que o Google considera a página
// carregada (LCP): o texto só "existiria" depois que a animação terminasse.
const letterVariants: Variants = {
  hidden: { y: '0.3em' },
  visible: {
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export const Hero = () => {
  const line1 = "Título principal";
  const line2 = "do seu cliente.";

  return (
    <section id="home" className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 overflow-hidden bg-fundo">
      {/* Gradiente radial de fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-marca/5 via-transparent to-transparent" />

      <div className="relative z-10 text-center px-4">
        <motion.span
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-marca-clara/80 text-xs uppercase tracking-[0.5em] mb-4 block"
        >
          Frase de apoio
        </motion.span>

        <motion.h1
          variants={sentenceVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-8xl font-serif text-marca mb-8 leading-tight"
        >
          {/* O título animado tem uma <span> por letra, e leitores de tela o
              soletrariam. Eles recebem a frase inteira aqui, e as letras
              animadas ficam ocultas (aria-hidden). */}
          <span className="sr-only">{line1} {line2}</span>
          <span className="block" aria-hidden="true">
            {line1.split("").map((char, index) => (
              <motion.span key={`l1-${index}`} variants={letterVariants} className="inline-block">
                {char === " " ? " " : char}
              </motion.span>
            ))}
          </span>
          <span className="italic block" aria-hidden="true">
            {line2.split("").map((char, index) => (
              <motion.span key={`l2-${index}`} variants={letterVariants} className="inline-block">
                {char === " " ? " " : char}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        {/* Maior bloco de texto da primeira tela, provável elemento do LCP:
            precisa estar visível desde o início, sem esperar animação. */}
        <motion.p
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-10 font-light leading-relaxed tracking-wide"
        >
          Uma ou duas frases sobre o que a empresa faz, para quem e por que ela é a escolha certa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative inline-block"
        >
          <div aria-hidden="true" className="absolute inset-0 bg-marca rounded-sm blur-md animate-aura" />

          {/* Link com aparência de botão (sem <button> dentro de <a>, que é HTML inválido) */}
          <Link
            href="/contato"
            className="relative z-10 inline-block bg-marca hover:bg-white text-fundo px-10 py-4 rounded-sm font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl active:scale-95"
          >
            <span className="flex items-center gap-3">
              Fale Conosco
              <span className="text-sm animate-nudge" aria-hidden="true">→</span>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
