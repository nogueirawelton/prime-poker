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

const INITIAL_STATE: RegisterState = { status: "idle" };

/** Botão de mostrar/ocultar reaproveitado pelos dois campos de senha. */
function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
  );
}

export function RegisterForm() {
  const nameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const acceptTermsId = useId();

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, formAction, pending] = useActionState(
    registerUser,
    INITIAL_STATE,
  );

  // O React reinicia o formulário depois que a action responde, então os
  // campos voltam ao `defaultValue` — que aqui é o que o servidor devolveu.
  // As senhas não são preservadas de propósito e ficam em branco.
  const values = state.values;
  const errors = state.errors;

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
      return;
    }

    if (state.status === "success") {
      // Ainda não há sessão: a conta existe no WP, mas quem autentica é o login.
      toast.success(
        "Usuário cadastrado com sucesso! Use suas credenciais para acessar.",
      );
      router.push("/login");
    }
  }, [state, router]);

  return (
    // `noValidate`: sem isso a validação nativa do HTML5 dispara antes da
    // action e o usuário vê o balão do navegador em vez das mensagens do
    // schema. Quem valida de verdade é o servidor.
    <form noValidate action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={nameId}
            className="font-semibold text-prime-light text-sm"
          >
            Nome
          </label>

          <IconInput
            id={nameId}
            name="name"
            icon={UserIcon}
            autoComplete="given-name"
            placeholder="Seu nome"
            defaultValue={values?.name}
            error={errors?.name}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={lastNameId}
            className="font-semibold text-prime-light text-sm"
          >
            Sobrenome
          </label>

          <IconInput
            id={lastNameId}
            name="lastName"
            icon={UserIcon}
            autoComplete="family-name"
            placeholder="Seu sobrenome"
            defaultValue={values?.lastName}
            error={errors?.lastName}
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
          defaultValue={values?.email}
          error={errors?.email}
        />

        <small className="text-prime-light/50 text-xs">
          Você usará este e-mail para entrar.
        </small>
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
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          error={errors?.password}
          action={
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
            />
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={confirmId}
          className="font-semibold text-prime-light text-sm"
        >
          Confirmar senha
        </label>

        <IconInput
          id={confirmId}
          name="confirmPassword"
          icon={LockIcon}
          type={showConfirm ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repita a senha"
          error={errors?.confirmPassword}
          action={
            <PasswordToggle
              visible={showConfirm}
              onToggle={() => setShowConfirm((current) => !current)}
            />
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2.5">
          <input
            id={acceptTermsId}
            name="acceptTerms"
            type="checkbox"
            defaultChecked={values?.acceptTerms}
            aria-invalid={Boolean(errors?.acceptTerms)}
            className="mt-0.5 size-4 shrink-0 accent-prime-red"
          />

          <label
            htmlFor={acceptTermsId}
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

        {errors?.acceptTerms && (
          <small role="alert" className="text-prime-red text-xs">
            {errors.acceptTerms}
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
