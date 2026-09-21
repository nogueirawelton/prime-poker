"use client";

import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { Chip } from "@/icons/chip";
import { wp } from "@/providers/wp";
import { getUtmParams } from "@/utils/utm";

/** Formulário de newsletter no Contact Form 7. */
const FORM_ID = "1016";

type Status = "idle" | "loading";

export function Newsletter() {
  const emailId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    // A newsletter fecha toda página do blog, então tudo que ela importa
    // entra no bundle de todas elas. O react-toastify (~42 KB) só é baixado
    // aqui, no envio — quem apenas lê o artigo nunca paga por ele.
    const { toast } = await import("react-toastify");

    try {
      // O `wp()` já lança quando o Contact Form 7 recusa o envio.
      await wp(FORM_ID, { email, ...getUtmParams() });

      toast.success("Inscrição confirmada. Boa sorte nas mesas!");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a inscrição.",
      );
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-800 px-6 py-10 lg:px-12 lg:py-14">
      <Chip className="absolute -right-10 -bottom-16 size-64 text-prime-light/5" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="font-black text-2xl text-prime-light uppercase lg:text-3xl">
            Receba as análises <span className="text-prime-red">antes</span>
          </h2>
          <p className="mt-2 text-prime-light/70 text-sm lg:text-base">
            Um e-mail por semana com estratégia, mindset e os bastidores do
            time. Sem spam — cancele quando quiser.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <label htmlFor={emailId} className="sr-only">
            Seu melhor e-mail
          </label>

          <input
            id={emailId}
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            className="h-14 flex-1 rounded-md border border-white/10 bg-white/5 px-4 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex h-14 items-center justify-center gap-2 rounded-md bg-prime-red px-6 font-semibold text-prime-light text-sm uppercase transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-60"
          >
            {status === "loading" ? (
              "Enviando..."
            ) : (
              <>
                Assinar
                <PaperPlaneTiltIcon className="size-5" weight="bold" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
