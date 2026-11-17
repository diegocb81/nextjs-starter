-- Estrutura do banco para o template (Supabase / PostgreSQL).
-- Rode uma vez no SQL Editor do projeto novo: Supabase > SQL Editor > New query.
--
-- Regras de acesso (RLS = Row Level Security):
--   anon (visitante do site) .... só INSERT: envia o formulário, mas não lê nada
--   authenticated (equipe) ...... SELECT, UPDATE e DELETE no painel
-- Desligue também o cadastro público de usuários:
--   Authentication > Sign In / Providers > "Allow new users to sign up" = off
-- e crie as contas da equipe em Authentication > Users > Add user
-- (marcando "Auto Confirm User").

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  nome        text not null check (char_length(nome) between 3 and 120),
  email       text not null check (char_length(email) <= 254),
  telefone    text not null check (char_length(telefone) <= 20),
  assunto     text not null check (char_length(assunto) <= 60),
  mensagem    text not null check (char_length(mensagem) between 10 and 5000),
  status      text not null default 'Pendente'
              check (status in ('Pendente', 'Em Contato', 'Finalizado'))
);

alter table public.leads enable row level security;

-- Visitante: apenas envia (e o status inicial é sempre 'Pendente')
create policy "Visitante envia lead" on public.leads
  for insert to anon
  with check (status = 'Pendente');

-- Equipe logada: lê, altera o status e exclui
create policy "Equipe le leads" on public.leads
  for select to authenticated using (true);

create policy "Equipe atualiza leads" on public.leads
  for update to authenticated using (true) with check (true);

create policy "Equipe exclui leads" on public.leads
  for delete to authenticated using (true);

-- Permissões mínimas por papel (o RLS acima filtra as linhas)
revoke all on public.leads from anon, authenticated;
grant insert on public.leads to anon;
grant select, update, delete on public.leads to authenticated;
