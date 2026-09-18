import type { Icon } from "@phosphor-icons/react";
import {
  BookmarkSimpleIcon,
  ClockIcon,
  FlameIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Progress } from "@/services/profile";

/** Números do estudo e o avanço em cada trilha. */
export function ProgressCard({
  progress,
  savedLessons,
}: {
  progress: Progress;
  savedLessons: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={GraduationCapIcon}
          value={`${progress.completedCount}/${progress.total}`}
          label="Aulas concluídas"
        />
        <Stat
          icon={ClockIcon}
          value={`${progress.hours}h`}
          label="Tempo de estudo"
        />
        <Stat
          icon={FlameIcon}
          value={`${progress.streak} dias`}
          label="Sequência"
        />
        <Stat
          icon={BookmarkSimpleIcon}
          value={String(savedLessons)}
          label="Aulas salvas"
        />
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/3 p-6">
        <h2 className="font-bold text-prime-light text-sm uppercase tracking-wide">
          Progresso por trilha
        </h2>

        <ul className="flex flex-col gap-4">
          {progress.tracks.map((track) => {
            const percentage = Math.round(
              (track.completedCount / track.total) * 100,
            );

            return (
              <li key={track.track.slug} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-prime-light">{track.track.name}</span>
                  <span className="text-prime-light/50 text-xs tabular-nums">
                    {track.completedCount}/{track.total}
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progresso em ${track.track.name}`}
                  className="h-1.5 overflow-hidden rounded-full bg-prime-light/10"
                >
                  <div
                    className="h-full rounded-full bg-prime-red transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  icon: ItemIcon,
  value,
  label,
}: {
  icon: Icon;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/3 p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-prime-red/15 text-prime-red">
        <ItemIcon className="size-5" weight="fill" aria-hidden="true" />
      </span>

      <span>
        <strong className="block font-black text-prime-light text-xl">
          {value}
        </strong>
        <span className="block text-prime-light/50 text-xs uppercase tracking-wide">
          {label}
        </span>
      </span>
    </div>
  );
}
