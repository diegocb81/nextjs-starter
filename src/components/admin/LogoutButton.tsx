'use client'

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getSupabase } from '@/lib/supabase';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await getSupabase().auth.signOut();

    if (error) {
      toast.error('Não foi possível sair. Tente novamente.');
      setLoading(false);
      return;
    }

    router.push('/admin/login');
    // Descarta o que o Next guardou em cache da área logada
    router.refresh();
  };

  // Na tela de login ainda não há sessão para encerrar
  if (pathname === '/admin/login') return null;

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-[11px] uppercase tracking-widest text-white/60 hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  );
}
