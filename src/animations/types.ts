/**
 * Assinatura de cada animação de seção: recebe o container e monta a
 * timeline. O retorno é ignorado — a limpeza fica a cargo do
 * `gsap.context` criado em `runtime.ts`.
 */
export type Wrapper = Record<string, (container: HTMLDivElement) => void>;
