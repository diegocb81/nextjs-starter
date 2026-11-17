import Link from 'next/link';
import { Compass } from 'lucide-react';
import { SITE_NAME } from '@/lib/site';

// Página 404 (componente de servidor: não precisa de JavaScript no navegador)
export default function NotFound() {
  return (
    <main className="min-h-screen w-full bg-fundo flex flex-col items-center justify-center px-8 text-center">
      <Compass aria-hidden="true" className="w-16 h-16 text-marca mb-8" />

      <h1 className="text-6xl md:text-8xl font-serif text-marca mb-4">404</h1>
      <h2 className="text-xl md:text-2xl text-white font-light uppercase tracking-[0.3em] mb-6">
        Página não encontrada
      </h2>
      <p className="text-white/60 max-w-md mx-auto mb-10 leading-relaxed">
        O endereço que você procura não existe ou foi movido.
      </p>

      <Link
        href="/"
        className="inline-block border border-marca text-marca px-10 py-4 rounded-sm hover:bg-marca hover:text-fundo transition-all duration-500 uppercase tracking-widest text-xs font-bold"
      >
        Voltar para a Home
      </Link>

      <p aria-hidden="true" className="absolute bottom-10 text-marca/40 font-serif italic text-sm">{SITE_NAME}</p>
    </main>
  );
}
