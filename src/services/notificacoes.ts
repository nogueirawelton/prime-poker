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
export type TipoNotificacao = "aula" | "aviso" | "conquista" | "suporte";

export type Notificacao = {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  /** ISO. */
  data: string;
  lida: boolean;
  /**
   * Para onde a notificação leva ao ser aberta.
   *
   * Opcional: um comunicado do time se esgota no próprio texto e não tem
   * destino — virar link para a lista onde ele já está seria um clique que
   * não leva a lugar nenhum.
   */
  href?: string;
};

type Registro = Omit<Notificacao, "lida">;

const AGORA = Date.UTC(2026, 7, 30, 14, 0);
const HORA = 3600000;

const REGISTROS: Array<Registro> = [
  {
    id: "n-1",
    tipo: "aula",
    titulo: "Nova aula publicada",
    descricao: "“Como Explorar Range Advantage no Flop”, com Felipe Martins.",
    data: new Date(AGORA - HORA).toISOString(),
    href: "/player/aulas",
  },
  {
    id: "n-2",
    tipo: "aviso",
    titulo: "Mesa final do Prime Series",
    descricao: "Transmissão comentada hoje às 20h no canal do time.",
    data: new Date(AGORA - 5 * HORA).toISOString(),
  },
  {
    id: "n-3",
    tipo: "conquista",
    titulo: "Trilha de Fundamentos concluída",
    descricao: "Você terminou as 12 aulas da trilha. Próxima parada: Torneios.",
    data: new Date(AGORA - 26 * HORA).toISOString(),
    href: "/player/aulas?cat=torneios",
  },
  {
    id: "n-4",
    tipo: "suporte",
    titulo: "Resposta do seu coach",
    descricao: "Rafael Moraes comentou a mão que você enviou para revisão.",
    data: new Date(AGORA - 30 * HORA).toISOString(),
    href: "/player",
  },
  {
    id: "n-5",
    tipo: "aula",
    titulo: "Nova aula publicada",
    descricao: "“ICM na Prática: Fases Finais de Torneios”, com Rafael Moraes.",
    data: new Date(AGORA - 52 * HORA).toISOString(),
    href: "/player/aulas?cat=torneios",
  },
  {
    id: "n-6",
    tipo: "aviso",
    titulo: "Manutenção programada",
    descricao: "A área do jogador ficará indisponível domingo, das 3h às 5h.",
    data: new Date(AGORA - 78 * HORA).toISOString(),
  },
  {
    id: "n-7",
    tipo: "conquista",
    titulo: "7 dias seguidos de estudo",
    descricao: "Sequência mantida. Continue assim.",
    data: new Date(AGORA - 100 * HORA).toISOString(),
    href: "/player",
  },
  {
    id: "n-8",
    tipo: "aula",
    titulo: "Aula atualizada",
    descricao: "“Configurando seu HUD do Zero” ganhou uma nova seção.",
    data: new Date(AGORA - 140 * HORA).toISOString(),
    href: "/player/aulas?cat=ferramentas",
  },
];

/** Ids já lidos. Começa com as mais antigas lidas, como numa conta em uso. */
const LIDAS = new Set(["n-5", "n-6", "n-7", "n-8"]);

export const FILTROS = ["todas", "nao-lidas", "lidas"] as const;
export type FiltroNotificacao = (typeof FILTROS)[number];

export const FILTRO_LABEL: Record<FiltroNotificacao, string> = {
  todas: "Todas",
  "nao-lidas": "Não lidas",
  lidas: "Lidas",
};

function comLeitura(registro: Registro): Notificacao {
  return { ...registro, lida: LIDAS.has(registro.id) };
}

/** Da mais recente para a mais antiga; `limite` corta o topo da lista. */
export async function listarNotificacoes(
  filtro: FiltroNotificacao = "todas",
  limite?: number,
): Promise<Array<Notificacao>> {
  const lista = REGISTROS.map(comLeitura)
    .filter((notificacao) => {
      if (filtro === "nao-lidas") return !notificacao.lida;
      if (filtro === "lidas") return notificacao.lida;
      return true;
    })
    .sort((a, b) => b.data.localeCompare(a.data));

  return limite ? lista.slice(0, limite) : lista;
}

export async function contarNaoLidas(): Promise<number> {
  return REGISTROS.filter((registro) => !LIDAS.has(registro.id)).length;
}

export async function marcarComoLida(id: string, lida: boolean) {
  if (lida) {
    LIDAS.add(id);
  } else {
    LIDAS.delete(id);
  }
}

export async function marcarTodasComoLidas() {
  for (const registro of REGISTROS) LIDAS.add(registro.id);
}
