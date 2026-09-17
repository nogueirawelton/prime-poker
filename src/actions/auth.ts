"use server";

import { ClientError } from "graphql-request";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { mutate } from "@/graphql/client";
import { LOGIN } from "@/graphql/mutations/auth/LOGIN";
import { REGISTER_USER } from "@/graphql/mutations/auth/REGISTER_USER";
import { RESET_USER_PASSWORD } from "@/graphql/mutations/auth/RESET_USER_PASSWORD";
import { SEND_PASSWORD_RESET_EMAIL } from "@/graphql/mutations/auth/SEND_PASSWORD_RESET_EMAIL";
import {
  ACCESS_OPTS,
  REMEMBER_COOKIE,
  REMEMBER_OPTS,
  refreshOptsFor,
} from "@/lib/cookies";
import { traduzirErroWp } from "@/lib/wp-errors";

/* -------------------------------------------------------------------------- */
/*                                   Login                                    */
/* -------------------------------------------------------------------------- */

/**
 * Só presença, não formato: exigir força de senha aqui é regra de cadastro, e
 * travaria quem tem uma senha antiga mais curta.
 */
const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
});

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string[]; senha?: string[] };
  /**
   * Devolvido para o formulário poder reexibi-lo: o React reinicia formulários
   * não controlados quando a action termina, e uma senha errada levaria o
   * e-mail junto.
   */
  email?: string;
};

type LoginResponse = {
  login?: {
    authToken?: string | null;
    refreshToken?: string | null;
  } | null;
};

/**
 * Mensagem única para usuário inexistente E senha errada.
 *
 * Distinguir os dois casos diz a quem está tentando quais e-mails existem na
 * base — o mesmo motivo pelo qual a recuperação de senha responde de forma
 * neutra.
 */
const CREDENCIAIS_INVALIDAS = "E-mail ou senha incorretos.";

const ERROS_LOGIN: Array<[RegExp, string]> = [
  [
    /senha .* incorreta|incorrect_password|desconhecid|unknown (email|username)|invalid_username|não foi encontrada/i,
    CREDENCIAIS_INVALIDAS,
  ],
  [
    /internal server error|não foi possível|could not/i,
    "Serviço indisponível. Tente novamente em instantes.",
  ],
];

export async function login(
  _anterior: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Antes da validação: um e-mail malformado também precisa voltar à tela.
  const enviado = formData.get("email");
  const email = typeof enviado === "string" ? enviado : undefined;

  const validado = loginSchema.safeParse({
    email: enviado,
    senha: formData.get("senha"),
  });

  if (!validado.success) {
    return { fieldErrors: z.flattenError(validado.error).fieldErrors, email };
  }

  const remember = formData.get("remember") === "on";

  try {
    const resposta = await mutate<LoginResponse>(LOGIN, {
      // O cadastro grava o e-mail como `user_login`, então ele serve de usuário.
      username: validado.data.email.trim().toLowerCase(),
      password: validado.data.senha,
    });

    const authToken = resposta.login?.authToken;
    const refreshToken = resposta.login?.refreshToken;

    if (!authToken || !refreshToken) {
      console.error("login: resposta sem token", resposta);
      return { error: "Não foi possível entrar. Tente novamente.", email };
    }

    const jar = await cookies();
    jar.set("access_token", authToken, ACCESS_OPTS);
    jar.set("refresh_token", refreshToken, refreshOptsFor(remember));

    // O proxy lê este marcador para reaplicar a mesma validade na renovação.
    if (remember) {
      jar.set(REMEMBER_COOKIE, "1", REMEMBER_OPTS);
    } else {
      jar.delete(REMEMBER_COOKIE);
    }
  } catch (error) {
    const bruta =
      error instanceof ClientError
        ? (error.response.errors?.[0]?.message ?? "")
        : "";

    console.error("login:", bruta || error);

    return {
      error: traduzirErroWp(bruta, ERROS_LOGIN, CREDENCIAIS_INVALIDAS),
      email,
    };
  }

  // Fora do try: o `redirect` funciona lançando, e o catch acima o engoliria.
  redirect("/player");
}

/**
 * Com JWT o logout é assimétrico: o access token continua válido até expirar,
 * ninguém o mata no servidor. O wp-graphql-jwt-authentication nem oferece
 * mutation de logout — o que de fato encerra a sessão é o front jogar os
 * cookies fora, e por isso apagá-los não depende da rede.
 */
export async function logout() {
  const jar = await cookies();

  jar.delete("access_token");
  jar.delete("refresh_token");
  // Sem isto, o próximo login sem "continuar conectado" herdaria estes 30 dias.
  jar.delete(REMEMBER_COOKIE);

  // Global de propósito: o objetivo é descartar tudo que foi renderizado com a
  // sessão anterior, senão o botão "voltar" reexibe a tela autenticada vinda
  // do cache.
  revalidatePath("/", "layout");

  redirect("/");
}

/* -------------------------------------------------------------------------- */
/*                                  Cadastro                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validação do cadastro.
 *
 * Mora no servidor porque a Server Action é um endpoint POST público: qualquer
 * um pode chamá-la sem passar pelo formulário. Validar só no cliente deixaria
 * o schema como decoração.
 */
const registerSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome."),
    sobrenome: z.string().trim().min(2, "Informe seu sobrenome."),
    email: z.email("Informe um e-mail válido."),
    senha: z.string().min(8, "A senha precisa de ao menos 8 caracteres."),
    confirmarSenha: z.string(),
    aceite: z
      .boolean()
      .refine((valor) => valor, "É preciso aceitar os termos para continuar."),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não conferem.",
    path: ["confirmarSenha"],
  });

type CampoRegistro = keyof z.infer<typeof registerSchema>;

/** Valores devolvidos ao formulário para ele não perder o que foi digitado. */
type ValoresPreservados = {
  nome: string;
  sobrenome: string;
  email: string;
  aceite: boolean;
};

export type RegisterState = {
  status: "idle" | "invalid" | "error" | "success";
  errors?: Partial<Record<CampoRegistro, string>>;
  values?: ValoresPreservados;
  message?: string;
  tier?: string | null;
};

type RegisterResponse = {
  registerUser?: {
    user?: {
      databaseId?: number;
      playerTier?: string | null;
    } | null;
  } | null;
};

const ERROS_CADASTRO: Array<[RegExp, string]> = [
  [
    /já está (cadastrado|registrado)|already (exists|used|registered)/i,
    "Já existe um usuário com este e-mail.",
  ],
  [
    /registration is currently not allowed|cadastro.*não.*permitido/i,
    "O cadastro está temporariamente indisponível.",
  ],
  [
    /is invalid|not a valid email|inválido|não está correto/i,
    "Informe um e-mail válido.",
  ],
];

/**
 * Cria a conta do jogador no WordPress.
 *
 * Devolve o estado em vez de lançar: o Next substitui a mensagem de qualquer
 * erro lançado numa Server Action por um texto genérico em produção, então
 * lançar aqui apagaria justamente o motivo que o usuário precisa ler.
 */
export async function registerUser(
  _anterior: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const bruto = {
    nome: String(formData.get("nome") ?? ""),
    sobrenome: String(formData.get("sobrenome") ?? ""),
    email: String(formData.get("email") ?? ""),
    senha: String(formData.get("senha") ?? ""),
    confirmarSenha: String(formData.get("confirmarSenha") ?? ""),
    aceite: formData.get("aceite") === "on",
  };

  // As senhas ficam de fora de propósito: devolvê-las as reimprimiria no HTML.
  const values: ValoresPreservados = {
    nome: bruto.nome,
    sobrenome: bruto.sobrenome,
    email: bruto.email,
    aceite: bruto.aceite,
  };

  const validado = registerSchema.safeParse(bruto);

  if (!validado.success) {
    const { fieldErrors } = z.flattenError(validado.error);

    return {
      status: "invalid",
      values,
      errors: Object.fromEntries(
        Object.entries(fieldErrors).flatMap(([campo, mensagens]) =>
          mensagens?.[0] ? [[campo, mensagens[0]]] : [],
        ),
      ),
    };
  }

  const dados = validado.data;
  const email = dados.email.trim().toLowerCase();

  try {
    const resposta = await mutate<RegisterResponse>(REGISTER_USER, {
      // O WP aceita `@` e `.` em `user_login`, então o e-mail serve de usuário
      // e o jogador não precisa memorizar um segundo identificador.
      username: email,
      email,
      password: dados.senha,
      firstName: dados.nome,
      lastName: dados.sobrenome,
      displayName: `${dados.nome} ${dados.sobrenome}`,
    });

    const tier = resposta.registerUser?.user?.playerTier ?? null;

    // O tier vem do plugin `prime-poker`, que atribui Player Free no
    // hook `user_register`. Nulo aqui significa que o plugin não está ativo: a
    // conta existe, mas sem tier ela não tem acesso a nada na área do jogador
    // — vale o registro no log para não virar suporte silencioso.
    if (!tier) {
      console.warn(
        "registerUser: conta criada sem tier — plugin prime-poker ativo?",
      );
    }

    return { status: "success", tier };
  } catch (error) {
    const bruta =
      error instanceof ClientError
        ? (error.response.errors?.[0]?.message ?? "")
        : "";

    // O log fica no servidor: só a mensagem tratada chega ao cliente.
    console.error("registerUser:", bruta || error);

    return {
      status: "error",
      values,
      message: traduzirErroWp(
        bruta,
        ERROS_CADASTRO,
        "Não foi possível cadastrar o usuário. Tente novamente.",
      ),
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                            Redefinição de senha                            */
/* -------------------------------------------------------------------------- */

/**
 * Endereço de onde o pedido saiu (produção, staging, preview).
 *
 * Vai ao WordPress para o link do e-mail voltar ao mesmo ambiente. O plugin só
 * aceita endereços da lista em Configurações → Cache do site; qualquer outro
 * cai no endereço de produção.
 */
async function origemDoPedido() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocolo = h.get("x-forwarded-proto") ?? "https";

  return host ? `${protocolo}://${host}` : "";
}

export type SolicitarRedefinicaoState = { ok: boolean; error?: string };

/**
 * Dispara o e-mail de redefinição.
 *
 * Responde `ok` exista a conta ou não — a mesma neutralidade do WPGraphQL.
 * Só uma falha de comunicação com o WordPress vira erro, porque aí nenhum
 * e-mail sai para ninguém e a pessoa precisa saber que deve tentar de novo.
 */
export async function solicitarRedefinicao(
  email: string,
): Promise<SolicitarRedefinicaoState> {
  const validado = z.email().safeParse(email.trim().toLowerCase());

  if (!validado.success) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  try {
    await mutate(
      SEND_PASSWORD_RESET_EMAIL,
      { username: validado.data },
      { "X-Prime-Front-Url": await origemDoPedido() },
    );
  } catch (error) {
    // Erro de GraphQL aqui é recusa do WP (ex.: e-mail vazio), não falha de
    // rede — e responder diferente revelaria algo sobre a conta.
    if (!(error instanceof ClientError)) {
      console.error("solicitarRedefinicao:", error);
      return { ok: false, error: "Não foi possível enviar. Tente novamente." };
    }

    console.error("solicitarRedefinicao:", error.response.errors?.[0]?.message);
  }

  return { ok: true };
}

const redefinicaoSchema = z
  .object({
    key: z.string().min(1),
    login: z.string().min(1),
    senha: z.string().min(8, "A senha precisa de ao menos 8 caracteres."),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não conferem.",
    path: ["confirmarSenha"],
  });

export type RedefinirSenhaState = {
  status: "idle" | "invalid" | "error" | "success";
  errors?: { senha?: string; confirmarSenha?: string };
  message?: string;
  /** Link vencido ou já usado: a tela troca o formulário pelo pedido de um novo. */
  linkInvalido?: boolean;
};

const ERROS_REDEFINICAO: Array<[RegExp, string]> = [
  [
    /expired|expirad/i,
    "Este link expirou. Peça um novo para redefinir a senha.",
  ],
  [
    /invalid|inválid|key is required|login is required/i,
    "Este link é inválido ou já foi usado. Peça um novo para redefinir a senha.",
  ],
];

/** Grava a nova senha com a chave recebida por e-mail. */
export async function redefinirSenha(
  _anterior: RedefinirSenhaState,
  formData: FormData,
): Promise<RedefinirSenhaState> {
  const validado = redefinicaoSchema.safeParse({
    key: String(formData.get("key") ?? ""),
    login: String(formData.get("login") ?? ""),
    senha: String(formData.get("senha") ?? ""),
    confirmarSenha: String(formData.get("confirmarSenha") ?? ""),
  });

  if (!validado.success) {
    const { fieldErrors } = z.flattenError(validado.error);

    if (fieldErrors.key || fieldErrors.login) {
      return {
        status: "error",
        linkInvalido: true,
        message:
          "Este link está incompleto. Peça um novo para redefinir a senha.",
      };
    }

    return {
      status: "invalid",
      errors: {
        senha: fieldErrors.senha?.[0],
        confirmarSenha: fieldErrors.confirmarSenha?.[0],
      },
    };
  }

  try {
    await mutate(RESET_USER_PASSWORD, {
      key: validado.data.key,
      login: validado.data.login,
      password: validado.data.senha,
    });
  } catch (error) {
    const bruta =
      error instanceof ClientError
        ? (error.response.errors?.[0]?.message ?? "")
        : "";

    console.error("redefinirSenha:", bruta || error);

    const message = traduzirErroWp(
      bruta,
      ERROS_REDEFINICAO,
      "Não foi possível redefinir a senha. Tente novamente.",
    );

    return {
      status: "error",
      message,
      linkInvalido: ERROS_REDEFINICAO.some(([padrao]) => padrao.test(bruta)),
    };
  }

  // Sessões antigas caíram no WordPress (segredo JWT trocado). Os cookies
  // deste navegador também saem, para o próximo acesso ser com a senha nova.
  const jar = await cookies();
  jar.delete("access_token");
  jar.delete("refresh_token");
  jar.delete(REMEMBER_COOKIE);

  return { status: "success" };
}
