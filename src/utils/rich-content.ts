/**
 * Preparo do HTML do WordPress para a página do post.
 *
 * Três coisas em uma passada, porque todas dependem da mesma varredura do
 * corpo: ancorar os `h2` (para o índice lateral), listar as seções e separar o
 * bloco de perguntas frequentes.
 *
 * O FAQ vem do próprio editor, sem campo novo no CMS: quem escreve cria um
 * `h2` "Perguntas frequentes" e, abaixo dele, um `h3` por pergunta. Sem esse
 * título, o post simplesmente não tem FAQ — nada quebra.
 *
 * A varredura é por expressão regular, e não por um parser de DOM: o HTML aqui
 * é o do editor do WordPress (previsível e bem formado), e trazer um parser
 * para o servidor sairia caro para o que se ganha.
 */

export type Secao = {
  id: string;
  titulo: string;
  /** 2 para `h2`, 3 para `h3`: o índice recua o segundo nível. */
  nivel: 2 | 3;
};
export type Pergunta = { id: string; pergunta: string; resposta: string };

export type Conteudo = {
  /** Corpo já com âncoras e sem o bloco de FAQ. */
  html: string;
  secoes: Array<Secao>;
  faq: Array<Pergunta>;
};

const H2 = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi;
const H3 = /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi;

function texto(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function normalizar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Slug estável a partir do título da seção, com sufixo em caso de repetição. */
function slug(valor: string, usados: Set<string>) {
  const base =
    normalizar(valor)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "secao";

  let candidato = base;
  let contador = 2;
  while (usados.has(candidato)) candidato = `${base}-${contador++}`;

  usados.add(candidato);
  return candidato;
}

/** Só reconhece este título como abertura do FAQ. */
const TITULO_FAQ = "perguntas frequentes";

export function prepararConteudo(bruto: string): Conteudo {
  if (!bruto) return { html: "", secoes: [], faq: [] };

  // 1. Separa o bloco de FAQ: do `h2` que o abre até o próximo `h2` (ou o fim).
  let corpo = bruto;
  let faq: Array<Pergunta> = [];

  for (const match of bruto.matchAll(H2)) {
    if (normalizar(texto(match[2])) !== TITULO_FAQ) continue;

    const inicio = match.index;
    const depois = bruto.slice(inicio + match[0].length);
    const proximo = depois.search(/<h2\b/i);
    const bloco = proximo === -1 ? depois : depois.slice(0, proximo);

    faq = extrairPerguntas(bloco);

    // Só remove o bloco se ele realmente virou FAQ; um título sozinho continua
    // sendo conteúdo comum.
    if (faq.length > 0) {
      corpo =
        bruto.slice(0, inicio) + (proximo === -1 ? "" : depois.slice(proximo));
    }

    break;
  }

  // 2. Ancora os títulos restantes e monta o índice.
  //
  // `h3` entra junto com `h2`: os posts costumam ter um `h2` só, com os
  // assuntos em `h3` — um índice de um item não navega nada.
  const usados = new Set<string>();
  const secoes: Array<Secao> = [];

  const html = corpo.replace(
    /<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_todo, tag: string, atributos: string, interno: string) => {
      const titulo = texto(interno);
      const id = slug(titulo, usados);

      secoes.push({ id, titulo, nivel: tag.toLowerCase() === "h2" ? 2 : 3 });

      // Um `id` já escrito no editor é descartado: dois atributos iguais na
      // mesma tag deixariam o índice apontando para a âncora errada. O
      // `scroll-margin` que compensa o header fixo vem do CSS de `.rich-text`.
      const limpos = atributos.replace(/\s+id=("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

      return `<${tag}${limpos} id="${id}">${interno}</${tag}>`;
    },
  );

  return { html, secoes, faq };
}

/** Cada `h3` é uma pergunta; o que vem depois dele, até o próximo, é a resposta. */
function extrairPerguntas(bloco: string): Array<Pergunta> {
  const marcas = [...bloco.matchAll(H3)];
  const usados = new Set<string>();

  return marcas
    .map((marca, indice) => {
      const inicio = (marca.index ?? 0) + marca[0].length;
      const fim = marcas[indice + 1]?.index ?? bloco.length;
      const pergunta = texto(marca[1]);

      return {
        id: slug(pergunta, usados),
        pergunta,
        resposta: bloco.slice(inicio, fim).trim(),
      };
    })
    .filter((item) => item.pergunta && item.resposta);
}
