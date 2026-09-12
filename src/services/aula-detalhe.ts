import "server-only";

import { type Aula, getAcervo, getAulaPorSlug, listarAulas } from "./aulas";

/**
 * Conteúdo e estado da aula aberta.
 *
 * Separado de `aulas.ts` porque aqui há estado mutável (salvos, concluídos,
 * dúvidas) — e `aulas.ts` é importado por componentes cliente, que levariam
 * uma cópia divergente desse estado para cada aba.
 *
 * Continua mock: o WordPress ainda não expõe aulas. Ao ligar no CMS, só as
 * funções deste arquivo mudam.
 */

export type Material = {
  nome: string;
  /** Já formatado para exibição, como vem da media library. */
  tamanho: string;
  /** Ausente enquanto o arquivo não existe no CMS: o botão fica desabilitado. */
  url?: string;
};

export type Duvida = {
  id: string;
  autor: string;
  /** Instrutor e aluno são apresentados de formas diferentes na conversa. */
  ehInstrutor: boolean;
  texto: string;
  data: string;
};

export type AulaDetalhe = Aula & {
  /** HTML do editor — renderizado com a classe `rich-text` do projeto. */
  descricao: string;
  materiais: Array<Material>;
  duvidas: Array<Duvida>;
  salva: boolean;
  concluida: boolean;
};

/* -------------------------------------------------------------------------- */
/*                          Estado do jogador (mock)                          */
/* -------------------------------------------------------------------------- */

const SALVAS = new Set<string>();
const CONCLUIDAS = new Set<string>();
const DUVIDAS = new Map<string, Array<Duvida>>();

/* -------------------------------------------------------------------------- */
/*                                  Conteúdo                                  */
/* -------------------------------------------------------------------------- */

function descricaoDe(aula: Aula) {
  return `
    <p>Nesta aula vamos explorar ${aula.titulo.toLowerCase()} na prática, com
    exemplos de mãos reais e os erros que mais custam fichas.</p>
    <h3>Tópicos abordados</h3>
    <ul>
      <li>O conceito e por que ele importa</li>
      <li>Como identificar a situação na mesa</li>
      <li>Aplicando a linha na prática</li>
      <li>Exemplos comentados</li>
      <li>Erros comuns</li>
    </ul>
    <h3>Links úteis</h3>
    <ul>
      <li><a href="/blog">Artigo relacionado no blog</a></li>
      <li><a href="/player/aulas?cat=${aula.categoria.slug}">Outras aulas da trilha</a></li>
    </ul>
  `;
}

const MATERIAIS: Array<Material> = [
  { nome: "slides_da_aula.pdf", tamanho: "2.4 MB" },
  { nome: "exemplos_praticos.xlsx", tamanho: "1.1 MB" },
  { nome: "resumo_aula.txt", tamanho: "0.5 MB" },
  { nome: "ranges.png", tamanho: "0.8 MB" },
];

/** Conversa de exemplo, para a aba não abrir vazia em toda aula. */
function duvidasIniciais(aula: Aula): Array<Duvida> {
  const base = new Date(aula.data).getTime();

  return [
    {
      id: `${aula.id}-d1`,
      autor: "Você",
      ehInstrutor: false,
      texto:
        "No flop Q♦ 7♥ 2♦, em que situações devo c-betar com meu range polarizado?",
      data: new Date(base + 3600000).toISOString(),
    },
    {
      id: `${aula.id}-d2`,
      autor: aula.instrutor,
      ehInstrutor: true,
      texto:
        "Prioriza c-bet polarizada quando você tem vantagem de nut e o board favorece seu range de 3-bet. Em Q72 rainbow, a frequência sobe bastante.",
      data: new Date(base + 5400000).toISOString(),
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*                                  Leitura                                   */
/* -------------------------------------------------------------------------- */

/** `null` quando o slug não existe — a página responde 404. */
export async function getAula(slug: string): Promise<AulaDetalhe | null> {
  const aula = await getAulaPorSlug(slug);
  if (!aula) return null;

  return {
    ...aula,
    descricao: descricaoDe(aula),
    materiais: MATERIAIS,
    duvidas: DUVIDAS.get(slug) ?? duvidasIniciais(aula),
    salva: SALVAS.has(slug),
    concluida: CONCLUIDAS.has(slug),
  };
}

/** Slugs marcados como concluídos pelo jogador. */
export async function getConcluidas(): Promise<Set<string>> {
  return new Set(CONCLUIDAS);
}

/** As aulas que o jogador salvou, da mais recente para a mais antiga. */
export async function getSalvas(): Promise<Array<Aula>> {
  const acervo = await getAcervo();

  return acervo
    .filter((aula) => SALVAS.has(aula.slug))
    .sort((a, b) => b.data.localeCompare(a.data));
}

/** Próximas aulas da mesma trilha, para continuar a sequência. */
export async function getProximas(
  aula: Aula,
  limite = 4,
): Promise<Array<Aula>> {
  const { aulas } = await listarAulas({ categoria: aula.categoria.slug });

  return aulas.filter((item) => item.slug !== aula.slug).slice(0, limite);
}

/* -------------------------------------------------------------------------- */
/*                                  Escrita                                   */
/* -------------------------------------------------------------------------- */

export async function alternarSalva(slug: string) {
  if (SALVAS.has(slug)) {
    SALVAS.delete(slug);
  } else {
    SALVAS.add(slug);
  }
}

export async function alternarConcluida(slug: string) {
  if (CONCLUIDAS.has(slug)) {
    CONCLUIDAS.delete(slug);
  } else {
    CONCLUIDAS.add(slug);
  }
}

/** Registra a pergunta do jogador. A resposta do instrutor vem por fora. */
export async function adicionarDuvida(slug: string, texto: string) {
  const aula = await getAula(slug);
  if (!aula) return;

  const atuais = DUVIDAS.get(slug) ?? duvidasIniciais(aula);

  DUVIDAS.set(slug, [
    ...atuais,
    {
      id: `${slug}-${Date.now()}`,
      autor: "Você",
      ehInstrutor: false,
      texto,
      data: new Date().toISOString(),
    },
  ]);
}
