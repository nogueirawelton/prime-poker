import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Área do Jogador | Prime Poker Team",
};

export default function PlayerHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-black text-2xl text-prime-light uppercase lg:text-3xl">
          Área do Jogador
        </h1>
        <p className="mt-1 text-prime-light/70 text-sm">
          Seu painel do Prime Poker Team.
        </p>
      </div>

      {/* TODO: conteúdo do painel (resultados, aulas, agenda...). */}
      <div className="rounded-xl border border-white/10 border-dashed p-10 text-center text-prime-light/50 text-sm">
        Painel a implementar.
      </div>
    </div>
  );
}
