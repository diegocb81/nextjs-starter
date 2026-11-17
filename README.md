# nextjs-starter

Template base para sites de clientes: site institucional com formulário de contato, painel de leads com login, e os padrões de qualidade já configurados (segurança, acessibilidade WCAG AA, performance, SEO, LGPD, testes e CI).

Nasceu dos projetos **Coffee Break da Ilha** e **TS Design**: cada item aqui resolve um problema real encontrado neles.

## O que vem pronto

| Área | O que tem |
|---|---|
| **Site público** | Home (Hero, Serviços, Contato), formulário `/contato`, política de privacidade `/privacidade`, página 404, menu mobile, botão flutuante de WhatsApp |
| **Painel** | `/admin` com login (Supabase Auth): lista de leads, mensagem expansível, troca de status, exclusão com confirmação e logout |
| **Segurança** | Sessão validada no servidor (`src/proxy.ts`), RLS no banco (`supabase/schema.sql`), cabeçalhos HTTP (`next.config.ts`), API com Zod + honeypot + rate limit + escape de HTML |
| **Acessibilidade** | Contraste AA, rótulos ligados, erros anunciados, foco visível, link "pular para o conteúdo", `prefers-reduced-motion` |
| **Performance** | `next/font`, componentes de servidor, animações em loop em CSS, LCP sem esperar animação, `import()` dinâmico no envio do formulário |
| **SEO** | Título por página, canonical, `sitemap.xml`, `robots.txt`, JSON-LD `LocalBusiness`, favicon e imagem de compartilhamento gerados |
| **LGPD** | Política de privacidade-modelo, aviso no formulário, prazo de retenção, exclusão de dados pelo painel |
| **Testes** | Vitest (unitários) e Playwright (E2E + axe), com page objects e escritas simuladas |
| **CI** | Lint, tipos e unitários → E2E e Lighthouse CI em paralelo; Dependabot |

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase, Resend, Zod, framer-motion, Vitest, Playwright, Lighthouse CI.

## Como iniciar um projeto novo

### 1. Criar o repositório
No GitHub, abra este repositório e clique em **Use this template → Create a new repository**. Depois:

```bash
git clone <url-do-novo-repo>
cd <pasta>
npm ci
```

### 2. Dados do cliente
- [ ] `src/lib/site.ts`: nome, descrição, domínio, contatos, endereço, cores das imagens geradas e dados da política de privacidade (`PRIVACY`)
- [ ] `src/app/globals.css`: valores das cores (`--color-fundo`, `--color-marca` etc.); mantenha `BRAND_COLORS` do `site.ts` igual
- [ ] `src/app/layout.tsx`: fontes da identidade visual (só os pesos usados)
- [ ] `src/components/sections/*`: textos do Hero, serviços e contato
- [ ] `src/lib/schemas/assuntos.ts`: opções do campo "Assunto"
- [ ] `package.json`: campo `name`
- [ ] `CLAUDE.md`: nome do cliente e particularidades do projeto
- [ ] Logotipo: substituir `src/app/icon.tsx` por `icon.png`/`icon.svg` e `opengraph-image.tsx` por `opengraph-image.jpg` (1200×630)

### 3. Supabase
1. Criar o projeto (região **São Paulo**, para os dados ficarem no Brasil) e anotar a região em `PRIVACY.databaseLocation`.
2. **SQL Editor:** rodar `supabase/schema.sql` (tabela `leads` + RLS + permissões).
3. **Authentication → Sign In / Providers:** desligar "Allow new users to sign up".
4. **Authentication → Users → Add user** (marcando "Auto Confirm User"): a conta do cliente **e** uma conta só para testes.

### 4. Variáveis de ambiente
Copiar `.env.example` para `.env.local` e preencher. Nunca versionar o `.env.local`.

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexão com o Supabase (a chave é pública; a proteção vem do RLS) |
| `RESEND_API_KEY` | Envio do e-mail de aviso de novo contato |
| `RESEND_FROM_EMAIL` | Remetente (até verificar o domínio no Resend: `onboarding@resend.dev`) |
| `CONTACT_TO_EMAIL` | Caixa que recebe os avisos |
| `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | Usuário **de teste** (nunca o do cliente) |
| `BASE_URL` | Endereço usado pelos testes E2E (padrão `http://localhost:3000`) |

### 5. GitHub
- **Settings → Secrets and variables → Actions:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` (um segredo por nome). Repetir os mesmos na aba **Dependabot**.
- Sem os segredos o CI passa, mas pula os testes de login e avisa no PR.

### 6. Antes de publicar
- [ ] CNPJ em `PRIVACY` e revisão jurídica da política de privacidade
- [ ] Textos, números e depoimentos confirmados com o cliente (nada inventado)
- [ ] Domínio verificado no Resend
- [ ] Hospedagem: o plano gratuito da Vercel não permite uso comercial; avaliar Vercel Pro, Netlify ou Cloudflare
- [ ] Supabase gratuito pausa após ~1 semana sem uso: plano pago ou rotina que mantém o projeto ativo
- [ ] Google Search Console (enviar o sitemap) e Perfil da Empresa no Google

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` / `npm run test:watch` | Testes unitários (Vitest), em `src/**/*.test.ts` |
| `npm run test:e2e` | Testes E2E (Playwright), em `tests/` |
| `npm run lhci` | Lighthouse CI com notas mínimas (rodar após `npm run build`) |

## Testes

- **Unitários:** validação do formulário, máscara de telefone, rate limit, escape de HTML, link de WhatsApp, status dos leads.
- **E2E:** formulário (com escritas simuladas), API, login, painel, home, SEO, LGPD e acessibilidade (axe em desktop e mobile).
- Os testes **não gravam dados reais**. Para uma integração real (grava no banco e envia e-mail): `$env:E2E_REAL="1"; npx playwright test contact-flow`.
- Sem Supabase configurado, os testes usam um endereço fictício e pulam os que exigem login.
- O login do painel é feito uma vez pelo projeto `setup` do Playwright (sessão em `playwright/.auth/`, fora do Git).
- **Mais navegadores:** o CI usa só o Chromium, que é mais rápido. Para Firefox, Safari e celulares, acrescente projetos em `playwright.config.ts` (ex.: `devices['Desktop Firefox']`, `devices['iPhone 14']`) e instale com `npx playwright install --with-deps`.

### Lighthouse local
O Lighthouse CI precisa de um Chrome. Sem o Chrome instalado, use o do Playwright (PowerShell):

```powershell
$env:CHROME_PATH = node -e "console.log(require('@playwright/test').chromium.executablePath())"
npm run build; npm run lhci
```

As notas variam com a carga da máquina; o CI (ambiente limpo) é a referência. Notas mínimas em `lighthouserc.json`.

## Notas de manutenção

- **`npm audit`:** os alertas restantes vêm do `@lhci/cli`, ferramenta que só roda no CI e não vai para o site publicado. O Dependabot propõe a atualização quando houver versão corrigida.
- **Runner do CI** fixado em `ubuntu-24.04`: atualizar junto com o Playwright.

---

Desenvolvido por **TS Design**.
