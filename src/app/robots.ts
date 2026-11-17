import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Gera /robots.txt. Bloquear /admin aqui evita que buscadores rastreiem o
// painel; não é proteção de segurança (quem garante isso é o login), apenas
// mantém a área fora dos resultados de busca. O painel também envia "noindex".
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
