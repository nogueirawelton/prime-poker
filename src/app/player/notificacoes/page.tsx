import { ChecksIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Suspense } from "react";
import { lerTodas } from "@/actions/notificacoes";
import { FiltroNav } from "@/components/pages/player/notificacoes/filtro-nav";
import { NotificationItem } from "@/components/shared/player/notification-item";
import {
  contarNaoLidas,
  FILTROS,
  type FiltroNotificacao,
  listarNotificacoes,
} from "@/services/notificacoes";

export const metadata: Metadata = {
  title: "Notificações | Prime Poker Team",
};

type Props = { searchParams: Promise<{ filtro?: string | Array<string> }> };

export default function NotificacoesPage({ searchParams }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-8 lg:px-8">
      <header>
        <h1 className="font-black text-2xl text-prime-light uppercase lg:text-3xl">
          Notificações
        </h1>
        <p className="mt-1 text-prime-light/70 text-sm">
          Tudo o que aconteceu na sua conta.
        </p>
      </header>

      {/* Filtro e lista dependem da URL, que só existe em tempo de
          requisição. Atrás do boundary, o cabeçalho segue no shell estático. */}
      <Suspense fallback={<Esqueleto />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Conteudo({ searchParams }: Props) {
  const { filtro: bruto } = await searchParams;
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;

  // Valor fora da lista não é erro: cai em "todas".
  const filtro: FiltroNotificacao = FILTROS.includes(valor as FiltroNotificacao)
    ? (valor as FiltroNotificacao)
    : "todas";

  const [notificacoes, naoLidas] = await Promise.all([
    listarNotificacoes(filtro),
    contarNaoLidas(),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FiltroNav atual={filtro} />

        {naoLidas > 0 && (
          <form action={lerTodas}>
            <button
              type="submit"
              className="flex h-10 items-center gap-2 rounded-md border border-white/20 px-4 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-dark"
            >
              <ChecksIcon className="size-4" weight="bold" />
              Marcar todas como lidas
            </button>
          </form>
        )}
      </div>

      {notificacoes.length === 0 ? (
        <div className="rounded-xl border border-white/10 border-dashed p-16 text-center">
          <p className="text-prime-light">
            {filtro === "nao-lidas"
              ? "Você está em dia: nenhuma não lida."
              : "Nenhuma notificação por aqui."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/3 p-2">
          {notificacoes.map((notificacao) => (
            <li key={notificacao.id}>
              <NotificationItem notificacao={notificacao} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Esqueleto() {
  return (
    <div
      aria-hidden="true"
      className="h-96 animate-pulse rounded-xl border border-white/10 bg-white/3"
    />
  );
}
