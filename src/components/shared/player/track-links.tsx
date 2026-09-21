import type { TrackLink } from "@/components/shared/player/lessons-sidebar";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { getTracks } from "@/services/lessons";

/**
 * Trilhas prontas para a navegação, com o ícone já montado.
 *
 * O ícone é renderizado AQUI, no servidor: o `DynamicIcon` resolve o nome
 * cadastrado no painel importando o catálogo inteiro do Phosphor, e a
 * navegação das trilhas é um componente cliente — o catálogo iria junto para
 * o navegador. Sem ícone cadastrado, a navegação mostra a bolinha da cor.
 */
export async function trackLinks(): Promise<Array<TrackLink>> {
  const tracks = await getTracks();

  return tracks.map((track) => ({
    slug: track.slug,
    name: track.name,
    color: track.color,
    icon: track.icon ? (
      <DynamicIcon icon={track.icon} className="size-5 shrink-0" />
    ) : null,
  }));
}
