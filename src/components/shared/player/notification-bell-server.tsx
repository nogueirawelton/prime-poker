import { contarNaoLidas, listarNotificacoes } from "@/services/notificacoes";
import { NotificationBell } from "./notification-bell";

/** Quantas notificações o painel do sino mostra antes do "Ver todas". */
const RECENTES = 6;

/**
 * Busca as notificações do jogador e entrega ao sino.
 *
 * A leitura fica aqui, e não dentro do componente cliente, para o painel
 * abrir já preenchido — sem spinner e sem uma ida ao servidor por clique.
 */
export async function NotificationBellData() {
  const [notificacoes, naoLidas] = await Promise.all([
    listarNotificacoes("todas", RECENTES),
    contarNaoLidas(),
  ]);

  return <NotificationBell notificacoes={notificacoes} naoLidas={naoLidas} />;
}
