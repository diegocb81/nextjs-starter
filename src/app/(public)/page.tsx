import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Contact } from "@/components/sections/Contact";
import { ADDRESS, CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  // URL canônica: diz ao Google qual é o endereço "oficial" desta página,
  // evitando que variações (com parâmetros, http, sem www) virem duplicatas.
  alternates: { canonical: "/" },
};

// Dados estruturados (JSON-LD, padrão schema.org): descrevem o negócio em um
// formato que o Google entende, ajudando a exibi-lo em buscas locais.
// Troque "LocalBusiness" por um tipo mais específico quando houver
// (ex.: FoodEstablishment, ProfessionalService): https://schema.org/LocalBusiness
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  telephone: CONTACT.phoneE164,
  email: CONTACT.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: ADDRESS.city,
    addressRegion: ADDRESS.region,
    addressCountry: ADDRESS.country,
  },
  areaServed: { "@type": "City", name: ADDRESS.city },
  sameAs: [CONTACT.instagramUrl],
};

export default function HomePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        // Escapa "<" para que nenhum texto dos dados possa fechar a tag <script>
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <Services />
      <Contact />
    </main>
  );
}
