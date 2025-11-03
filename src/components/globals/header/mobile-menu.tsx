import { ListIcon } from "@phosphor-icons/react/dist/ssr";
import { Dialog } from "radix-ui";
import { useState } from "react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  function toggleMenu() {
    setOpen((prev) => !prev);
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="absolute top-1/2 right-1/2 translate-1/2 -translate-y-1/2 transition-all duration-[1s] group-data-[scrolled=true]:right-4 group-data-[scrolled=true]:translate-x-0 lg:hidden"
        onClick={toggleMenu}
      >
        <ListIcon />
      </Dialog.Trigger>

      <Dialog.Portal>
        {open && (
          <div className="bg-casa-green-500/90 animate-to-bottom fixed top-0 left-0 z-10 grid h-screen w-full place-items-center pt-[90px]">
            <nav className="font-wide flex flex-col items-center justify-center gap-8 text-sm font-thin tracking-[2px] text-zinc-100 uppercase">
              <a href="#projeto">Projeto</a>
              <a href="#lazer">Lazer</a>
              <a href="#plantas">Plantas</a>
              <a href="#decorados">Decorados</a>
              <a href="#servicos">Serviços</a>
              <a href="#localizacao">Localização</a>
              <a href="#contato">Contato</a>
            </nav>
          </div>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
