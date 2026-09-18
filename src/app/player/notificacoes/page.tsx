import { ChecksIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Suspense } from "react";
import { markAllRead } from "@/actions/notifications";
import { FilterNav } from "@/components/pages/player/notifications/filter-nav";
import { NotificationItem } from "@/components/shared/player/notification-item";
import {
  countUnread,
  FILTERS,
  listNotifications,
  type NotificationFilter,
} from "@/services/notifications";

export const metadata: Metadata = {
  title: "Notificações | Prime Poker Team",
};

type Props = { searchParams: Promise<{ filtro?: string | Array<string> }> };

export default function NotificationsPage({ searchParams }: Props) {
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
      <Suspense fallback={<Skeleton />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({ searchParams }: Props) {
  const { filtro: rawInput } = await searchParams;
  const value = Array.isArray(rawInput) ? rawInput[0] : rawInput;

  // Valor fora da lista não é erro: cai em "todas".
  const filter: NotificationFilter = FILTERS.includes(
    value as NotificationFilter,
  )
    ? (value as NotificationFilter)
    : "todas";

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(filter),
    countUnread(),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterNav current={filter} />

        {unreadCount > 0 && (
          <form action={markAllRead}>
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

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-white/10 border-dashed p-16 text-center">
          <p className="text-prime-light">
            {filter === "nao-lidas"
              ? "Você está em dia: nenhuma não lida."
              : "Nenhuma notificação por aqui."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/3 p-2">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Skeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-96 animate-pulse rounded-xl border border-white/10 bg-white/3"
    />
  );
}
