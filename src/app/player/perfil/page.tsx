import {
  CalendarBlankIcon,
  CrownSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Suspense } from "react";
import { twMerge } from "tailwind-merge";
import { AvatarEditor } from "@/components/pages/player/profile/avatar-editor";
import { PasswordForm } from "@/components/pages/player/profile/password-form";
import { ProfileForm } from "@/components/pages/player/profile/profile-form";
import { UpgradeButton } from "@/components/shared/player/upgrade-button";
import { getProfile } from "@/services/profile";

export const metadata: Metadata = {
  title: "Meu perfil | Prime Poker Team",
};

const longDate = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const shortDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function ProfilePage() {
  // Tudo aqui é do jogador logado: atrás do boundary, como nas outras telas
  // da área, para não prender o shell estático na requisição.
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-8 lg:px-8">
      <h1 className="font-black text-2xl text-prime-light uppercase lg:text-3xl">
        Meu perfil
      </h1>

      <Suspense fallback={<Skeleton />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  const profile = await getProfile();

  return (
    <>
      <section className="flex flex-col items-center gap-6 rounded-xl border border-white/10 bg-white/3 p-6 sm:flex-row sm:items-start">
        <AvatarEditor name={profile.name} avatarUrl={profile.avatarUrl} />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <strong className="font-black text-2xl text-prime-light uppercase">
              {profile.name}
            </strong>

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

          <p className="mt-2 flex items-center justify-center gap-1.5 text-prime-light/60 text-sm sm:justify-start">
            <CalendarBlankIcon className="size-4" aria-hidden="true" />
            Membro desde {longDate.format(new Date(profile.memberSince))}
          </p>

          {/* O vencimento só aparece quando existe. Hoje os planos não vencem
              — quem muda o tier é a equipe, pelo painel —, então mostrar um
              "sem vencimento" fixo seria ruído. O campo já está pronto para o
              dia em que houver cobrança recorrente. */}
          <p className="mt-1 text-prime-light/60 text-sm">
            {profile.expiresAt
              ? `Plano válido até ${shortDate.format(new Date(profile.expiresAt))}`
              : "Para mudar de plano, peça o upgrade à equipe."}
          </p>

          <div className="mt-4 flex justify-center sm:justify-start">
            <UpgradeButton />
          </div>
        </div>
      </section>

      <Card
        title="Dados e contato"
        description="É por aqui que a equipe fala com você."
      >
        <ProfileForm profile={profile} />
      </Card>

      <Card
        title="Senha"
        description="Troque quando quiser. Esqueceu a atual? Saia e use “esqueci minha senha”."
      >
        <PasswordForm />
      </Card>
    </>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/3">
      <header className="border-white/10 border-b px-5 py-4">
        <h2 className="font-bold text-prime-light text-sm uppercase tracking-wide">
          {title}
        </h2>
        <p className="mt-0.5 text-prime-light/50 text-xs">{description}</p>
      </header>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      {["h-44", "h-96", "h-60"].map((height) => (
        <div
          key={height}
          className={`animate-pulse rounded-xl border border-white/10 bg-white/3 ${height}`}
        />
      ))}
    </div>
  );
}
