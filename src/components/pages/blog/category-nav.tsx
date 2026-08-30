import Link from "next/link";
import type { Category } from "@/services/blog";

/**
 * Navegação por categoria.
 *
 * Links, e não botões de filtro: cada categoria tem URL própria e vira porta
 * de entrada de busca orgânica.
 */
export function CategoryNav({ categories }: { categories: Array<Category> }) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Categorias" className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/blog/categoria/${category.slug}`}
          className="rounded-full border border-white/15 px-4 py-2 font-semibold text-prime-light/70 text-xs uppercase transition-all duration-500 hover:border-white/40 hover:text-prime-light"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
