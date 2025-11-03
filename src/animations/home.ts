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

  whoWeAre: (container) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      })
      .from("[data-el='strong']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .from("h2", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("[data-el='data'] p", {
        autoAlpha: 0,
        stagger: 0.2,
        ease: "power1.inOut",
      })
      .from("[data-el='cta']", {
        autoAlpha: 0,
        x: -16,
        ease: "power1.inOut",
      })
      .from("[data-el='count']", {
        textContent: "0",
        ease: "power1.inOut",
        duration: 3,
        snap: {
          textContent: 1,
        },
      });

    gsap.from("[data-el='card']", {
      scrollTrigger: {
        trigger: "[data-el='card']",
        start: "top 80%",
      },
      autoAlpha: 0,
      y: 16,
      stagger: 0.2,
      ease: "power1.inOut",
    });
  },

  whatWeDo: (container) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      })
      .from("[data-el='strong']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .from("h2", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("[data-el='data'] p", {
        autoAlpha: 0,
        stagger: 0.2,
        ease: "power1.inOut",
      })
      .from("[data-el='card']", {
        autoAlpha: 0,
        y: 16,
        stagger: 0.2,
        ease: "power1.inOut",
      });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: "[data-el='big-card']",
          start: "top 80%",
        },
      })
      .from("[data-el='big-card']", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("[data-el='cta']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      });
  },

  headCoachs: (container) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      })
      .from("[data-el='strong']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .from("h2", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("[data-el='data'] p", {
        autoAlpha: 0,
        stagger: 0.2,
        ease: "power1.inOut",
      });

    gsap.utils
      .selector(container)("[data-el='card']")
      .forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 16,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
          },
          ease: "power1.inOut",
        });
      });
  },

  instructors: (container) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      })
      .from("[data-el='strong']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .from("h2", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("[data-el='data'] p", {
        autoAlpha: 0,
        stagger: 0.2,
        ease: "power1.inOut",
      })
      .from("[data-el='swiper']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .from("[data-el='cta']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      });
  },

  evolution: (container) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      })
      .from("[data-el='strong']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .from("h2", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("[data-el='data'] p", {
        autoAlpha: 0,
        stagger: 0.2,
        ease: "power1.inOut",
      })
      .from("[data-el='chart']", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("[data-el='testimonials']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      });
  },

  bePart: (container) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      })
      .from("[data-el='strong']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .from("h2", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("[data-el='data'] p", {
        autoAlpha: 0,
        stagger: 0.2,
        ease: "power1.inOut",
      })
      .from("[data-el='step-container']", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })
      .from("[data-el='step']", {
        autoAlpha: 0,
        x: -16,
        stagger: 0.2,
        ease: "power1.inOut",
      })
      .from("[data-el='form']", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      });
  },

  faq: (container) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      })
      .from("[data-el='strong']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .from("h2", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })

      .from("[data-el='faq-items']", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      });
  },

  instagram: (container) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      })
      .from("[data-el='strong']", {
        autoAlpha: 0,
        ease: "power1.inOut",
      })
      .from("h2", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      })

      .from("[data-el='posts']", {
        autoAlpha: 0,
        y: 16,
        ease: "power1.inOut",
      });
  },
};
