import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Providers } from "@/components/Providers";

// Fontes servidas pelo próprio site (o next/font baixa no build): sem
// requisição ao Google no carregamento e mesma aparência em qualquer aparelho.
// display "swap" mostra o texto na hora com a fonte reserva e troca em seguida.
// Troque as fontes conforme a identidade do cliente, mantendo só os pesos usados.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  // Só o peso usado no site: cada peso extra é mais um arquivo a baixar
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  // Sem pré-carregamento: não disputa banda com o texto que define o LCP
  preload: false,
  variable: "--font-cormorant",
});

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Metadados padrão de SEO. Cada página pode sobrescrever título e descrição.
export const metadata: Metadata = {
  // Base para transformar caminhos relativos (ex.: /opengraph-image) em URLs
  // completas; sem ela, a prévia de compartilhamento aponta para localhost.
  metadataBase: new URL(SITE_URL),
  // "template": páginas internas definem só o próprio título, e o nome do
  // site é acrescentado (ex.: "Contato | Nome da Empresa")
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: SITE_NAME }],
  // A imagem de compartilhamento é gerada por src/app/opengraph-image.tsx
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`scroll-smooth ${serif.variable} ${sans.variable}`}>
      <body className="antialiased font-sans bg-fundo text-white flex flex-col min-h-screen">
        <a href="#content" className="skip-link">Pular para o conteúdo</a>
        <Providers>
          {/* tabIndex -1: permite que o link acima mova o foco para cá */}
          <div id="content" tabIndex={-1} className="grow outline-none">
            {children}
          </div>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
