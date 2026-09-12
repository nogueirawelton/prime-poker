"use client";

import { PaperPlaneRightIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useActionState, useEffect, useId, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { type ComentarioState, comentar } from "@/actions/comments";

/**
 * Formulário de comentário.
 *
 * Serve tanto ao campo principal quanto às respostas: o que muda é o `parent`
 * enviado à mutation e a densidade do layout.
 */
export function CommentForm({
  postId,
  parentId = null,
  compacto = false,
  onEnviado,
}: {
  postId: number;
  /** Id do comentário respondido; nulo para um comentário novo. */
  parentId?: string | null;
  compacto?: boolean;
  onEnviado?: () => void;
}) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);

  // `bind` leva post e pai ao servidor sem campos escondidos no formulário —
  // um input hidden seria editável pelo cliente.
  const [estado, action, pendente] = useActionState<ComentarioState, FormData>(
    comentar.bind(null, postId, parentId),
    {},
  );

  const enviado = Boolean(estado.ok || estado.moderacao);

  useEffect(() => {
    if (!enviado) return;

    form.current?.reset();
    onEnviado?.();
  }, [enviado, onEnviado]);

  if (enviado) {
    return (
      <p
        role="status"
        className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-prime-light text-sm"
      >
        {estado.moderacao
          ? "Comentário enviado. Ele aparece aqui assim que for aprovado."
          : "Comentário publicado. Obrigado por participar!"}
      </p>
    );
  }

  return (
    <form
      ref={form}
      action={action}
      className={twMerge(
        "flex flex-col gap-3",
        compacto ? "mt-4" : "rounded-xl border border-white/10 bg-white/3 p-5",
      )}
    >
      {!compacto && (
        <strong className="font-bold text-prime-light">
          Deixe seu comentário
        </strong>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo
          id={`${id}-nome`}
          name="nome"
          placeholder="Seu nome"
          erro={estado.fieldErrors?.nome?.[0]}
          rotulo="Nome"
        />

        <Campo
          id={`${id}-email`}
          name="email"
          type="email"
          placeholder="Seu e-mail (não publicado)"
          erro={estado.fieldErrors?.email?.[0]}
          rotulo="E-mail"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-texto`} className="sr-only">
          Comentário
        </label>

        <textarea
          id={`${id}-texto`}
          name="texto"
          rows={compacto ? 3 : 4}
          maxLength={2000}
          placeholder={
            parentId ? "Escreva sua resposta..." : "Escreva seu comentário..."
          }
          aria-invalid={Boolean(estado.fieldErrors?.texto)}
          className="resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60"
        />

        {estado.fieldErrors?.texto?.[0] && (
          <small role="alert" className="text-prime-red text-xs">
            {estado.fieldErrors.texto[0]}
          </small>
        )}
      </div>

      {/* Isca para robôs: escondida do olho e do leitor de tela, mas
          preenchida por quem só lê o HTML. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-prime-light/40 text-xs">
          Seu e-mail não é publicado.
        </p>

        <button
          type="submit"
          disabled={pendente}
          className="flex h-11 items-center gap-2 rounded-md bg-prime-red px-5 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-60"
        >
          {pendente ? (
            <SpinnerGapIcon className="size-4 animate-spin" />
          ) : (
            <PaperPlaneRightIcon className="size-4" weight="fill" />
          )}
          {parentId ? "Responder" : "Comentar"}
        </button>
      </div>

      {estado.error && (
        <small role="alert" className="text-prime-red text-xs">
          {estado.error}
        </small>
      )}
    </form>
  );
}

function Campo({
  id,
  rotulo,
  erro,
  ...props
}: React.ComponentProps<"input"> & { rotulo: string; erro?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="sr-only">
        {rotulo}
      </label>

      <input
        {...props}
        id={id}
        aria-invalid={Boolean(erro)}
        className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60"
      />

      {erro && (
        <small role="alert" className="text-prime-red text-xs">
          {erro}
        </small>
      )}
    </div>
  );
}
