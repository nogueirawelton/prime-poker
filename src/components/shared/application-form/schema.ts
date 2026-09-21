import { z } from "zod";

// --- SCHEMA PRINCIPAL ---

export const primeApplicationSchema = z.object({
  // 1. DADOS PESSOAIS
  personalData: z.object({
    nome_completo: z.string().min(2, "Campo obrigatório!"),
    email: z.email("Informe um e-mail válido."),
    // O campo já nasce com o DDI "55": `min(2)` aceitava o número vazio.
    // Brasil: DDI + DDD + 8 ou 9 dígitos; outros países, ao menos 8 dígitos.
    numero_whatsapp: z
      .string()
      .regex(
        /^(55\d{10,11}|(?!55)\d{8,15})$/,
        "Informe um número de WhatsApp válido, com DDD.",
      ),
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

// --- PAYLOAD DE ENVIO ---

const { personalData, currentSituation, onlineHistory, goalsCommitment } =
  primeApplicationSchema.shape;

/**
 * O formulário agrupa os campos por etapa, mas o envio é achatado: os destinos
 * externos (Contact Form 7 e Google Sheets) recebem uma linha só de campos.
 *
 * Derivar daqui em vez de redeclarar mantém a rota de API validando exatamente
 * as mesmas regras do cliente — um campo novo no formulário não passa
 * despercebido no servidor.
 */
export const applicationPayloadSchema = z.object({
  ...personalData.shape,
  ...currentSituation.shape,
  ...onlineHistory.shape,
  ...goalsCommitment.shape,
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
});

export type ApplicationPayload = z.infer<typeof applicationPayloadSchema>;
