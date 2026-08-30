"use client";

import {
  CircleNotchIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "react-toastify";
import { type RegisterState, registerUser } from "@/actions/auth";
import { IconInput } from "@/components/ui/form/icon-input";

const ESTADO_INICIAL: RegisterState = { status: "idle" };

/** Botão de mostrar/ocultar reaproveitado pelos dois campos de senha. */
function ToggleSenha({
  visivel,
  onToggle,
}: {
  visivel: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
      // `aria-pressed` comunica o estado do botão a leitores de tela.
      aria-pressed={visivel}
      className="grid size-10 place-items-center rounded-md text-prime-light/50 transition-colors duration-500 hover:text-prime-light"
    >
      {visivel ? (
        <EyeSlashIcon className="size-5" />
      ) : (
        <EyeIcon className="size-5" />
      )}
    </button>
  );
}

export function RegisterForm() {
  const nomeId = useId();
  const sobrenomeId = useId();
  const emailId = useId();
  const senhaId = useId();
  const confirmarId = useId();
  const aceiteId = useId();

  const router = useRouter();

  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const [estado, formAction, pending] = useActionState(
    registerUser,
    ESTADO_INICIAL,
  );

  // O React reinicia o formulário depois que a action responde, então os
  // campos voltam ao `defaultValue` — que aqui é o que o servidor devolveu.
  // As senhas não são preservadas de propósito e ficam em branco.
  const valores = estado.values;
  const erros = estado.errors;

  useEffect(() => {
    if (estado.status === "error" && estado.message) {
      toast.error(estado.message);
      return;
    }

    if (estado.status === "success") {
      // Ainda não há sessão: a conta existe no WP, mas quem autentica é o login.
      toast.success(
        "Usuário cadastrado com sucesso! Use suas credenciais para acessar.",
      );
      router.push("/login");
    }
  }, [estado, router]);

  return (
    // `noValidate`: sem isso a validação nativa do HTML5 dispara antes da
    // action e o usuário vê o balão do navegador em vez das mensagens do
    // schema. Quem valida de verdade é o servidor.
    <form noValidate action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={nomeId}
            className="font-semibold text-prime-light text-sm"
          >
            Nome
          </label>

          <IconInput
            id={nomeId}
            name="nome"
            icon={UserIcon}
            autoComplete="given-name"
            placeholder="Seu nome"
            defaultValue={valores?.nome}
            error={erros?.nome}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={sobrenomeId}
            className="font-semibold text-prime-light text-sm"
          >
            Sobrenome
          </label>

          <IconInput
            id={sobrenomeId}
            name="sobrenome"
            icon={UserIcon}
            autoComplete="family-name"
            placeholder="Seu sobrenome"
            defaultValue={valores?.sobrenome}
            error={erros?.sobrenome}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={emailId}
          className="font-semibold text-prime-light text-sm"
        >
          E-mail
        </label>

        <IconInput
          id={emailId}
          name="email"
          icon={EnvelopeSimpleIcon}
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          defaultValue={valores?.email}
          error={erros?.email}
        />

        <small className="text-prime-light/50 text-xs">
          Você usará este e-mail para entrar.
        </small>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={senhaId}
          className="font-semibold text-prime-light text-sm"
        >
          Senha
        </label>

        <IconInput
          id={senhaId}
          name="senha"
          icon={LockIcon}
          type={verSenha ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          error={erros?.senha}
          action={
            <ToggleSenha
              visivel={verSenha}
              onToggle={() => setVerSenha((atual) => !atual)}
            />
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={confirmarId}
          className="font-semibold text-prime-light text-sm"
        >
          Confirmar senha
        </label>

        <IconInput
          id={confirmarId}
          name="confirmarSenha"
          icon={LockIcon}
          type={verConfirmar ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repita a senha"
          error={erros?.confirmarSenha}
          action={
            <ToggleSenha
              visivel={verConfirmar}
              onToggle={() => setVerConfirmar((atual) => !atual)}
            />
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2.5">
          <input
            id={aceiteId}
            name="aceite"
            type="checkbox"
            defaultChecked={valores?.aceite}
            aria-invalid={Boolean(erros?.aceite)}
            className="mt-0.5 size-4 shrink-0 accent-prime-red"
          />

          <label
            htmlFor={aceiteId}
            className="text-prime-light/70 text-xs leading-relaxed"
          >
            Li e aceito a{" "}
            <a
              href="/politica-de-privacidade"
              target="_blank"
              rel="noreferrer"
              className="text-prime-light underline underline-offset-2 transition-colors duration-500 hover:text-prime-red"
            >
              política de privacidade
            </a>
            .
          </label>
        </div>

        {erros?.aceite && (
          <small role="alert" className="text-prime-red text-xs">
            {erros.aceite}
          </small>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 grid h-14 place-items-center rounded-md bg-prime-red font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-70"
      >
        {pending ? (
          <CircleNotchIcon className="size-6 animate-spin" />
        ) : (
          "Criar conta"
        )}
      </button>
    </form>
  );
}
