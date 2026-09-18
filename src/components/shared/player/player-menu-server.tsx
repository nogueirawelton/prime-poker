import { getProfile } from "@/services/profile";
import { PlayerMenu } from "./player-menu";

/**
 * Busca o perfil e entrega ao menu, no mesmo molde do sino de notificações.
 *
 * O `getProfile` é deduplicado por requisição: no painel, que também mostra o
 * perfil, isto não custa uma segunda ida ao WordPress.
 */
export async function PlayerMenuData() {
  const profile = await getProfile();

  return <PlayerMenu name={profile.name} tier={profile.tier?.label ?? null} />;
}
