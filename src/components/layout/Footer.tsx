import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export const Footer = () => {
  return (
    <footer className="py-10 bg-fundo border-t border-marca/10 text-center">
      <div className="max-w-6xl mx-auto px-8">
        <p className="text-white/60 text-[11px] font-light">
          &copy; {new Date().getFullYear()} {SITE_NAME}.
          Todos os direitos reservados.
        </p>

        <p className="mt-3 text-[11px]">
          <Link href="/privacidade" className="text-white/60 underline underline-offset-4 hover:text-marca transition-colors">
            Política de Privacidade
          </Link>
        </p>

        <p className="mt-4 text-[11px] text-white/60 uppercase tracking-widest flex items-center justify-center gap-1.5">
          {/* Emojis decorativos ficam fora da leitura; o texto oculto dá a frase completa */}
          <span aria-hidden="true">Feito com ❤️ e 🧉 por</span>
          <span className="sr-only">Feito por</span>{' '}
          {/* Sem cursor de clique: não é um link, e parecer clicável engana o usuário */}
          <span className="text-marca font-medium">
            TS Design
          </span>
        </p>
      </div>
    </footer>
  );
};