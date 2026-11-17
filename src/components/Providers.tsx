'use client'

import { MotionConfig } from 'framer-motion';

// reducedMotion="user": quando a pessoa ativa "reduzir movimento" no sistema,
// o framer-motion desliga deslocamentos e escalas em todas as animações do
// site e mantém apenas transições suaves de opacidade.
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
