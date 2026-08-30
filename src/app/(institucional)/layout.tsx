import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { SmootherProvider } from "@/hooks/use-smoother";

/**
 * Chrome do site institucional. O Lenis mora aqui (e não no layout raiz):
 * scroll inercial faz sentido na landing, mas atrapalha formulários e
 * painéis da área logada.
 */
export default function InstitucionalLayout({ children }: LayoutProps<"/">) {
  return (
    <SmootherProvider>
      <Header />

      {children}

      <Footer />
    </SmootherProvider>
  );
}
