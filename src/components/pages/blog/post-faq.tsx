import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import { Accordion } from "radix-ui";
import type { Pergunta } from "@/utils/rich-content";

/**
 * Perguntas frequentes do artigo.
 *
 * O conteúdo vem do próprio corpo do post (um `h2` "Perguntas frequentes" e um
 * `h3` por pergunta), então quem escreve no WordPress não precisa de campo
 * novo. Além do acordeão, a seção emite `FAQPage` em JSON-LD — é o formato que
 * o Google usa para exibir as perguntas direto no resultado de busca.
 */
export function PostFaq({ perguntas }: { perguntas: Array<Pergunta> }) {
  if (perguntas.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: perguntas.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.resposta
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      },
    })),
  };

  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="font-bold text-2xl text-prime-light lg:text-3xl">
        Perguntas frequentes
      </h2>

      <Accordion.Root
        type="single"
        collapsible
        className="mt-6 flex flex-col gap-3"
      >
        {perguntas.map((item) => (
          <Accordion.Item
            key={item.id}
            value={item.id}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/3"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 p-5 text-left font-semibold text-prime-light text-sm transition-colors duration-300 hover:text-prime-red lg:text-base">
                {item.pergunta}

                <CaretDownIcon
                  className="size-5 shrink-0 text-prime-light/50 transition-transform duration-300 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </Accordion.Trigger>
            </Accordion.Header>

            {/* As animações de altura usam a variável do Radix, já definida
                em `globals.css` como `slide-down` / `slide-up`. */}
            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down">
              <div
                className="rich-text px-5 pb-5 text-sm"
                dangerouslySetInnerHTML={{ __html: item.resposta }}
              />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
