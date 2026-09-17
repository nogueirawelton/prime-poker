import {
  CalendarBlankIcon,
  CrownSimpleIcon,
  EnvelopeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { twMerge } from "tailwind-merge";
import type { Perfil } from "@/services/perfil";
import { iniciais } from "@/utils/iniciais";

const dataLonga = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const dataCurta = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Identificação do jogador: quem é, qual o plano e até quando. */
export function PerfilCard({ perfil }: { perfil: Perfil }) {
  return (
    <section className="flex flex-wrap items-center gap-6 rounded-xl border border-white/10 bg-white/3 p-6">
      <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-prime-red/15 font-black text-2xl text-prime-red">
        {iniciais(perfil.nome)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-black text-2xl text-prime-light uppercase lg:text-3xl">
            {perfil.nome}
          </h1>

          {perfil.tier && (
            <span
              className={twMerge(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 font-bold text-[11px] uppercase",
                perfil.tier.cor,
              )}
            >
              <CrownSimpleIcon className="size-3.5" weight="fill" />
              {perfil.tier.label}
            </span>
          )}
        </div>

        {/* Quem se cadastra pelo site tem o e-mail como usuário: repetir o
            mesmo endereço logo abaixo só polui o card. */}
        {perfil.usuario !== perfil.email && (
          <p className="mt-1 text-prime-light/50 text-sm">@{perfil.usuario}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-prime-light/60 text-sm">
          <span className="flex items-center gap-1.5">
            <EnvelopeIcon className="size-4" aria-hidden="true" />
            {perfil.email}
          </span>

          <span className="flex items-center gap-1.5">
            <CalendarBlankIcon className="size-4" aria-hidden="true" />
            Membro desde {dataLonga.format(new Date(perfil.membroDesde))}
          </span>
        </div>
      </div>

      {perfil.expiraEm && (
        <div className="rounded-lg border border-white/10 px-4 py-3 text-center">
          <span className="block text-[11px] text-prime-light/50 uppercase tracking-wide">
            Plano válido até
          </span>
          <strong className="mt-0.5 block font-bold text-lg text-prime-light">
            {dataCurta.format(new Date(perfil.expiraEm))}
          </strong>
        </div>
      )}
    </section>
  );
}
