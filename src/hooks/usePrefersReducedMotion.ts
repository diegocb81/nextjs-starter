'use client'

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

// Diz se o usuário pediu para "reduzir movimento" no sistema operacional.
//
// O servidor não tem como saber essa preferência. Se o componente lesse a
// preferência já no primeiro desenho, o HTML do servidor e o do navegador
// seriam diferentes e o React acusaria "Hydration failed". O
// useSyncExternalStore resolve isso: na hidratação usa o valor do servidor
// (false) e, logo em seguida, atualiza com o valor real do navegador.
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
