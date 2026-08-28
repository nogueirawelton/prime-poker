import gsap from "gsap";
import type { Wrapper } from "@/hooks/use-animation";

export const misc: Wrapper = {
  loading: (container) => {
    gsap
      .timeline()
      // `fromTo` e não `from`: o estado inicial agora vem do HTML (opacity 0),
      // então `from` leria 0 como destino e nada apareceria. Aqui os dois
      // extremos são explícitos.
      .fromTo(
        "svg #icon",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, ease: "power1.inOut" },
      )
      .fromTo(
        "svg #name",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, ease: "power1.inOut" },
      )
      .fromTo(
        "svg #team",
        { autoAlpha: 0 },
        { autoAlpha: 1, ease: "power1.inOut" },
      )
      .to("svg #icon", {
        duration: 1,
        rotationY: 180,
        ease: "power1.inOut",
      })
      .to(container, {
        height: 0,
      })
      // `display: "hidden"` não existe em CSS — o valor era ignorado e o
      // overlay continuava no DOM captando ponteiro. O correto é "none".
      .set(container, {
        display: "none",
      });
  },
};
