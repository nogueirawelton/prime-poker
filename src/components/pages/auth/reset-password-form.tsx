"use client";

import {
  CircleNotchIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "react-toastify";
import { type ResetPasswordState, resetPassword } from "@/actions/auth";
import { IconInput } from "@/components/ui/form/icon-input";
import { PasswordRecoveryDialog } from "./password-recovery-dialog";

const INITIAL_STATE: ResetPasswordState = { status: "idle" };

export function ResetPasswordForm({
  resetKey,
  login,
}: {
  resetKey: string;
  login: string;
}) {
  const passwordId = useId();
  const confirmId = useId();
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [state, formAction, pending] = useActionState(
    resetPassword,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.status === "error" && state.message && !state.invalidLink) {
      toast.error(state.message);
    }

    if (state.status === "success") {
      toast.success("Senha redefinida! Entre com a nova senha.");
      router.push("/login");
    }
  }, [state, router]);

  // Sem chave na URL não há o que redefinir: o formulário só levaria a um erro.
  if (!resetKey || !login || state.invalidLink) {
    return (
      <InvalidLink
        message={
          state.message ??
          "Este link está incompleto. Peça um novo para redefinir a senha."
        }
      />
    );
  }

  const toggle = (
    <button
      type="button"
      onClick={() => setVisible((current) => !current)}
      aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      aria-pressed={visible}
      className="grid size-10 place-items-center rounded-md text-prime-light/50 transition-colors duration-500 hover:text-prime-light"
    >
      {visible ? (
        <EyeSlashIcon className="size-5" />
      ) : (
        <EyeIcon className="size-5" />
      )}
    </button>
  );

  return (
    // `noValidate`: quem valida é o servidor, com as mensagens do schema.
    <form noValidate action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="key" value={resetKey} />
      <input type="hidden" name="login" value={login} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={passwordId}
          className="font-semibold text-prime-light text-sm"
        >
          Nova senha
        </label>

        <IconInput
          id={passwordId}
          name="password"
          icon={LockIcon}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          error={state.errors?.password}
          action={toggle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={confirmId}
          className="font-semibold text-prime-light text-sm"
        >
          Confirmar nova senha
        </label>

        <IconInput
          id={confirmId}
          name="confirmPassword"
          icon={LockIcon}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repita a senha"
          error={state.errors?.confirmPassword}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 grid h-14 place-items-center rounded-md bg-prime-red font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-70"
      >
        {pending ? (
          <CircleNotchIcon className="size-6 animate-spin" />
        ) : (
          "Salvar nova senha"
        )}
      </button>
    </form>
  );
}

function InvalidLink({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-prime-red/40 bg-prime-red/5 p-6 text-center">
      <WarningCircleIcon className="size-10 text-prime-red" weight="fill" />

      <p className="text-prime-light/80 text-sm">{message}</p>

      <PasswordRecoveryDialog>
        <button
          type="button"
          className="grid h-12 w-full place-items-center rounded-md bg-prime-red font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-red"
        >
          Pedir um novo link
        </button>
      </PasswordRecoveryDialog>
    </div>
  );
}
