import type { NextConfig } from "next";

// Cabeçalhos de segurança aplicados a todas as respostas.
// A CSP (Content-Security-Policy) completa fica para uma etapa própria:
// exige tratar os estilos inline das animações e os scripts do Next.
const securityHeaders = [
  // Obriga HTTPS por 2 anos (o navegador ignora este cabeçalho em http://localhost)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Impede que o site seja embutido em <iframe> de terceiros (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Impede o navegador de "adivinhar" o tipo de um arquivo
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Não vaza o caminho completo da página ao navegar para outros sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // O site não usa câmera, microfone nem localização: bloqueia tudo
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Não anuncia a tecnologia usada no cabeçalho X-Powered-By
  poweredByHeader: false,
  images: {
    // AVIF é ~20% menor que WebP; o navegador que não o suporta recebe WebP
    formats: ['image/avif', 'image/webp'],
    // Para imagens externas (ex.: CDN do cliente), adicione remotePatterns aqui
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
