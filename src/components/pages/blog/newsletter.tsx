"use client";

import { CheckCircleIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { Chip } from "@/icons/chip";

type Status = "idle" | "loading" | "done";

export function Newsletter() {
  const emailId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    // TODO: plugar no provedor real (Mailchimp/Brevo/CF7). Mockado por ora.
    await new Promise((resolve) => setTimeout(resolve, 700));

    setStatus("done");
    setEmail("");
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-prime-darkgray px-6 py-10 lg:px-12 lg:py-14">
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

        {status === "done" ? (
          <p className="flex items-center gap-2 font-semibold text-prime-light">
            <CheckCircleIcon className="size-6 text-prime-red" weight="fill" />
            Inscrição confirmada. Boa sorte nas mesas!
          </p>
        ) : (
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
        )}
      </div>
    </section>
  );
}
