import { countUnread, listNotifications } from "@/services/notifications";
import { NotificationBell } from "./notification-bell";

/** Quantas notificações o painel do sino mostra antes do "Ver todas". */
const RECENT_COUNT = 6;

/**
 * Busca as notificações do jogador e entrega ao sino.
 *
 * A leitura fica aqui, e não dentro do componente cliente, para o painel
 * abrir já preenchido — sem spinner e sem uma ida ao servidor por clique.
 */
export async function NotificationBellData() {
  const [notifications, unreadCount] = await Promise.all([
    listNotifications("todas", RECENT_COUNT),
    countUnread(),
  ]);

  return (
    <NotificationBell notifications={notifications} unreadCount={unreadCount} />
  );
}
