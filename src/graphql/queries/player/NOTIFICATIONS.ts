import { gql } from "graphql-request";

/**
 * Notificações do jogador logado.
 *
 * O CPT `notificacao` não é exposto pelo WordPress: o plugin devolve só o que
 * o público-alvo de cada aviso permite, por este tipo próprio.
 */
export const NOTIFICATIONS = gql`
  query Notifications($filter: NotificationFilterEnum, $first: Int) {
    myNotifications(filter: $filter, first: $first) {
      id
      type
      title
      description
      date
      read
      href
    }
    notificationsUnread
  }
`;

/** Só o número do selo do sino. */
export const NOTIFICATIONS_UNREAD = gql`
  query NotificationsUnread {
    notificationsUnread
  }
`;
