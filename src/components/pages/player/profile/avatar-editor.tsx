"use client";

import { CameraIcon, CircleNotchIcon, TrashIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { deleteAvatar, type ProfileState, saveAvatar } from "@/actions/profile";
import { initials } from "@/utils/initials";

/**
 * Foto de perfil: trocar e remover.
 *
 * O envio acontece na hora em que o jogador escolhe o arquivo, sem um botão
 * "salvar" próprio: escolher a foto já é a confirmação, e um segundo passo só
 * criaria o estado "escolhi mas não salvei" — que sempre acaba em foto que o
 * jogador jura ter trocado e não trocou.
 *
 * Sem foto, ficam as iniciais do nome. Gravatar não serve para este público:
 * quase ninguém tem.
 */
export function AvatarEditor({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [state, action, uploading] = useActionState<ProfileState, FormData>(
    saveAvatar,
    {},
  );
  const [removing, startRemove] = useTransition();
  const form = useRef<HTMLFormElement>(null);

  const busy = uploading || removing;

  // Limpa o campo depois do envio: sem isso, escolher o MESMO arquivo de novo
  // (depois de um erro, por exemplo) não dispara `change` e nada acontece.
  useEffect(() => {
    if (!uploading && input.current) input.current.value = "";
  }, [uploading]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={96}
            height={96}
            className="size-24 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-24 items-center justify-center rounded-full bg-prime-red/15 font-black text-2xl text-prime-red">
            {initials(name)}
          </span>
        )}

        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-prime-dark/70">
            <CircleNotchIcon className="size-6 animate-spin text-prime-light" />
          </span>
        )}
      </div>

      <form ref={form} action={action} className="flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-prime-light/80 text-xs transition-colors duration-500 hover:border-prime-red hover:text-prime-red">
          <CameraIcon className="size-4" weight="bold" aria-hidden="true" />
          {avatarUrl ? "Trocar foto" : "Enviar foto"}

          <input
            ref={input}
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            className="sr-only"
            onChange={() => form.current?.requestSubmit()}
          />
        </label>

        {avatarUrl && (
          <button
            type="button"
            disabled={busy}
            onClick={() => startRemove(() => void deleteAvatar())}
            className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-prime-light/60 text-xs transition-colors duration-500 hover:border-prime-red hover:text-prime-red disabled:opacity-60"
          >
            <TrashIcon className="size-4" aria-hidden="true" />
            Remover
          </button>
        )}
      </form>

      {state.error && (
        <small role="alert" className="text-center text-prime-red text-xs">
          {state.error}
        </small>
      )}

      <small className="text-center text-prime-light/40 text-xs">
        JPG, PNG ou WebP, até 20 MB.
      </small>
    </div>
  );
}
