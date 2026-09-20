"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { FIELD_CLASS } from "./field";

/**
 * Campo de senha com o olhinho de "mostrar".
 *
 * Ver o que se digitou é o que evita o erro mais comum aqui — a senha nova
 * digitada errada duas vezes, que só aparece depois do envio. O campo nasce
 * escondido: mostrar é uma escolha de quem está na frente da tela.
 *
 * O botão fica `tabIndex={-1}` de propósito: no teclado, o caminho natural é
 * de um campo de senha para o próximo, e não parar num botão de exibição.
 */
export function PasswordField({
  id,
  name,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  autoComplete: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className={`${FIELD_CLASS} pr-12`}
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((shown) => !shown)}
        aria-label={visible ? "Esconder a senha" : "Mostrar a senha"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-prime-light/40 transition-colors duration-500 hover:text-prime-light"
      >
        {visible ? (
          <EyeSlashIcon className="size-5" aria-hidden="true" />
        ) : (
          <EyeIcon className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
