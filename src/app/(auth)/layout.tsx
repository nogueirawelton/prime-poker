import Image from "next/image";
import Link from "next/link";

/**
 * Layout das páginas públicas de autenticação.
 * Sem Header/Footer institucional e sem Lenis: é um fluxo de formulário,
 * não uma página de navegação.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-10">
        <Image
          src="/img/logo-alt.svg"
          width={150}
          height={135}
          alt="Prime Poker Team"
          priority
        />
      </Link>

      <div className="w-full max-w-xl rounded-xl border border-white/10 bg-zinc-800 p-6 shadow-2xl lg:p-8">
        {children}
      </div>

      <Link
        href="/"
        className="mt-8 text-prime-light/70 text-sm underline underline-offset-2 transition-colors duration-500 hover:text-prime-light"
      >
        Voltar para o site
      </Link>
    </main>
  );
}
