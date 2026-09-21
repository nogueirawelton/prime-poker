/**
 * Apelido entre aspas, como em `Renato “rbmrenato” Barbosa`.
 *
 * Os instrutores são cadastrados assim. Sem tirar o apelido, as iniciais
 * sairiam do nick (`R“`) em vez do nome. Cobre as aspas curvas que o
 * WordPress aplica sozinho e as retas de quem digita.
 */
const NICKNAME = /["'“”‘’][^"'“”‘’]*["'“”‘’]/g;

/** `"Felipe Martins"` → `"FM"`; `"Renato “rbmrenato” Barbosa"` → `"RB"`. */
export function initials(name: string) {
  // Quem foi cadastrado só com o apelido ficaria sem nenhuma letra: aí vale
  // o nome como veio, aspas e tudo.
  const withoutNickname = name.replace(NICKNAME, " ");
  const source = withoutNickname.trim() ? withoutNickname : name;

  return source
    .replace(/["'“”‘’]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
