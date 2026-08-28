import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Criar conta | Prime Poker Team",
  description: "Crie sua conta na área do jogador do Prime Poker Team.",
  robots: { index: false, follow: false },
};

export default function CadastroPage() {
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

      {/* TODO: formulário de cadastro e criação de usuário. */}
      <div className="rounded-md border border-white/10 border-dashed p-6 text-center text-prime-light/50 text-sm">
        Formulário de cadastro a implementar.
      </div>

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
