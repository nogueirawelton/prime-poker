import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/pages/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha | Prime Poker Team",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ key?: string; login?: string }> };

/**
 * Destino do link do e-mail de redefinição.
 *
 * A chave e o login chegam pela URL e só são conferidos pelo WordPress no
 * envio: validar antes custaria uma ida ao servidor e ainda assim a chave
 * poderia vencer entre a abertura e o envio.
 */
export default function RedefinirSenhaPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-black text-2xl text-prime-light uppercase">
          Nova senha
        </h1>
        <p className="mt-1 text-prime-light/70 text-sm">
          Escolha uma senha nova para acessar sua conta.
        </p>
      </div>

      {/* Os parâmetros só existem em tempo de requisição: atrás do boundary,
          o título continua no shell estático. */}
      <Suspense fallback={<div className="h-64" />}>
        <Formulario searchParams={searchParams} />
      </Suspense>

      <p className="text-center text-prime-light/70 text-sm">
        Lembrou a senha?{" "}
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

async function Formulario({ searchParams }: Props) {
  const { key = "", login = "" } = await searchParams;

  return <ResetPasswordForm chave={key} login={login} />;
}
