import Image from "next/image";
import type { HeadCoachs as HeadCoachsType } from "@/@types/pages/Home";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import { formatUsd } from "@/utils/currency";

type HeadCoachsProps = {
  content: HeadCoachsType;
};

export function HeadCoachs({ content }: HeadCoachsProps) {
  return (
    <section id="head-coaches" className="bg-zinc-900">
      <AnimationContainer
        animation="home/headCoachs"
        className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24"
      >
        <div data-el="data" className="flex flex-col">
          <strong
            data-el="strong"
            className="flex items-center gap-2 font-normal text-prime-red uppercase"
          >
            <Cards className="size-6 stroke-prime-red" />
            Head Coaches
          </strong>

          <h2
            className="break mt-2 flex items-center gap-2 font-bold text-3xl text-prime-light uppercase lg:text-4xl"
            dangerouslySetInnerHTML={{
              __html: content.title,
            }}
          />

          <p className="mt-4 max-w-2xl text-prime-light text-sm lg:text-base">
            {content.description}
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-8">
          {content.coachs?.nodes.map((coach, key) => (
            <div
              key={key}
              data-el="card"
              className="group grid gap-4 md:grid-cols-[350px_1fr] md:gap-8 even:md:grid-cols-[1fr_350px]"
            >
              <div className="relative h-full min-h-[400px] overflow-hidden rounded-md group-even:md:order-last">
                <Image
                  src={coach.featuredImage?.node?.mediaItemUrl}
                  width={375}
                  height={480}
                  alt={coach.title}
                  className="absolute top-0 left-0 h-full w-full object-cover object-top"
                />
              </div>

              <div className="relative rounded-md border border-white/3 bg-white/3 px-4 py-8 transition-all duration-500 lg:px-8 lg:py-16">
                <div className="top-4 right-4 mb-6 flex flex-wrap items-center gap-4 gap-y-2 lg:absolute lg:mb-0">
                  {coach.tags?.nodes.map((tag, key) => (
                    <span
                      key={key}
                      className="rounded-md bg-prime-red/60 px-4 py-1 text-prime-light/75 text-sm lg:text-base"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                <h3 className="gap-2 font-bold text-2xl text-prime-light lg:text-3xl">
                  {coach.title}
                </h3>

                <strong className="mt-1 block font-medium text-prime-red">
                  {formatUsd(coach.instructorFields.earnings)} em ganhos
                </strong>

                <div
                  className="mt-4 flex flex-col gap-4 text-prime-light text-sm md:max-w-[75%] lg:text-base"
                  dangerouslySetInnerHTML={{
                    __html: coach.instructorFields.description,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </AnimationContainer>
    </section>
  );
}
