const usdFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * `"1500000"` → `"US$ 1.500.000"`. Os ganhos são em dólar, mas o site é em
 * português: moeda explícita e separadores brasileiros.
 */
export function formatUsd(value: string | number) {
  // O Intl separa o símbolo com espaço não separável; o espaço comum evita
  // surpresas em buscas e cópias do texto.
  return usdFormatter.format(Number(value)).replace(/ /g, " ");
}
