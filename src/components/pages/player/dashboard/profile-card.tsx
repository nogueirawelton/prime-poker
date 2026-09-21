import {
  CalendarBlankIcon,
  CrownSimpleIcon,
  EnvelopeIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
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
    // Duas colunas em vez de uma fileira que quebra: identidade à esquerda,
    // ações à direita. Com `flex-wrap`, o "Editar perfil" caía na linha de
    // baixo no celular e se enfiava entre o nome e os contatos.
    <section className="flex flex-col gap-5 rounded-xl border border-white/10 bg-white/3 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt=""
            width={80}
            height={80}
            className="size-16 shrink-0 rounded-full object-cover sm:size-20"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-prime-red/15 font-black text-prime-red text-xl sm:size-20 sm:text-2xl">
            {initials(profile.name)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-black text-prime-light text-xl uppercase sm:text-2xl lg:text-3xl">
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
            <p className="mt-1 truncate text-prime-light/50 text-sm">
              @{profile.username}
            </p>
          )}

          <div className="mt-3 flex flex-col gap-1 text-prime-light/60 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            {/* `min-w-0` + `truncate`: e-mail longo cortava o card no
                celular em vez de caber nele. */}
            <span className="flex min-w-0 items-center gap-1.5">
              <EnvelopeIcon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{profile.email}</span>
            </span>

            <span className="flex items-center gap-1.5">
              <CalendarBlankIcon
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              Membro desde {longDate.format(new Date(profile.memberSince))}
            </span>
          </div>
        </div>
      </div>

      {/* Coluna das ações: embaixo no celular, à direita a partir de sm. */}
      <div className="flex shrink-0 flex-col gap-3 sm:items-end">
        <Link
          href="/player/perfil"
          className="flex items-center justify-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-prime-light/70 text-xs transition-colors duration-500 hover:border-prime-red hover:text-prime-red"
        >
          <PencilSimpleIcon className="size-4" aria-hidden="true" />
          Editar perfil
        </Link>

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
      </div>
    </section>
  );
}
