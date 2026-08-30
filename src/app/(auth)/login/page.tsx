import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/pages/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar | Prime Poker Team",
  description: "Acesse a área do jogador do Prime Poker Team.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-black text-2xl text-prime-light uppercase">
          Entrar
        </h1>
        <p className="mt-1 text-prime-light/70 text-sm">
          Acesse sua área de jogador.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-prime-light/70 text-sm">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="text-prime-light underline underline-offset-2 transition-colors duration-500 hover:text-prime-red"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
