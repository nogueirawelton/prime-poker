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

export type Section = {
  id: string;
  title: string;
  /** 2 para `h2`, 3 para `h3`: o índice recua o segundo nível. */
  level: 2 | 3;
};
export type FaqItem = { id: string; question: string; answer: string };

export type Content = {
  /** Corpo já com âncoras e sem o bloco de FAQ. */
  html: string;
  sections: Array<Section>;
  faq: Array<FaqItem>;
};

const H2 = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi;
const H3 = /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi;

function text(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Slug estável a partir do título da seção, com sufixo em caso de repetição. */
function slug(value: string, used: Set<string>) {
  const base =
    normalize(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "secao";

  let candidate = base;
  let counter = 2;
  while (used.has(candidate)) candidate = `${base}-${counter++}`;

  used.add(candidate);
  return candidate;
}

/** Só reconhece este título como abertura do FAQ. */
const FAQ_TITLE = "perguntas frequentes";

export function prepareContent(rawInput: string): Content {
  if (!rawInput) return { html: "", sections: [], faq: [] };

  // 1. Separa o bloco de FAQ: do `h2` que o abre até o próximo `h2` (ou o fim).
  let body = rawInput;
  let faq: Array<FaqItem> = [];

  for (const match of rawInput.matchAll(H2)) {
    if (normalize(text(match[2])) !== FAQ_TITLE) continue;

    const start = match.index;
    const after = rawInput.slice(start + match[0].length);
    const next = after.search(/<h2\b/i);
    const block = next === -1 ? after : after.slice(0, next);

    faq = extractFaq(block);

    // Só remove o bloco se ele realmente virou FAQ; um título sozinho continua
    // sendo conteúdo comum.
    if (faq.length > 0) {
      body = rawInput.slice(0, start) + (next === -1 ? "" : after.slice(next));
    }

    break;
  }

  // 2. Ancora os títulos restantes e monta o índice.
  //
  // `h3` entra junto com `h2`: os posts costumam ter um `h2` só, com os
  // assuntos em `h3` — um índice de um item não navega nada.
  const used = new Set<string>();
  const sections: Array<Section> = [];

  const html = body.replace(
    /<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attributes: string, inner: string) => {
      const title = text(inner);
      const id = slug(title, used);

      sections.push({ id, title, level: tag.toLowerCase() === "h2" ? 2 : 3 });

      // Um `id` já escrito no editor é descartado: dois atributos iguais na
      // mesma tag deixariam o índice apontando para a âncora errada. O
      // `scroll-margin` que compensa o header fixo vem do CSS de `.rich-text`.
      const cleanedAttributes = attributes.replace(
        /\s+id=("[^"]*"|'[^']*'|[^\s>]+)/gi,
        "",
      );

      return `<${tag}${cleanedAttributes} id="${id}">${inner}</${tag}>`;
    },
  );

  return { html, sections, faq };
}

/** Cada `h3` é uma pergunta; o que vem depois dele, até o próximo, é a resposta. */
function extractFaq(block: string): Array<FaqItem> {
  const markers = [...block.matchAll(H3)];
  const used = new Set<string>();

  return markers
    .map((marker, index) => {
      const start = (marker.index ?? 0) + marker[0].length;
      const end = markers[index + 1]?.index ?? block.length;
      const question = text(marker[1]);

      return {
        id: slug(question, used),
        question,
        answer: block.slice(start, end).trim(),
      };
    })
    .filter((item) => item.question && item.answer);
}
