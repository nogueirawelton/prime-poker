import { Wrapper } from "@/hooks/use-animation";
import gsap from "gsap";

export const misc: Wrapper = {
  loading: (container) => {
    gsap
      .timeline()
      .from("svg #icon", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("svg #name", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("svg #team", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .to("svg #icon", {
        duration: 1,
        rotationY: 180,
        ease: "power1.inOut",
      })
      .to(container, {
        height: 0,
      })
      .to(container, {
        display: "hidden",
      });
  },
};
