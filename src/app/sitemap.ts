import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Gera /sitemap.xml: a lista de páginas públicas que os buscadores devem
// indexar. O painel (/admin) fica de fora de propósito.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/contato`, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
