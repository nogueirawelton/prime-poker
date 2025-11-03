import { Cards } from "@/icons/cards";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import { Collapsible } from "radix-ui";

export function Faq() {
  return (
    <section id="faq" className="bg-prime-dark">
      <div className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center justify-center">
          <strong className="text-prime-red flex items-center gap-2 font-normal uppercase">
            <Cards className="stroke-prime-red size-6" />
            Perguntas frequentes
          </strong>

          <h2 className="text-prime-light mt-2 flex items-center gap-2 text-center text-4xl font-bold uppercase">
            Tire suas dúvidas sobre o <br className="hidden lg:block" /> Prime
            Poker Team e como participar
          </h2>
        </div>

        <div className="mx-auto mt-12 flex max-w-screen-md flex-col gap-1">
          <div className="border-b border-white/20">
            <Collapsible.Root>
              <Collapsible.Trigger className="text-prime-light group flex min-h-12 w-full cursor-pointer items-center justify-between py-1 text-left font-medium">
                Como faço parte do time?{" "}
                <CaretDownIcon
                  weight="bold"
                  className="text-prime-red/85 size-6 transition-all duration-500 group-data-[state=open]:rotate-180"
                />
              </Collapsible.Trigger>

              <Collapsible.Content className="text-prime-light data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                <p className="pb-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
                  eveniet labore earum inventore iusto, assumenda, quas adipisci
                  odio excepturi repellendus quia tempore voluptatem iure
                  consequuntur laborum minus molestiae laudantium fuga.
                </p>
              </Collapsible.Content>
            </Collapsible.Root>
          </div>

          <div className="border-b border-white/20">
            <Collapsible.Root>
              <Collapsible.Trigger className="text-prime-light group flex min-h-12 w-full cursor-pointer items-center justify-between py-1 text-left font-medium">
                Quais serviços são oferecidos?{" "}
                <CaretDownIcon
                  weight="bold"
                  className="text-prime-red/85 size-6 transition-all duration-500 group-data-[state=open]:rotate-180"
                />
              </Collapsible.Trigger>

              <Collapsible.Content className="text-prime-light data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                <p className="pb-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
                  eveniet labore earum inventore iusto, assumenda, quas adipisci
                  odio excepturi repellendus quia tempore voluptatem iure
                  consequuntur laborum minus molestiae laudantium fuga.
                </p>
              </Collapsible.Content>
            </Collapsible.Root>
          </div>

          <div className="border-b border-white/20">
            <Collapsible.Root>
              <Collapsible.Trigger className="text-prime-light group flex min-h-12 w-full cursor-pointer items-center justify-between py-1 text-left font-medium">
                Qual o investimento necessário?{" "}
                <CaretDownIcon
                  weight="bold"
                  className="text-prime-red/85 size-6 transition-all duration-500 group-data-[state=open]:rotate-180"
                />
              </Collapsible.Trigger>

              <Collapsible.Content className="text-prime-light data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                <p className="pb-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
                  eveniet labore earum inventore iusto, assumenda, quas adipisci
                  odio excepturi repellendus quia tempore voluptatem iure
                  consequuntur laborum minus molestiae laudantium fuga.
                </p>
              </Collapsible.Content>
            </Collapsible.Root>
          </div>

          <div className="border-b border-white/20">
            <Collapsible.Root>
              <Collapsible.Trigger className="text-prime-light group flex min-h-12 w-full cursor-pointer items-center justify-between py-1 text-left font-medium">
                Preciso ter experiência para participar?{" "}
                <CaretDownIcon
                  weight="bold"
                  className="text-prime-red/85 size-6 transition-all duration-500 group-data-[state=open]:rotate-180"
                />
              </Collapsible.Trigger>

              <Collapsible.Content className="text-prime-light data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                <p className="pb-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
                  eveniet labore earum inventore iusto, assumenda, quas adipisci
                  odio excepturi repellendus quia tempore voluptatem iure
                  consequuntur laborum minus molestiae laudantium fuga.
                </p>
              </Collapsible.Content>
            </Collapsible.Root>
          </div>

          <div className="border-b border-white/20">
            <Collapsible.Root>
              <Collapsible.Trigger className="text-prime-light group flex min-h-12 w-full cursor-pointer items-center justify-between py-1 text-left font-medium">
                Como funciona a banca compartilhada?{" "}
                <CaretDownIcon
                  weight="bold"
                  className="text-prime-red/85 size-6 transition-all duration-500 group-data-[state=open]:rotate-180"
                />
              </Collapsible.Trigger>

              <Collapsible.Content className="text-prime-light data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                <p className="pb-2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
                  eveniet labore earum inventore iusto, assumenda, quas adipisci
                  odio excepturi repellendus quia tempore voluptatem iure
                  consequuntur laborum minus molestiae laudantium fuga.
                </p>
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        </div>
      </div>
    </section>
  );
}
