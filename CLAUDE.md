@AGENTS.md

# nextjs-starter: instruções do projeto

Template base para sites de clientes (Next.js + Supabase + Resend). Ao criar um projeto a partir dele, ajuste este arquivo com o nome do cliente e as particularidades do projeto. Visão geral, variáveis e passo a passo de configuração estão no `README.md` (ler quando precisar; não é importado para economizar contexto).

## Comandos

- `npm run dev`: desenvolvimento (porta 3000).
- Verificações antes de propor commits: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` e `CI=1 npx playwright test`.
- Para testar ao mesmo tempo que outro projeto ocupa a porta 3000: `BASE_URL=http://localhost:3400`.
- Notas mínimas de Lighthouse: `npm run build && npm run lhci` (precisa de Chrome; ver README).

## Regras do projeto

- **Dados do cliente centralizados em `src/lib/site.ts`** (nome, domínio, contatos, endereço, cores para imagens geradas, dados da política de privacidade). Não repetir esses valores como texto solto; os testes também leem deste arquivo.
- **Cores:** tokens neutros `fundo`, `marca`, `marca-clara` e `marca-escura` em `src/app/globals.css`. Trocar só os valores, não os nomes.
- **Testes nunca gravam em produção.** Escritas no Supabase e envio de e-mail são simulados com `page.route` (`tests/support/supabase.ts`). Testes reais só com `E2E_REAL=1`, por pedido explícito.
- **Sem credenciais, os testes ainda rodam:** o Playwright usa um Supabase fictício e pula os testes de login real (`tests/support/env.ts`).
- **Supabase com RLS** (`supabase/schema.sql`): `anon` só insere em `leads`; `authenticated` lê, altera e exclui. O RLS bloqueia sem acusar erro, por isso as escritas da equipe conferem as linhas afetadas (`ensureAffected` em `src/services/leadService.ts`). Mudança de permissão exige atualizar o `schema.sql` e passar o SQL ao Diego.
- **Clientes de SDK** (Supabase no navegador, Resend) são criados no uso, nunca no topo do módulo: o build do CI pode não ter as chaves.
- **Performance:** texto acima da dobra nunca nasce com `opacity: 0` (atrasa o LCP); bibliotecas pesadas usadas só em uma ação (ex.: Zod e Supabase no envio do formulário) entram por `import()` dinâmico; texto com no mínimo 12px no conteúdo principal.
- **Acessibilidade:** toda página nova entra na lista `PAGES` de `tests/a11y.spec.ts` (axe, desktop e mobile).
- **LGPD:** formulário novo que colete outros dados ou serviço novo que receba dados exige atualizar `src/app/(public)/privacidade/page.tsx`.

## Ambiente (Windows)

- No Git Bash, entre na pasta como `cd "C:/<projeto>"`, não `/c/<projeto>`: com o caminho `/c/...` o Vitest carrega o próprio código duas vezes e todos os testes falham com "reading 'config'". No PowerShell funciona normalmente.
- Se um comando acusar falta de espaço em disco, pare e avise; `.next`, `.lighthouseci` e o cache do npm podem ser limpos.

## CI

- `.github/workflows/ci.yml`: lint, tipos e unitários; depois, em paralelo, E2E (Playwright) e Lighthouse CI (`lighthouserc.json`).
- Runner fixado em `ubuntu-24.04`. Atualizar o Playwright e o Ubuntu juntos, nunca voltar para `ubuntu-latest`.
