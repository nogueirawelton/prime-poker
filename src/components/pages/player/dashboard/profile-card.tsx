import {
  CalendarBlankIcon,
  CrownSimpleIcon,
  EnvelopeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { twMerge } from "tailwind-merge";
import type { Profile } from "@/services/profile";
import { initials } from "@/utils/initials";

const longDate = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const shortDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Identificação do jogador: quem é, qual o plano e até quando. */
export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <section className="flex flex-wrap items-center gap-6 rounded-xl border border-white/10 bg-white/3 p-6">
      <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-prime-red/15 font-black text-2xl text-prime-red">
        {initials(profile.name)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-black text-2xl text-prime-light uppercase lg:text-3xl">
            {profile.name}
          </h1>

          {profile.tier && (
            <span
              className={twMerge(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 font-bold text-[11px] uppercase",
                profile.tier.color,
              )}
            >
              <CrownSimpleIcon className="size-3.5" weight="fill" />
              {profile.tier.label}
            </span>
          )}
        </div>

        {/* Quem se cadastra pelo site tem o e-mail como usuário: repetir o
            mesmo endereço logo abaixo só polui o card. */}
        {profile.username !== profile.email && (
          <p className="mt-1 text-prime-light/50 text-sm">
            @{profile.username}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-prime-light/60 text-sm">
          <span className="flex items-center gap-1.5">
            <EnvelopeIcon className="size-4" aria-hidden="true" />
            {profile.email}
          </span>

          <span className="flex items-center gap-1.5">
            <CalendarBlankIcon className="size-4" aria-hidden="true" />
            Membro desde {longDate.format(new Date(profile.memberSince))}
          </span>
        </div>
      </div>

      {profile.expiresAt && (
        <div className="rounded-lg border border-white/10 px-4 py-3 text-center">
          <span className="block text-[11px] text-prime-light/50 uppercase tracking-wide">
            Plano válido até
          </span>
          <strong className="mt-0.5 block font-bold text-lg text-prime-light">
            {shortDate.format(new Date(profile.expiresAt))}
          </strong>
        </div>
      )}
    </section>
  );
}
