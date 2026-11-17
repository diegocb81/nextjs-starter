import type { Metadata } from "next";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { SITE_NAME } from "@/lib/site";

// O painel nunca deve aparecer em buscadores, mesmo que algum link para ele
// vaze. Complementa o bloqueio do robots.txt.
export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Aqui poderíamos ter uma Sidebar no futuro */}
      <nav className="border-b border-white/5 bg-fundo/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-marca rounded-full animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-marca">
              {SITE_NAME} | Painel Administrativo
            </span>
          </div>
          <LogoutButton />
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}