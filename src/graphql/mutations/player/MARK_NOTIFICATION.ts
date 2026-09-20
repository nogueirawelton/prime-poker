import { gql } from "graphql-request";

/** Marca ou desmarca uma notificação como lida. */
export const MARK_NOTIFICATION = gql`
  mutation MarkNotification($notificationId: Int!, $read: Boolean!) {
    markNotification(
      input: { notificationId: $notificationId, read: $read }
    ) {
      unread
    }
  }
`;

/** Marca como lidas todas as que o jogador vê. */
export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead(input: {}) {
      unread
    }
  }
`;
