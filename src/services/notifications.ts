import "server-only";

/**
 * Notificações do jogador.
 *
 * Mock, como o acervo de aulas: o WordPress ainda não expõe nada disso. O
 * estado de leitura vive na memória do processo — some a cada restart e não é
 * compartilhado entre instâncias. É o bastante para a interface funcionar de
 * ponta a ponta; ao ligar no CMS, só as funções deste arquivo mudam.
 *
 * `server-only` porque o "banco" aqui é um módulo mutável: importado no
 * cliente, cada aba teria a própria cópia divergente.
 */

/**
 * `aviso` é o comunicado do time — o antigo mural. Não existe página separada
 * para ele: tudo o que o time anuncia chega como notificação.
 */
export type NotificationType = "aula" | "aviso" | "conquista" | "suporte";

export type PlayerNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  /** ISO. */
  data: string;
  read: boolean;
  /**
   * Para onde a notificação leva ao ser aberta.
   *
   * Opcional: um comunicado do time se esgota no próprio texto e não tem
   * destino — virar link para a lista onde ele já está seria um clique que
   * não leva a lugar nenhum.
   */
  href?: string;
};

type NotificationRecord = Omit<PlayerNotification, "read">;

const NOW = Date.UTC(2026, 7, 30, 14, 0);
const HOUR = 3600000;

const RECORDS: Array<NotificationRecord> = [
  {
    id: "n-1",
    type: "aula",
    title: "Nova aula publicada",
    description: "“Como Explorar Range Advantage no Flop”, com Felipe Martins.",
    data: new Date(NOW - HOUR).toISOString(),
    href: "/player/aulas",
  },
  {
    id: "n-2",
    type: "aviso",
    title: "Mesa final do Prime Series",
    description: "Transmissão comentada hoje às 20h no canal do time.",
    data: new Date(NOW - 5 * HOUR).toISOString(),
  },
  {
    id: "n-3",
    type: "conquista",
    title: "Trilha de Fundamentos concluída",
    description:
      "Você terminou as 12 aulas da trilha. Próxima parada: Torneios.",
    data: new Date(NOW - 26 * HOUR).toISOString(),
    href: "/player/aulas?cat=torneios",
  },
  {
    id: "n-4",
    type: "suporte",
    title: "Resposta do seu coach",
    description: "Rafael Moraes comentou a mão que você enviou para revisão.",
    data: new Date(NOW - 30 * HOUR).toISOString(),
    href: "/player",
  },
  {
    id: "n-5",
    type: "aula",
    title: "Nova aula publicada",
    description:
      "“ICM na Prática: Fases Finais de Torneios”, com Rafael Moraes.",
    data: new Date(NOW - 52 * HOUR).toISOString(),
    href: "/player/aulas?cat=torneios",
  },
  {
    id: "n-6",
    type: "aviso",
    title: "Manutenção programada",
    description: "A área do jogador ficará indisponível domingo, das 3h às 5h.",
    data: new Date(NOW - 78 * HOUR).toISOString(),
  },
  {
    id: "n-7",
    type: "conquista",
    title: "7 dias seguidos de estudo",
    description: "Sequência mantida. Continue assim.",
    data: new Date(NOW - 100 * HOUR).toISOString(),
    href: "/player",
  },
  {
    id: "n-8",
    type: "aula",
    title: "Aula atualizada",
    description: "“Configurando seu HUD do Zero” ganhou uma nova seção.",
    data: new Date(NOW - 140 * HOUR).toISOString(),
    href: "/player/aulas?cat=ferramentas",
  },
];

/** Ids já lidos. Começa com as mais antigas lidas, como numa conta em uso. */
const READ_IDS = new Set(["n-5", "n-6", "n-7", "n-8"]);

export const FILTERS = ["todas", "nao-lidas", "lidas"] as const;
export type NotificationFilter = (typeof FILTERS)[number];

export const FILTER_LABEL: Record<NotificationFilter, string> = {
  todas: "Todas",
  "nao-lidas": "Não lidas",
  lidas: "Lidas",
};

function withReadState(record: NotificationRecord): PlayerNotification {
  return { ...record, read: READ_IDS.has(record.id) };
}

/** Da mais recente para a mais antiga; `limit` corta o topo da lista. */
export async function listNotifications(
  filter: NotificationFilter = "todas",
  limit?: number,
): Promise<Array<PlayerNotification>> {
  const list = RECORDS.map(withReadState)
    .filter((notification) => {
      if (filter === "nao-lidas") return !notification.read;
      if (filter === "lidas") return notification.read;
      return true;
    })
    .sort((a, b) => b.data.localeCompare(a.data));

  return limit ? list.slice(0, limit) : list;
}

export async function countUnread(): Promise<number> {
  return RECORDS.filter((record) => !READ_IDS.has(record.id)).length;
}

export async function markAsRead(id: string, read: boolean) {
  if (read) {
    READ_IDS.add(id);
  } else {
    READ_IDS.delete(id);
  }
}

export async function markAllAsRead() {
  for (const record of RECORDS) READ_IDS.add(record.id);
}
