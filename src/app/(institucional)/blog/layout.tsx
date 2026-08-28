import { Newsletter } from "@/components/pages/blog/newsletter";

/**
 * Chrome comum a todo o blog. A newsletter fica aqui para aparecer na home,
 * nas categorias, na paginação e nos posts sem repetição em cada rota.
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // O header é fixo e o blog não tem banner atrás dele: o padding superior
    // impede que o conteúdo nasça embaixo do header.
    <div className="mx-auto max-w-screen-2xl px-4 pt-32 pb-24 lg:px-8 lg:pt-40">
      {children}

      <div className="mt-24">
        <Newsletter />
      </div>
    </div>
  );
}
