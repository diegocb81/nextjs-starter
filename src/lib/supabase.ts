import { createBrowserClient } from '@supabase/ssr';

// Cliente do Supabase para o navegador, criado só na primeira vez que é usado.
// Criá-lo no topo do módulo faria o build quebrar em ambientes sem as
// variáveis (ex.: job do Lighthouse no CI ou um projeto recém-criado do
// template), porque o Next carrega este arquivo ao pré-renderizar as páginas.
let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ver .env.example).');
    }
    client = createBrowserClient(url, anonKey);
  }
  return client;
}
