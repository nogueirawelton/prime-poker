"use client";

import { PaperPlaneRightIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useActionState, useEffect, useId, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { type CommentState, postComment } from "@/actions/comments";

/**
 * Formulário de comentário.
 *
 * Serve tanto ao campo principal quanto às respostas: o que muda é o `parent`
 * enviado à mutation e a densidade do layout.
 */
export function CommentForm({
  postId,
  parentId = null,
  compact = false,
  onSubmitted,
}: {
  postId: number;
  /** Id do comentário respondido; nulo para um comentário novo. */
  parentId?: string | null;
  compact?: boolean;
  onSubmitted?: () => void;
}) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);

  // `bind` leva post e pai ao servidor sem campos escondidos no formulário —
  // um input hidden seria editável pelo cliente.
  const [state, action, pending] = useActionState<CommentState, FormData>(
    postComment.bind(null, postId, parentId),
    {},
  );

  const submitted = Boolean(state.ok || state.moderation);

  useEffect(() => {
    if (!submitted) return;

    form.current?.reset();
    onSubmitted?.();
  }, [submitted, onSubmitted]);

  if (submitted) {
    return (
      <p
        role="status"
        className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-prime-light text-sm"
      >
        {state.moderation
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
        compact ? "mt-4" : "rounded-xl border border-white/10 bg-white/3 p-5",
      )}
    >
      {!compact && (
        <strong className="font-bold text-prime-light">
          Deixe seu comentário
        </strong>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          id={`${id}-name`}
          name="name"
          placeholder="Seu nome"
          error={state.fieldErrors?.name?.[0]}
          label="Nome"
        />

        <Field
          id={`${id}-email`}
          name="email"
          type="email"
          placeholder="Seu e-mail (não publicado)"
          error={state.fieldErrors?.email?.[0]}
          label="E-mail"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-text`} className="sr-only">
          Comentário
        </label>

        <textarea
          id={`${id}-text`}
          name="text"
          rows={compact ? 3 : 4}
          maxLength={2000}
          placeholder={
            parentId ? "Escreva sua resposta..." : "Escreva seu comentário..."
          }
          aria-invalid={Boolean(state.fieldErrors?.text)}
          className="resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60"
        />

        {state.fieldErrors?.text?.[0] && (
          <small role="alert" className="text-prime-red text-xs">
            {state.fieldErrors.text[0]}
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
          disabled={pending}
          className="flex h-11 items-center gap-2 rounded-md bg-prime-red px-5 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-60"
        >
          {pending ? (
            <SpinnerGapIcon className="size-4 animate-spin" />
          ) : (
            <PaperPlaneRightIcon className="size-4" weight="fill" />
          )}
          {parentId ? "Responder" : "Comentar"}
        </button>
      </div>

      {state.error && (
        <small role="alert" className="text-prime-red text-xs">
          {state.error}
        </small>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  error,
  ...props
}: React.ComponentProps<"input"> & { label: string; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60"
      />

      {error && (
        <small role="alert" className="text-prime-red text-xs">
          {error}
        </small>
      )}
    </div>
  );
}
