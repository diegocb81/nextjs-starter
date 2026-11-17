import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contatoSchema } from '@/lib/schemas/contato';
import { rateLimit } from '@/lib/rateLimit';
import { escapeHtml, singleLine } from '@/lib/email';
import { SITE_NAME } from '@/lib/site';

// Envia à empresa um e-mail de aviso a cada novo contato do formulário.
// (O contato em si é gravado no Supabase pelo navegador; ver leadService.)

const MAX_REQUESTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'desconhecido';
}

export async function POST(request: Request) {
  const { allowed, retryAfterSeconds } = rateLimit(getClientIp(request), MAX_REQUESTS, WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações. Tente novamente em alguns minutos." },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  // Corpo que não é JSON é erro de quem enviou (400), não falha do servidor (500)
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    // Validação rigorosa no servidor: nunca confiar só na do navegador
    const parse = contatoSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Honeypot preenchido: é um robô. Respondemos 200 para ele achar que
    // funcionou, mas não enviamos nada.
    if (parse.data.sobrenome) {
      console.warn("Spam detectado via honeypot.");
      return NextResponse.json({ success: true });
    }

    // A configuração só é checada depois de validar a entrada: assim, dados
    // inválidos e spam recebem a resposta correta mesmo em ambientes sem
    // e-mail configurado (como o CI), e os testes da API não dependem do Resend.
    const from = process.env.RESEND_FROM_EMAIL;
    const to = process.env.CONTACT_TO_EMAIL;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !from || !to) {
      console.error("Envio de e-mail não configurado: verifique RESEND_API_KEY, RESEND_FROM_EMAIL e CONTACT_TO_EMAIL.");
      return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }

    const { nome, email, telefone, assunto, mensagem } = parse.data;

    // O cliente é criado aqui, e não no topo do arquivo: o Resend exige a
    // chave já na criação, e o Next carrega este arquivo durante o build.
    // Criado no topo, um ambiente sem a chave (como o CI) quebraria o build.
    const resend = new Resend(apiKey);
    // O SDK do Resend não lança exceção em falha: devolve { data, error }.
    const { error } = await resend.emails.send({
      from: `${SITE_NAME} <${from}>`,
      to: [to],
      // Permite responder direto ao interessado pelo botão "Responder"
      replyTo: email,
      subject: singleLine(`Novo contato pelo site - ${assunto} - ${nome}`),
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>Novo contato pelo site</h1>
          <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
          <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
          <p><strong>Telefone/WhatsApp:</strong> ${escapeHtml(telefone)}</p>
          <p><strong>Assunto:</strong> ${escapeHtml(assunto)}</p>
          <p><strong>Mensagem:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(mensagem)}</p>
          <hr />
          <p style="font-size: 10px; color: #999;">E-mail enviado automaticamente pelo site ${escapeHtml(SITE_NAME)}.</p>
        </div>
      `
    });

    if (error) {
      console.error("Falha no envio pelo Resend:", error.name, error.message);
      return NextResponse.json({ error: "Não foi possível enviar o e-mail" }, { status: 502 });
    }

    // Não devolvemos a resposta bruta do provedor ao navegador
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
