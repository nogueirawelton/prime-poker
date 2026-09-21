import type { PlayerNotification } from "@/services/notifications";

/**
 * Notificações em blocos por período.
 *
 * A lista é cronológica, e é assim que se procura nela: "o que chegou hoje",
 * "o que perdi na semana". Agrupar por tipo separaria coisas que aconteceram
 * juntas, que é justamente o que o jogador quer ver junto.
 *
 * Fora daqui, e não dentro do componente, porque a regra de corte (o dia de
 * ontem, os sete dias) é o tipo de coisa que se quer conferir sem montar a
 * página inteira.
 */

export type NotificationGroup = {
  label: string;
  items: Array<PlayerNotification>;
};

const DAY = 86400000;

/**
 * Em que bloco a data cai, comparada a uma referência.
 *
 * A conta é por **dia do calendário**, não por horas decorridas: algo das 23h
 * de ontem é "ontem" mesmo quando faz três horas, que é como as pessoas leem
 * a própria linha do tempo.
 */
function labelFor(date: Date, now: Date): string {
  const midnight = (value: Date) =>
    Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());

  const days = Math.round((midnight(now) - midnight(date)) / DAY);

  // Data no futuro (relógio do servidor adiantado, agendamento) fica em
  // "Hoje": inventar um bloco "Amanhã" numa caixa de avisos confundiria.
  if (days <= 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days <= 7) return "Últimos 7 dias";
  if (days <= 30) return "Últimos 30 dias";

  return "Mais antigas";
}

/**
 * Agrupa preservando a ordem recebida.
 *
 * A lista já vem da mais recente para a mais antiga, então os blocos saem na
 * ordem certa sem nenhuma ordenação extra — e bloco vazio simplesmente não
 * nasce.
 */
export function groupByPeriod(
  notifications: Array<PlayerNotification>,
  now: Date = new Date(),
): Array<NotificationGroup> {
  const groups: Array<NotificationGroup> = [];

  for (const notification of notifications) {
    const label = labelFor(new Date(notification.data), now);
    const last = groups.at(-1);

    if (last?.label === label) {
      last.items.push(notification);
    } else {
      groups.push({ label, items: [notification] });
    }
  }

  return groups;
}
