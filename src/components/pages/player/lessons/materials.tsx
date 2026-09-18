import {
  DownloadSimpleIcon,
  FileTextIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Material } from "@/services/lesson-detail";

/** Material de apoio da aula. */
export function Materials({ materials }: { materials: Array<Material> }) {
  if (materials.length === 0) {
    return (
      <p className="text-prime-light/50 text-sm">
        Esta aula não tem material de apoio.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {materials.map((material) => (
        <li
          key={material.name}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/3 p-3"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-prime-light/60">
            <FileTextIcon className="size-5" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-prime-light text-sm">
              {material.name}
            </span>
            <span className="block text-prime-light/40 text-xs">
              {material.size}
            </span>
          </span>

          {/* Sem URL o arquivo ainda não existe no CMS: um link que baixa
              nada é pior do que um botão visivelmente indisponível. */}
          {material.url ? (
            <a
              href={material.url}
              download
              className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-white/20 px-3 font-semibold text-prime-light text-xs transition-all duration-500 hover:bg-prime-light hover:text-prime-dark"
            >
              <DownloadSimpleIcon className="size-4" weight="bold" />
              Baixar
            </a>
          ) : (
            <span
              className="flex h-9 shrink-0 items-center rounded-md border border-white/10 px-3 text-prime-light/30 text-xs"
              title="Arquivo ainda não disponível"
            >
              Em breve
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
