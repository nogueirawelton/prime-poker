import { CrownSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { getTiers } from "@/services/lessons";
import { getProfile } from "@/services/profile";
import { UpgradeDialog } from "./upgrade-dialog";

/**
 * Botão de upgrade, já com os dados do jogador.
 *
 * Existe para o diálogo não precisar buscar nada do cliente: perfil e planos
 * vêm do servidor, e o componente de cliente só cuida do formulário. Quem
 * mostra o botão (a aula trancada, o card do plano) passa só o contexto.
 *
 * `getProfile` e `getTiers` são deduplicados/cacheados, então repetir este
 * botão na mesma página não custa idas extras ao WordPress.
 */
export async function UpgradeButton({
  label = "Fazer upgrade",
  suggestedTier,
  lessonTitle,
  className,
}: {
  label?: string;
  /** Plano exigido pela aula trancada, quando o pedido nasce de uma. */
  suggestedTier?: string;
  lessonTitle?: string;
  className?: string;
}) {
  const [profile, tiers] = await Promise.all([getProfile(), getTiers()]);

  return (
    <UpgradeDialog
      name={profile.name}
      email={profile.email}
      phone={profile.phone}
      currentTier={profile.tier?.label ?? "Sem plano"}
      tiers={tiers}
      suggestedTier={suggestedTier}
      lessonTitle={lessonTitle}
    >
      <button
        type="button"
        className={
          className ??
          "flex h-11 items-center justify-center gap-2 rounded-md bg-prime-red px-6 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-red"
        }
      >
        <CrownSimpleIcon className="size-4" weight="fill" aria-hidden="true" />
        {label}
      </button>
    </UpgradeDialog>
  );
}
