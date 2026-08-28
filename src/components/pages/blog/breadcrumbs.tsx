import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Array<Crumb> }) {
  return (
    <nav aria-label="Trilha de navegação">
      <ol className="flex flex-wrap items-center gap-2 text-prime-light/50 text-xs uppercase">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && (
              <CaretRightIcon className="size-3" aria-hidden="true" />
            )}
            <li>
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-500 hover:text-prime-light"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-prime-light/80">{item.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
