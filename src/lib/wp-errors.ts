/**
 * Tradução das mensagens de erro do WordPress.
 *
 * Compartilhado entre as actions de cadastro e de login: os dois recebem texto
 * do mesmo backend, com os mesmos problemas de formato.
 */

/**
 * O WordPress devolve o erro como HTML escapado ("&lt;strong&gt;Erro:&lt;/strong&gt;
 * este nome..."). Sem limpar, a mensagem chegaria ao usuário com marcação crua
 * e os padrões de tradução não casariam.
 */
const ENTIDADES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#039;": "'",
  "&hellip;": "…",
  "&nbsp;": " ",
};

export function limparMensagemWp(mensagem: string) {
  return mensagem
    .replace(/&(lt|gt|amp|quot|#039|hellip|nbsp);/g, (e) => ENTIDADES[e] ?? e)
    .replace(/<[^>]+>/g, "")
    .trim();
}

/**
 * Traduz o erro do WordPress para uma mensagem curta e sem detalhe interno.
 *
 * Os padrões precisam cobrir português E inglês: as mensagens do núcleo do WP
 * saem no idioma do site (aqui, pt-BR), mas as dos plugins GraphQL não são
 * traduzidas. Depender de um idioma só deixaria metade dos casos no fallback.
 *
 * A ordem dos padrões importa — o primeiro que casar vence.
 */
export function traduzirErroWp(
  mensagem: string,
  padroes: Array<[RegExp, string]>,
  fallback: string,
) {
  const limpa = limparMensagemWp(mensagem);

  for (const [padrao, texto] of padroes) {
    if (padrao.test(limpa)) return texto;
  }

  return fallback;
}
