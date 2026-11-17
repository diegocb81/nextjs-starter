'use client'

import { motion, type Variants } from 'framer-motion';

// Componentes de animação de entrada ("aparece ao rolar até ele").
// Ficam isolados aqui para que as seções em volta possam ser componentes de
// servidor: o conteúdo chega pronto no HTML e só este invólucro usa JavaScript.

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

type From = { x?: number; y?: number; scale?: number };

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Posição de onde o elemento parte (o destino é sempre a posição normal) */
  from?: From;
  delay?: number;
  duration?: number;
};

/** Elemento único que surge ao entrar na tela. */
export function Reveal({ children, className, from = { y: 20 }, delay = 0, duration = 0.8 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

type RevealGroupProps = {
  children: React.ReactNode;
  className?: string;
  /** Intervalo entre a entrada de cada item, em segundos */
  stagger?: number;
  delayChildren?: number;
  /** Fração do grupo que precisa estar visível para disparar (0 a 1) */
  amount?: number;
};

const groupVariants = (stagger: number, delayChildren: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Grupo cujos itens (RevealItem) entram em cascata, um após o outro. */
export function RevealGroup({ children, className, stagger = 0.2, delayChildren = 0, amount }: RevealGroupProps) {
  return (
    <motion.div
      className={className}
      variants={groupVariants(stagger, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

type RevealItemProps = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
};

/** Item de um RevealGroup. */
export function RevealItem({ children, className, y = 30, duration = 0.8 }: RevealItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}
