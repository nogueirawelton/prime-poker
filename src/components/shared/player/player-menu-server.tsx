import { getPerfil } from "@/services/perfil";
import { PlayerMenu } from "./player-menu";

/**
 * Busca o perfil e entrega ao menu, no mesmo molde do sino de notificações.
 *
 * O `getPerfil` é deduplicado por requisição: no painel, que também mostra o
 * perfil, isto não custa uma segunda ida ao WordPress.
 */
export async function PlayerMenuData() {
  const perfil = await getPerfil();

  return <PlayerMenu nome={perfil.nome} tier={perfil.tier?.label ?? null} />;
}
