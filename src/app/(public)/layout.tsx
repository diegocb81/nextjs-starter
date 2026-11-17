import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

// O "export default" é obrigatório para o Next.js reconhecer como layout
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <div className="grow">{children}</div>
      {/* Rodapé e WhatsApp ficam só no site público, fora do painel admin */}
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
