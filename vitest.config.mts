import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Testes unitários: funções puras de src/, sem navegador nem servidor.
// Os testes de ponta a ponta (Playwright) ficam em tests/ e são ignorados aqui.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
