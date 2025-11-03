import { Wrapper } from "@/hooks/use-animation";
import gsap from "gsap";

export const home: Wrapper = {
  banner: () => {
    gsap
      .timeline()
      .from("h1", {
        autoAlpha: 0,
        y: 16,
        delay: 2.9,
        ease: "power1.inOut",
      })
      .from(
        "p",
        {
          autoAlpha: 0,
          y: 16,
          ease: "power1.inOut",
        },
        "-=0.25",
      )
      .from("[data-el='cta']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      });
  },

  whoWeAre: (container) => {},
};
