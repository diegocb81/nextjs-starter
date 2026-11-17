'use client'

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { SITE_NAME } from '@/lib/site';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Credenciais inválidas");
      setLoading(false);
    } else {
      toast.success("Login realizado com sucesso!");
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fundo p-4">
      <div className="w-full max-w-md space-y-8 bg-fundo/50 p-8 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-marca">{SITE_NAME}</h1>
          <p className="text-white/60 text-sm mt-2">Acesso restrito ao Dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            {/* htmlFor + id ligam o rótulo ao campo: o leitor de tela anuncia
                "Email" ao focar, e clicar no rótulo foca o campo */}
            <label htmlFor="login-email" className="block text-[11px] uppercase tracking-widest text-marca font-bold mb-2">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-marca transition-colors"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="login-senha" className="block text-[11px] uppercase tracking-widest text-marca font-bold mb-2">Senha</label>
            <input
              id="login-senha"
              type="password"
              autoComplete="current-password"
              required
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-marca transition-colors"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-marca text-fundo font-bold uppercase tracking-widest text-sm py-3 rounded hover:bg-marca/90 transition-all active:scale-[0.98]"
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}