// Credenciais do usuário de teste (um usuário próprio para testes, nunca o
// admin real). Em um projeto recém-criado do template, ainda sem Supabase,
// elas não existem: os testes que dependem de login real são pulados.

export function hasTestUser() {
  return Boolean(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);
}

export const SKIP_WITHOUT_TEST_USER =
  'Sem TEST_USER_EMAIL/TEST_USER_PASSWORD: configure o Supabase e o usuário de teste (ver README).';

// Falha cedo, com mensagem clara, em vez de deixar o teste quebrar mais
// adiante com "fill(undefined)".
export function testUser() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Defina TEST_USER_EMAIL e TEST_USER_PASSWORD (no .env.local ou nos segredos do GitHub Actions).'
    );
  }

  return { email, password };
}
