"use client";

import {
  CircleNotchIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
} from "@phosphor-icons/react";
import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "react-toastify";
import { type LoginState, login } from "@/actions/auth";
import { IconInput } from "@/components/ui/form/icon-input";
import { PasswordRecoveryDialog } from "./password-recovery-dialog";

const INITIAL_STATE: LoginState = {};

export function LoginForm() {
  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const [visible, setVisible] = useState(false);

  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    // `noValidate`: sem isso a validação nativa do HTML5 dispara antes da
    // action e o usuário vê o balão do navegador em vez das mensagens do
    // schema. Quem valida de verdade é o servidor.
    <form noValidate action={formAction} className="flex flex-col gap-4">
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
          defaultValue={state.email}
          error={state.fieldErrors?.email?.[0]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={passwordId}
          className="font-semibold text-prime-light text-sm"
        >
          Senha
        </label>

        <IconInput
          id={passwordId}
          name="password"
          icon={LockIcon}
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Sua senha"
          error={state.fieldErrors?.password?.[0]}
          action={
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
              // `aria-pressed` comunica o estado do botão a leitores de tela.
              aria-pressed={visible}
              className="grid size-10 place-items-center rounded-md text-prime-light/50 transition-colors duration-500 hover:text-prime-light"
            >
              {visible ? (
                <EyeSlashIcon className="size-5" />
              ) : (
                <EyeIcon className="size-5" />
              )}
            </button>
          }
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor={rememberId}
          className="flex items-center gap-2 text-prime-light/70 text-xs"
        >
          <input
            id={rememberId}
            name="remember"
            type="checkbox"
            className="size-4 shrink-0 accent-prime-red"
          />
          Continuar conectado
        </label>

        <PasswordRecoveryDialog>
          <button
            type="button"
            className="text-prime-light/70 text-xs underline underline-offset-2 transition-colors duration-500 hover:text-prime-light"
          >
            Esqueci minha senha
          </button>
        </PasswordRecoveryDialog>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 grid h-14 place-items-center rounded-md bg-prime-red font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-70"
      >
        {pending ? (
          <CircleNotchIcon className="size-6 animate-spin" />
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
}
