import { z } from "zod";

// --- SCHEMA PRINCIPAL ---

export const primeApplicationSchema = z.object({
  // 1. DADOS PESSOAIS
  personalData: z.object({
    nome_completo: z.string().min(2, "Campo obrigatório!"),
    email: z.email("Informe um e-mail válido."),
    numero_whatsapp: z.string().min(2, "Campo obrigatório!"),
    onde_mora: z.string().min(2, "Campo obrigatório!"),
  }),

  // 2. SITUAÇÃO ATUAL
  currentSituation: z.object({
    idade: z.string().min(2, "Campo obrigatório!"),
    ocupacao: z.string().min(2, "Campo obrigatório!"),
    fonte_de_renda: z.string().min(2, "Campo obrigatório!"),
    discord: z.string().min(2, "Campo obrigatório!"),
  }),

  // 3. HISTÓRICO ONLINE
  onlineHistory: z.object({
    nick_poker_stars: z.string().min(2, "Campo obrigatório!"),
    outros_sites: z.string().min(2, "Campo obrigatório!"),
  }),

  // 4. METAS E DEDICAÇÃO
  goalsCommitment: z.object({
    disponibilidade: z.string().min(2, "Campo obrigatório!"),
    jogou_em_time: z.string().min(2, "Campo obrigatório!"),
    porque_se_inscreveu: z.string().min(2, "Campo obrigatório!"),
    indicacao: z.string().min(2, "Campo obrigatório!"),
  }),
});

export type FormData = z.infer<typeof primeApplicationSchema>;
