import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/pages/auth/register-form";

export const metadata: Metadata = {
  title: "Criar conta | Prime Poker Team",
  description: "Crie sua conta na área do jogador do Prime Poker Team.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-black text-2xl text-prime-light uppercase">
          Criar conta
        </h1>
        <p className="mt-1 text-prime-light/70 text-sm">
          Comece sua jornada no Prime Poker Team.
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-prime-light/70 text-sm">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-prime-light underline underline-offset-2 transition-colors duration-500 hover:text-prime-red"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
