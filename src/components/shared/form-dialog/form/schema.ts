import { z } from "zod";

// --- SCHEMA PRINCIPAL ---

export const primeApplicationSchema = z.object({
  // 1. DADOS PESSOAIS
  dadosPessoais: z.object({
    entry_502479035: z.string().min(2, "Campo obrigatório!"),
    entry_1045653986: z.string().min(2, "Campo obrigatório!"),
    entry_431975596: z.string().min(2, "Campo obrigatório!"),
    entry_1067624691: z.string().min(2, "Campo obrigatório!"),
  }),

  // 2. SITUAÇÃO ATUAL
  situacaoAtual: z.object({
    entry_1524797025: z.string().min(2, "Campo obrigatório!"),
    entry_936724915: z.string().min(2, "Campo obrigatório!"),
    entry_1945294488: z.string().min(2, "Campo obrigatório!"),
    entry_661900987: z.string().min(2, "Campo obrigatório!"),
  }),

  // 3. HISTÓRICO ONLINE
  historicoOnline: z.object({
    entry_683158185: z.string().min(2, "Campo obrigatório!"),
    entry_1091112575: z.string().min(2, "Campo obrigatório!"),
  }),

  // 4. METAS E DEDICAÇÃO
  metasDedicacao: z.object({
    entry_1979104888: z.string().min(2, "Campo obrigatório!"),
    entry_899222282: z.string().min(2, "Campo obrigatório!"),
    entry_462376964: z.string().min(2, "Campo obrigatório!"),
    entry_1510858042: z.string().min(2, "Campo obrigatório!"),
  }),
});

export type FormData = z.infer<typeof primeApplicationSchema>;
