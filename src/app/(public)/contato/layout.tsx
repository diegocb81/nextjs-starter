import type { Metadata } from "next";

// A página do formulário é um componente de cliente e não pode exportar
// metadados; este layout (componente de servidor) faz isso por ela.
export const metadata: Metadata = {
  title: "Contato",
  description: "Envie sua mensagem ou peça um orçamento. Respondemos pelo WhatsApp ou e-mail.",
  alternates: { canonical: "/contato" },
};

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
