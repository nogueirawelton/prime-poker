import {
  EnvelopeIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PhoneIcon,
  XLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { ManagePreferencesButton } from "@/components/shared/consent";
import { SectionLinks } from "./section-links";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com/primepokerteam",
    Icon: InstagramLogoIcon,
  },
  { label: "Facebook", href: "#", Icon: FacebookLogoIcon },
  { label: "X", href: "#", Icon: XLogoIcon },
  { label: "YouTube", href: "#", Icon: YoutubeLogoIcon },
];

const LINK = "transition-colors duration-500 hover:text-prime-red";

/**
 * Avaliado no escopo do módulo, não no render: sob Cache Components ler o
 * relógio durante a renderização quebra o prerender. Fica congelado no build,
 * o que é aceitável para o ano do copyright.
 */
const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-white/10 border-t bg-prime-dark">
      <div className="mx-auto flex max-w-screen-2xl justify-between gap-12 px-4 py-16 lg:px-8">
        <div className="max-w-sm">
          <Link href="/" aria-label="Prime Poker Team — início">
            <Image
              src="/img/logo.svg"
              width={250}
              height={53}
              alt="Prime Poker Team"
            />
          </Link>

          <p className="mt-6 text-prime-light/70 text-sm leading-relaxed">
            A equipe mais vencedora do poker brasileiro, transformando jogadores
            em campeões desde 2018.
          </p>

          <div className="mt-8 flex gap-4 text-prime-light/70">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                // `noreferrer` junto de `noopener`: sem ele o destino recebe
                // o referrer e, em navegadores antigos, acesso a window.opener.
                rel="noopener noreferrer"
                aria-label={`Prime Poker Team no ${label}`}
              >
                <Icon
                  className="size-7 transition-colors duration-500 hover:text-prime-red"
                  weight="fill"
                />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <nav aria-label="Navegação do site">
            <strong className="font-bold text-prime-light text-sm uppercase">
              Navegue
            </strong>
            <SectionLinks />
          </nav>

          <nav aria-label="Conteúdo e conta">
            <strong className="font-bold text-prime-light text-sm uppercase">
              Conteúdo
            </strong>

            <ul className="mt-4 flex flex-col gap-2 text-prime-light/70 text-sm">
              <li>
                <Link href="/blog" className={LINK}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/login" className={LINK}>
                  Entrar
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className={LINK}>
                  Criar conta
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <strong className="font-bold text-prime-light text-sm uppercase">
              Contato
            </strong>

            <div className="mt-4 flex flex-col gap-3 text-prime-light/70 text-sm">
              <a
                href="mailto:contato@primepokerteam.com"
                className={`flex items-start gap-2 ${LINK}`}
              >
                <EnvelopeIcon
                  weight="fill"
                  className="size-5 shrink-0 text-prime-red/75"
                />
                contato@primepokerteam.com
              </a>

              <a
                href="tel:+5511987654321"
                className={`flex items-start gap-2 ${LINK}`}
              >
                <PhoneIcon
                  weight="fill"
                  className="size-5 shrink-0 text-prime-red/75"
                />
                +55 11 98765-4321
              </a>

              <span className="flex items-start gap-2">
                <MapPinIcon
                  weight="fill"
                  className="size-5 shrink-0 text-prime-red/75"
                />
                São Paulo — SP, Brasil
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-white/10 border-t">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-6 text-prime-light/50 text-xs md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {YEAR} Prime Poker Team. Todos os direitos reservados.</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/politica-de-privacidade" className={LINK}>
              Política de Privacidade
            </Link>

            {/* A LGPD exige que o usuário possa revisar o consentimento a
                qualquer momento — o rodapé é o lugar canônico desse gatilho. */}
            <ManagePreferencesButton className={LINK} />
          </div>
        </div>
      </div>
    </footer>
  );
}
