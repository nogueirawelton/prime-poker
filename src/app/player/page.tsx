import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AulaCard } from "@/components/pages/player/aulas/aula-card";
import { PerfilCard } from "@/components/pages/player/painel/perfil-card";
import { ProgressoCard } from "@/components/pages/player/painel/progresso-card";
import { ContinuarAssistindo } from "@/components/shared/player/continuar-assistindo";
import { NotificationItem } from "@/components/shared/player/notification-item";
import { getSalvas } from "@/services/aula-detalhe";
import { getContinuarAssistindo } from "@/services/aulas";
import { listarNotificacoes } from "@/services/notificacoes";
import { getPerfil, getProgresso } from "@/services/perfil";

export const metadata: Metadata = {
  title: "Área do Jogador | Prime Poker Team",
};

/** Quantas aulas salvas o painel mostra antes de mandar para a listagem. */
const SALVAS_VISIVEIS = 4;

export default function PlayerHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-8 lg:px-8">
      {/* Tudo aqui é do usuário logado, então nada disso entra no shell
          estático: cada bloco tem o próprio boundary e chega quando resolve. */}
      <Suspense fallback={<Bloco className="h-36" />}>
        <Perfil />
      </Suspense>

      <Suspense fallback={<Bloco className="h-64" />}>
        <Estudo />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Suspense fallback={<Bloco className="h-72" />}>
          <Salvas />
        </Suspense>

        <Suspense fallback={<Bloco className="h-72" />}>
          <Notificacoes />
        </Suspense>
      </div>
    </div>
  );
}

async function Perfil() {
  const [perfil, continuar] = await Promise.all([
    getPerfil(),
    getContinuarAssistindo(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <PerfilCard perfil={perfil} />

      {continuar && (
        <div className="rounded-xl border border-white/10 bg-white/3 p-2">
          <ContinuarAssistindo aula={continuar} />
        </div>
      )}
    </div>
  );
}

async function Estudo() {
  const [progresso, salvas] = await Promise.all([getProgresso(), getSalvas()]);

  return <ProgressoCard progresso={progresso} salvas={salvas.length} />;
}

async function Salvas() {
  const salvas = await getSalvas();

  return (
    <Secao
      titulo="Aulas salvas"
      acao={{ label: "Ver acervo", href: "/player/aulas" }}
    >
      {salvas.length === 0 ? (
        <p className="py-10 text-center text-prime-light/50 text-sm">
          Nada salvo ainda. Use o botão “Salvar” dentro de uma aula para montar
          sua lista.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {salvas.slice(0, SALVAS_VISIVEIS).map((aula) => (
            <AulaCard key={aula.id} aula={aula} />
          ))}
        </div>
      )}
    </Secao>
  );
}

async function Notificacoes() {
  const notificacoes = await listarNotificacoes("todas", 4);

  return (
    <Secao
      titulo="Últimas notificações"
      acao={{ label: "Ver todas", href: "/player/notificacoes" }}
    >
      {notificacoes.length === 0 ? (
        <p className="py-10 text-center text-prime-light/50 text-sm">
          Nenhuma notificação por aqui.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {notificacoes.map((notificacao) => (
            <li key={notificacao.id}>
              <NotificationItem notificacao={notificacao} />
            </li>
          ))}
        </ul>
      )}
    </Secao>
  );
}

function Secao({
  titulo,
  acao,
  children,
}: {
  titulo: string;
  acao: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/3">
      <header className="flex items-center justify-between gap-3 border-white/10 border-b px-5 py-4">
        <h2 className="font-bold text-prime-light text-sm uppercase tracking-wide">
          {titulo}
        </h2>

        <Link
          href={acao.href}
          className="flex items-center gap-1.5 text-prime-light/60 text-xs transition-colors duration-500 hover:text-prime-red"
        >
          {acao.label}
          <ArrowRightIcon className="size-3.5" weight="bold" />
        </Link>
      </header>

      <div className="flex-1 p-5">{children}</div>
    </section>
  );
}

function Bloco({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl border border-white/10 bg-white/3 ${className}`}
    />
  );
}
