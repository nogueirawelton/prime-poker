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
import { type RedefinirSenhaState, redefinirSenha } from "@/actions/auth";
import { IconInput } from "@/components/ui/form/icon-input";
import { PasswordRecoveryDialog } from "./password-recovery-dialog";

const ESTADO_INICIAL: RedefinirSenhaState = { status: "idle" };

export function ResetPasswordForm({
  chave,
  login,
}: {
  chave: string;
  login: string;
}) {
  const senhaId = useId();
  const confirmarId = useId();
  const router = useRouter();

  const [visivel, setVisivel] = useState(false);
  const [estado, formAction, pending] = useActionState(
    redefinirSenha,
    ESTADO_INICIAL,
  );

  useEffect(() => {
    if (estado.status === "error" && estado.message && !estado.linkInvalido) {
      toast.error(estado.message);
    }

    if (estado.status === "success") {
      toast.success("Senha redefinida! Entre com a nova senha.");
      router.push("/login");
    }
  }, [estado, router]);

  // Sem chave na URL não há o que redefinir: o formulário só levaria a um erro.
  if (!chave || !login || estado.linkInvalido) {
    return (
      <LinkInvalido
        mensagem={
          estado.message ??
          "Este link está incompleto. Peça um novo para redefinir a senha."
        }
      />
    );
  }

  const toggle = (
    <button
      type="button"
      onClick={() => setVisivel((atual) => !atual)}
      aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
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

  return (
    // `noValidate`: quem valida é o servidor, com as mensagens do schema.
    <form noValidate action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="key" value={chave} />
      <input type="hidden" name="login" value={login} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={senhaId}
          className="font-semibold text-prime-light text-sm"
        >
          Nova senha
        </label>

        <IconInput
          id={senhaId}
          name="senha"
          icon={LockIcon}
          type={visivel ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          error={estado.errors?.senha}
          action={toggle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={confirmarId}
          className="font-semibold text-prime-light text-sm"
        >
          Confirmar nova senha
        </label>

        <IconInput
          id={confirmarId}
          name="confirmarSenha"
          icon={LockIcon}
          type={visivel ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repita a senha"
          error={estado.errors?.confirmarSenha}
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

function LinkInvalido({ mensagem }: { mensagem: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-prime-red/40 bg-prime-red/5 p-6 text-center">
      <WarningCircleIcon className="size-10 text-prime-red" weight="fill" />

      <p className="text-prime-light/80 text-sm">{mensagem}</p>

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
