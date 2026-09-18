import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/pages/blog/breadcrumbs";
import { ManagePreferencesButton } from "@/components/shared/consent";

export const metadata: Metadata = {
  title: "Política de Privacidade | Prime Poker Team",
  description:
    "Saiba como o Prime Poker Team coleta, utiliza e protege os seus dados pessoais, em conformidade com a LGPD.",
  alternates: { canonical: "/politica-de-privacidade" },
};

export default function PrivacyPolicyPage() {
  return (
    // O header é fixo e a página não tem banner atrás dele: o padding superior
    // impede que o conteúdo nasça embaixo do header.
    <main className="mx-auto max-w-screen-2xl px-4 pt-32 pb-24 lg:px-8 lg:pt-40">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Política de Privacidade" },
        ]}
      />

      <header className="mt-4 flex flex-col gap-4">
        <h1 className="max-w-4xl font-black text-3xl text-prime-light uppercase leading-tight lg:text-5xl">
          Política de Privacidade
        </h1>

        <p className="text-prime-light/60 text-sm">
          Última atualização:{" "}
          <time dateTime="2026-09-17">17 de setembro de 2026</time>
        </p>
      </header>

      <div className="rich-text mt-12 max-w-3xl">
        <p>
          O Prime Poker Team respeita a sua privacidade e está comprometida com
          a proteção dos dados pessoais coletados por meio deste site.
        </p>

        <h2>1. Dados Coletados</h2>
        <p>
          Podemos coletar as seguintes informações fornecidas voluntariamente
          pelo usuário:
        </p>
        <ul>
          <li>Nome;</li>
          <li>E-mail;</li>
          <li>Telefone ou WhatsApp;</li>
          <li>Cidade e Estado;</li>
          <li>
            Outras informações enviadas por meio de formulários de contato ou
            inscrição.
          </li>
        </ul>

        <h2>2. Finalidade do Tratamento</h2>
        <p>Os dados coletados poderão ser utilizados para:</p>
        <ul>
          <li>Entrar em contato com o usuário;</li>
          <li>Avaliar solicitações de participação na equipe;</li>
          <li>Fornecer informações sobre nossos serviços;</li>
          <li>Responder dúvidas e solicitações;</li>
          <li>Melhorar a experiência de navegação e os serviços oferecidos.</li>
        </ul>

        <h2>3. Compartilhamento de Dados</h2>
        <p>O Prime Poker Team não vende dados pessoais.</p>
        <p>
          Os dados poderão ser compartilhados apenas com prestadores de serviços
          necessários para a operação do site, hospedagem, comunicação e
          processamento das informações, sempre observando os requisitos legais
          aplicáveis.
        </p>

        <h2>4. Armazenamento e Segurança</h2>
        <p>
          Adotamos medidas técnicas e administrativas razoáveis para proteger os
          dados pessoais contra acesso não autorizado, perda, alteração ou
          divulgação indevida.
        </p>
        <p>
          Os dados serão armazenados pelo tempo necessário para atender às
          finalidades descritas nesta política ou conforme exigido por lei.
        </p>

        <h2>5. Direitos do Titular</h2>
        <p>
          Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 –
          LGPD), o usuário poderá solicitar:
        </p>
        <ul>
          <li>Confirmação da existência de tratamento;</li>
          <li>Acesso aos seus dados;</li>
          <li>Correção de dados incompletos ou desatualizados;</li>
          <li>Exclusão dos dados quando aplicável;</li>
          <li>Informações sobre compartilhamento de dados;</li>
          <li>Revogação do consentimento, quando cabível.</li>
        </ul>

        <h2>6. Cookies</h2>
        <p>
          Este site poderá utilizar cookies e tecnologias semelhantes para
          melhorar a navegação, analisar o tráfego e aprimorar a experiência do
          usuário.
        </p>
        <p>
          O usuário pode gerenciar ou desabilitar cookies diretamente em seu
          navegador.
        </p>
        {/* A LGPD exige que o consentimento possa ser revisto a qualquer
            momento: o botão reabre o modal de preferências. */}
        <p>
          <ManagePreferencesButton className="text-prime-red">
            Gerenciar preferências de cookies
          </ManagePreferencesButton>
        </p>

        <h2>7. Contato</h2>
        <p>
          Para dúvidas, solicitações ou assuntos relacionados à privacidade e
          proteção de dados, entre em contato pelo e-mail:{" "}
          <a href="mailto:prime@primepokerteam.com.br">
            prime@primepokerteam.com.br
          </a>
        </p>

        <h2>8. Alterações desta Política</h2>
        <p>
          Esta Política de Privacidade poderá ser atualizada periodicamente.
          Recomendamos a consulta desta página para acompanhamento de eventuais
          alterações.
        </p>
        <p>
          Ao utilizar este site, o usuário declara estar ciente dos termos desta
          Política de Privacidade.
        </p>
      </div>
    </main>
  );
}
