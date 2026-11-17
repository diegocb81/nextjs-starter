import type { Metadata } from "next";
import Link from "next/link";
import { ADDRESS, CONTACT, PRIVACY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como coletamos, usamos e protegemos os dados enviados pelo site, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
};

// MODELO de política, redigido com base na LGPD (Lei 13.709/2018) e no
// funcionamento padrão deste template (formulário -> Supabase + aviso por
// e-mail via Resend). Ao usar em um projeto real:
//   1. preencha PRIVACY em src/lib/site.ts (CNPJ, local do banco, prazo);
//   2. ajuste as seções se o site coletar outros dados ou usar outros serviços
//      (ex.: analytics, pagamentos, newsletter);
//   3. peça revisão a um profissional jurídico antes de publicar.

const h2 = "text-2xl font-serif text-marca mt-12 mb-4";
const p = "text-white/70 leading-relaxed mb-4";
const list = "list-disc pl-6 space-y-2 text-white/70 leading-relaxed mb-4 marker:text-marca/60";
const link = "text-marca underline underline-offset-4 hover:text-white transition-colors";

export default function PrivacidadePage() {
  const email = (
    <a href={`mailto:${PRIVACY.contactEmail}`} className={link}>
      {PRIVACY.contactEmail}
    </a>
  );

  return (
    <main className="min-h-screen bg-fundo px-8 pt-32 pb-20">
      <article className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-serif text-marca mb-3">Política de Privacidade</h1>
          <p className="text-white/60 text-sm">Última atualização: {PRIVACY.updatedAt}</p>
        </header>

        <p className={p}>
          Esta política explica, de forma direta, quais dados pessoais {PRIVACY.controller} recebe
          por este site, para que os usa e quais são os seus direitos, conforme a Lei Geral de
          Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018).
        </p>

        <h2 className={h2}>1. Quem é responsável pelos seus dados</h2>
        <p className={p}>
          O controlador dos dados é <strong className="text-white">{PRIVACY.controller}</strong>
          {PRIVACY.cnpj && <>, inscrito no CNPJ sob o nº {PRIVACY.cnpj}</>}, com atuação em{" "}
          {ADDRESS.city}/{ADDRESS.region}. Para qualquer assunto sobre privacidade, fale conosco
          pelo e-mail {email}.
        </p>

        <h2 className={h2}>2. Quais dados coletamos</h2>
        <p className={p}>Quando você preenche o formulário de contato, recebemos:</p>
        <ul className={list}>
          <li>nome completo;</li>
          <li>e-mail;</li>
          <li>número de WhatsApp;</li>
          <li>assunto;</li>
          <li>a mensagem que você escrever.</li>
        </ul>
        <p className={p}>
          Pedimos que não inclua na mensagem dados sensíveis (como informações de saúde, religião
          ou origem racial), que não são necessários para responder ao seu contato.
        </p>
        <p className={p}>
          Este site <strong className="text-white">não usa cookies de rastreamento, publicidade
          ou estatísticas de visitas</strong>. Os únicos cookies existentes são os do login da
          área restrita da nossa equipe. Como em qualquer site, o provedor de hospedagem registra
          dados técnicos de acesso (como endereço IP e tipo de navegador) para segurança e
          funcionamento do serviço.
        </p>

        <h2 className={h2}>3. Para que usamos os dados</h2>
        <ul className={list}>
          <li>responder à sua mensagem ou ao seu pedido de orçamento;</li>
          <li>entrar em contato com você, por WhatsApp ou e-mail, sobre o assunto solicitado;</li>
          <li>caso o serviço seja contratado, organizar a sua execução.</li>
        </ul>
        <p className={p}>Não vendemos seus dados e não os usamos para envio de propaganda.</p>

        <h2 className={h2}>4. Base legal</h2>
        <p className={p}>
          Tratamos os dados do formulário para realizar procedimentos preliminares a um contrato,
          a seu pedido (art. 7º, V, da LGPD): você entra em contato e usamos os dados para
          responder. Os registros técnicos de acesso são tratados com base no legítimo interesse
          em manter o site seguro e funcionando (art. 7º, IX).
        </p>

        <h2 className={h2}>5. Com quem compartilhamos</h2>
        <p className={p}>
          Os dados são acessados apenas pela nossa equipe e pelos fornecedores de tecnologia
          necessários para o site funcionar, que os tratam somente para prestar esse serviço:
        </p>
        <ul className={list}>
          <li>
            <strong className="text-white">Supabase</strong>: banco de dados onde os contatos ficam
            guardados, em servidores localizados em {PRIVACY.databaseLocation};
          </li>
          <li>
            <strong className="text-white">Resend</strong>: serviço que nos envia um e-mail de aviso
            a cada novo contato, com os dados do formulário. Seus servidores ficam nos Estados Unidos;
          </li>
          <li>
            <strong className="text-white">provedor de hospedagem do site</strong>, que pode manter
            servidores fora do Brasil.
          </li>
        </ul>
        <p className={p}>
          Quando há transferência de dados para outro país, ela ocorre apenas para a prestação
          desses serviços, nos termos do art. 33 da LGPD.
        </p>

        <h2 className={h2}>6. Por quanto tempo guardamos</h2>
        <p className={p}>
          Se o contato não resultar em contratação, os dados são excluídos em até{" "}
          {PRIVACY.retentionMonths} meses após o último contato. Se houver contratação, são
          mantidos pelo tempo necessário para cumprir o contrato e as obrigações legais
          (como as fiscais). Você pode pedir a exclusão antes disso (veja o item 8).
        </p>

        <h2 className={h2}>7. Como protegemos</h2>
        <p className={p}>
          O site usa conexão criptografada (HTTPS); o acesso aos contatos é restrito à nossa equipe,
          mediante login e senha; e o banco de dados possui regras que impedem que visitantes leiam
          os dados de outras pessoas.
        </p>

        <h2 className={h2}>8. Seus direitos</h2>
        <p className={p}>A LGPD (art. 18) garante a você, a qualquer momento, o direito de:</p>
        <ul className={list}>
          <li>confirmar se tratamos seus dados e acessá-los;</li>
          <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
          <li>pedir a exclusão dos seus dados;</li>
          <li>saber com quem os compartilhamos;</li>
          <li>solicitar a portabilidade dos dados a outro fornecedor;</li>
          <li>apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
        <p className={p}>
          Para exercer qualquer um deles, envie um e-mail para {email} ou fale conosco pelo{" "}
          <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className={link}>
            WhatsApp {CONTACT.whatsappDisplay}<span className="sr-only"> (abre em nova aba)</span>
          </a>
          . Responderemos em até 15 dias.
        </p>

        <h2 className={h2}>9. Alterações nesta política</h2>
        <p className={p}>
          Podemos atualizar esta política para refletir mudanças no site ou na lei. A data da
          última atualização aparece no início da página.
        </p>

        <p className="mt-12">
          <Link href="/" className={link}>Voltar para a página inicial</Link>
        </p>
      </article>
    </main>
  );
}
