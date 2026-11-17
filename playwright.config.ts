import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { ADMIN_STORAGE_STATE } from './tests/support/paths';

// Localmente as credenciais vêm do .env.local; no CI, dos segredos do GitHub
// (o arquivo não existe lá e o dotenv simplesmente não carrega nada).
dotenv.config({ path: path.resolve(__dirname, '.env.local'), quiet: true });

const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  // No CI, o reporter "github" anota as falhas direto no PR
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'html',

  use: {
    baseURL,
    // Captura vídeo e trace na repetição de um teste que falhou
    video: 'on-first-retry',
    trace: 'on-first-retry',
  },

  projects: [
    // 1. Faz login uma vez e salva a sessão para os testes do painel
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // 2. Site público, login e API: não dependem de sessão
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/admin\.spec\.ts/, /auth\.setup\.ts/],
    },
    // 3. Painel administrativo: reaproveita a sessão salva no passo 1
    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'], storageState: ADMIN_STORAGE_STATE },
      testMatch: /admin\.spec\.ts/,
      dependencies: ['setup'],
    },
  ],

  // Localmente usa o servidor de desenvolvimento (e reaproveita um já aberto).
  // No CI roda o build de produção, que é o que vai ao ar e é mais estável.
  webServer: {
    // A porta vem do BASE_URL: dá para testar dois projetos ao mesmo tempo
    // (ex.: BASE_URL=http://localhost:3400) sem conflito na porta 3000.
    command: `${isCI ? 'npm run start' : 'npm run dev'} -- -p ${new URL(baseURL).port || '3000'}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    // Projeto recém-criado do template, ainda sem Supabase: usa um endereço
    // local fictício. Os testes públicos simulam o banco e passam mesmo assim;
    // os que exigem login real são pulados (ver tests/support/env.ts).
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'chave-ficticia-para-testes',
    },
  },
});
