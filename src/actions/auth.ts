"use server";

import { ClientError } from "graphql-request";
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
import { translateWpError } from "@/lib/wp-errors";

/* -------------------------------------------------------------------------- */
/*                                   Login                                    */
/* -------------------------------------------------------------------------- */

/**
 * Só presença, não formato: exigir força de senha aqui é regra de cadastro, e
 * travaria quem tem uma senha antiga mais curta.
 */
const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
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
const INVALID_CREDENTIALS = "E-mail ou senha incorretos.";

const LOGIN_ERRORS: Array<[RegExp, string]> = [
  [
    /senha .* incorreta|incorrect_password|desconhecid|unknown (email|username)|invalid_username|não foi encontrada/i,
    INVALID_CREDENTIALS,
  ],
  [
    /internal server error|não foi possível|could not/i,
    "Serviço indisponível. Tente novamente em instantes.",
  ],
];

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Antes da validação: um e-mail malformado também precisa voltar à tela.
  const submitted = formData.get("email");
  const email = typeof submitted === "string" ? submitted : undefined;

  const validated = loginSchema.safeParse({
    email: submitted,
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { fieldErrors: z.flattenError(validated.error).fieldErrors, email };
  }

  const remember = formData.get("remember") === "on";

  try {
    const response = await mutate<LoginResponse>(LOGIN, {
      // O cadastro grava o e-mail como `user_login`, então ele serve de usuário.
      username: validated.data.email.trim().toLowerCase(),
      password: validated.data.password,
    });

    const authToken = response.login?.authToken;
    const refreshToken = response.login?.refreshToken;

    if (!authToken || !refreshToken) {
      console.error("login: resposta sem token", response);
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
    const rawMessage =
      error instanceof ClientError
        ? (error.response.errors?.[0]?.message ?? "")
        : "";

    console.error("login:", rawMessage || error);

    return {
      error: translateWpError(rawMessage, LOGIN_ERRORS, INVALID_CREDENTIALS),
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

  // Apagar cookies numa Server Action já descarta o cache do NAVEGADOR — é o
  // que impede o "voltar" de reexibir a área logada. Um `revalidatePath("/",
  // "layout")` aqui invalidava também o cache do SERVIDOR para todo mundo: a
  // home era remontada buscando tudo de novo no WordPress a cada logout, e
  // era isso que deixava a saída lenta.

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
    name: z.string().trim().min(2, "Informe seu nome."),
    lastName: z.string().trim().min(2, "Informe seu sobrenome."),
    email: z.email("Informe um e-mail válido."),
    password: z.string().min(8, "A senha precisa de ao menos 8 caracteres."),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((value) => value, "É preciso aceitar os termos para continuar."),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

type RegisterField = keyof z.infer<typeof registerSchema>;

/** Valores devolvidos ao formulário para ele não perder o que foi digitado. */
type PreservedValues = {
  name: string;
  lastName: string;
  email: string;
  acceptTerms: boolean;
};

export type RegisterState = {
  status: "idle" | "invalid" | "error" | "success";
  errors?: Partial<Record<RegisterField, string>>;
  values?: PreservedValues;
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

const REGISTER_ERRORS: Array<[RegExp, string]> = [
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
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const rawInput = {
    name: String(formData.get("name") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on",
  };

  // As senhas ficam de fora de propósito: devolvê-las as reimprimiria no HTML.
  const values: PreservedValues = {
    name: rawInput.name,
    lastName: rawInput.lastName,
    email: rawInput.email,
    acceptTerms: rawInput.acceptTerms,
  };

  const validated = registerSchema.safeParse(rawInput);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);

    return {
      status: "invalid",
      values,
      errors: Object.fromEntries(
        Object.entries(fieldErrors).flatMap(([field, messages]) =>
          messages?.[0] ? [[field, messages[0]]] : [],
        ),
      ),
    };
  }

  const input = validated.data;
  const email = input.email.trim().toLowerCase();

  try {
    const response = await mutate<RegisterResponse>(
      REGISTER_USER,
      {
        // O WP aceita `@` e `.` em `user_login`, então o e-mail serve de usuário
        // e o jogador não precisa memorizar um segundo identificador.
        username: email,
        email,
        password: input.password,
        firstName: input.name,
        lastName: input.lastName,
        displayName: `${input.name} ${input.lastName}`,
      },
      // O botão do e-mail de boas-vindas volta ao ambiente do cadastro.
      { "X-Prime-Front-Url": await requestOrigin() },
    );

    const tier = response.registerUser?.user?.playerTier ?? null;

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
    const rawMessage =
      error instanceof ClientError
        ? (error.response.errors?.[0]?.message ?? "")
        : "";

    // O log fica no servidor: só a mensagem tratada chega ao cliente.
    console.error("registerUser:", rawMessage || error);

    return {
      status: "error",
      values,
      message: translateWpError(
        rawMessage,
        REGISTER_ERRORS,
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
async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "https";

  return host ? `${protocol}://${host}` : "";
}

export type RequestPasswordResetState = { ok: boolean; error?: string };

/**
 * Dispara o e-mail de redefinição.
 *
 * Responde `ok` exista a conta ou não — a mesma neutralidade do WPGraphQL.
 * Só uma falha de comunicação com o WordPress vira erro, porque aí nenhum
 * e-mail sai para ninguém e a pessoa precisa saber que deve tentar de novo.
 */
export async function requestPasswordReset(
  email: string,
): Promise<RequestPasswordResetState> {
  const validated = z.email().safeParse(email.trim().toLowerCase());

  if (!validated.success) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  try {
    await mutate(
      SEND_PASSWORD_RESET_EMAIL,
      { username: validated.data },
      { "X-Prime-Front-Url": await requestOrigin() },
    );
  } catch (error) {
    // Erro de GraphQL aqui é recusa do WP (ex.: e-mail vazio), não falha de
    // rede — e responder diferente revelaria algo sobre a conta.
    if (!(error instanceof ClientError)) {
      console.error("requestPasswordReset:", error);
      return { ok: false, error: "Não foi possível enviar. Tente novamente." };
    }

    console.error("requestPasswordReset:", error.response.errors?.[0]?.message);
  }

  return { ok: true };
}

const resetPasswordSchema = z
  .object({
    key: z.string().min(1),
    login: z.string().min(1),
    password: z.string().min(8, "A senha precisa de ao menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export type ResetPasswordState = {
  status: "idle" | "invalid" | "error" | "success";
  errors?: { password?: string; confirmPassword?: string };
  message?: string;
  /** Link vencido ou já usado: a tela troca o formulário pelo pedido de um novo. */
  invalidLink?: boolean;
};

const PASSWORD_RESET_ERRORS: Array<[RegExp, string]> = [
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
export async function resetPassword(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const validated = resetPasswordSchema.safeParse({
    key: String(formData.get("key") ?? ""),
    login: String(formData.get("login") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);

    if (fieldErrors.key || fieldErrors.login) {
      return {
        status: "error",
        invalidLink: true,
        message:
          "Este link está incompleto. Peça um novo para redefinir a senha.",
      };
    }

    return {
      status: "invalid",
      errors: {
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    };
  }

  try {
    await mutate(RESET_USER_PASSWORD, {
      key: validated.data.key,
      login: validated.data.login,
      password: validated.data.password,
    });
  } catch (error) {
    const rawMessage =
      error instanceof ClientError
        ? (error.response.errors?.[0]?.message ?? "")
        : "";

    console.error("resetPassword:", rawMessage || error);

    const message = translateWpError(
      rawMessage,
      PASSWORD_RESET_ERRORS,
      "Não foi possível redefinir a senha. Tente novamente.",
    );

    return {
      status: "error",
      message,
      invalidLink: PASSWORD_RESET_ERRORS.some(([pattern]) =>
        pattern.test(rawMessage),
      ),
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
