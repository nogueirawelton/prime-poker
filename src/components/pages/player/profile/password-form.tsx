"use client";

import { useActionState, useEffect, useRef } from "react";
import { type ProfileState, savePassword } from "@/actions/profile";
import { Field } from "./field";
import { PasswordField } from "./password-field";
import { Footer } from "./profile-form";

/**
 * Troca de senha.
 *
 * Pede a senha atual porque o token do jogador vive num cookie: sem essa
 * conferência, quem pegasse o cookie trocaria a senha e ficaria com a conta.
 * Quem esqueceu a senha continua indo pelo "esqueci minha senha", que confere
 * o e-mail.
 */
export function PasswordForm() {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    savePassword,
    {},
  );

  // Senha salva, campos limpos: deixá-los preenchidos na tela depois do
  // sucesso é convite para um segundo envio sem querer.
  useEffect(() => {
    if (state.success && !pending) form.current?.reset();
  }, [state.success, pending]);

  return (
    <form ref={form} action={action} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Senha atual" htmlFor="perfil-senha-atual">
          <PasswordField
            id="perfil-senha-atual"
            name="currentPassword"
            autoComplete="current-password"
          />
        </Field>

        <Field label="Nova senha" htmlFor="perfil-senha-nova">
          <PasswordField
            id="perfil-senha-nova"
            name="newPassword"
            autoComplete="new-password"
            minLength={8}
          />
        </Field>

        <Field label="Repetir a nova senha" htmlFor="perfil-senha-confirmar">
          <PasswordField
            id="perfil-senha-confirmar"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
          />
        </Field>
      </div>

      <Footer state={state} pending={pending} label="Trocar senha" />
    </form>
  );
}
