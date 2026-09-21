"use client";

import { CheckCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { useActionState, useState } from "react";
import { type ProfileState, saveProfile } from "@/actions/profile";
import { PhoneInput } from "@/components/ui/form/phone-input";
import type { Profile } from "@/services/profile";
import { FIELD_CLASS, Field } from "./field";

/**
 * Dados e contato do jogador.
 *
 * O nome de usuário fica de fora de propósito: é com ele que o jogador entra
 * no site, e deixá-lo editável aqui seria a maneira mais fácil de alguém
 * perder o próprio login sem perceber.
 */
export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    saveProfile,
    {},
  );

  // O `react-phone-input-2` é controlado e escreve o número já mascarado no
  // input que ele renderiza — "+55 (11) 99999-9999". O que o servidor espera
  // são só os dígitos, que é o que o `onValueChange` entrega; por isso o
  // valor viaja num campo escondido, e não no campo que aparece na tela.
  const [phone, setPhone] = useState(profile.phone);

  // O campo nasce com o DDI ("55") mesmo sem ninguém digitar nada. Só isso não
  // é um telefone: mandado assim, seria recusado como número inválido em vez
  // de ser entendido como "não informei". Por isso ele viaja vazio.
  const submittedPhone = phone.length > 2 ? phone : "";

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" htmlFor="perfil-nome">
          <input
            id="perfil-nome"
            name="name"
            required
            maxLength={80}
            defaultValue={profile.name}
            className={FIELD_CLASS}
          />
        </Field>

        <Field label="E-mail" htmlFor="perfil-email">
          <input
            id="perfil-email"
            name="email"
            type="email"
            required
            defaultValue={profile.email}
            className={FIELD_CLASS}
          />
        </Field>

        <Field label="WhatsApp" htmlFor="perfil-whatsapp">
          <input type="hidden" name="phone" value={submittedPhone} />

          <PhoneInput
            id="perfil-whatsapp"
            value={phone}
            onValueChange={setPhone}
            className="!h-12 !rounded-lg !bg-transparent !text-prime-light !text-sm"
            containerClass="!rounded-lg !border !border-white/10 !bg-white/3"
            buttonClass="!rounded-l-lg"
          />
        </Field>

        <Field label="Onde você mora" htmlFor="perfil-cidade">
          <input
            id="perfil-cidade"
            name="city"
            maxLength={80}
            defaultValue={profile.city}
            placeholder="Cidade, estado"
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <Field label="Sobre você" htmlFor="perfil-bio">
        <textarea
          id="perfil-bio"
          name="bio"
          rows={4}
          maxLength={600}
          defaultValue={profile.bio}
          placeholder="Há quanto tempo joga, o que quer melhorar, onde costuma jogar..."
          className={`${FIELD_CLASS} h-auto resize-none py-3`}
        />
      </Field>

      <Footer state={state} pending={pending} label="Salvar alterações" />
    </form>
  );
}

/**
 * Rodapé compartilhado pelos dois formulários do perfil: erro à esquerda,
 * botão à direita. O retorno mora ao lado do botão porque é ali que o olho
 * está quando o envio termina.
 */
export function Footer({
  state,
  pending,
  label,
}: {
  state: ProfileState;
  pending: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4">
      {state.error && (
        <small role="alert" className="mr-auto text-prime-red text-sm">
          {state.error}
        </small>
      )}

      {state.success && !pending && (
        <small
          role="status"
          className="mr-auto flex items-center gap-1.5 text-emerald-400 text-sm"
        >
          <CheckCircleIcon className="size-4" weight="fill" />
          Salvo.
        </small>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 items-center justify-center gap-2 rounded-md bg-prime-red px-6 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-60"
      >
        {pending && <CircleNotchIcon className="size-4 animate-spin" />}
        {label}
      </button>
    </div>
  );
}
