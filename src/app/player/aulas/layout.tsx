import { Suspense } from "react";
import { AulasSidebar } from "@/components/shared/player/aulas-sidebar";
import { getContinuarAssistindo } from "@/services/aulas";

/**
 * Sidebar de trilhas + conteúdo.
 *
 * A sidebar vive no layout, e não na página: trocar de trilha não a
 * remonta nem perde a posição de rolagem dela.
 */
export default function AulasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // A sidebar é `fixed`, então não ocupa espaço no fluxo: o `lg:pl-64`
    // reserva a faixa dela para o conteúdo não passar por baixo.
    <div className="flex-1 lg:pl-64">
      {/* A sidebar lê a URL (trilha ativa) e o progresso do jogador, então
          fica atrás do próprio boundary: o conteúdo não espera por ela. */}
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>

      {children}
    </div>
  );
}

async function Sidebar() {
  const continuar = await getContinuarAssistindo();

  return <AulasSidebar continuar={continuar} />;
}
