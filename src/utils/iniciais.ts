/** `"Felipe Martins"` → `"FM"`. Espaços repetidos não geram letra vazia. */
export function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}
