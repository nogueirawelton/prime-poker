import { HeadCoachs as HeadCoachsType } from "@/@types/pages/Home";
import { AnimationContainer } from "@/hooks/use-animation";
import { Cards } from "@/icons/cards";
import Image from "next/image";

type HeadCoachsProps = {
  content: HeadCoachsType;
};

export function HeadCoachs({ content }: HeadCoachsProps) {
  return (
    <section id="head-coachs" className="bg-zinc-900">
      <AnimationContainer
        animation="home/headCoachs"
        className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-8 lg:py-24"
      >
        <div data-el="data" className="flex flex-col">
          <strong
            data-el="strong"
            className="text-prime-red flex items-center gap-2 font-normal uppercase"
          >
            <Cards className="stroke-prime-red size-6" />
            Head Coachs
          </strong>

          <h2
            className="text-prime-light break mt-2 flex items-center gap-2 text-3xl font-bold uppercase lg:text-4xl"
            dangerouslySetInnerHTML={{
              __html: content.title,
            }}
          />

          <p className="text-prime-light mt-4 max-w-2xl text-sm lg:text-base">
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
                  alt=""
                  className="absolute top-0 left-0 h-full w-full object-cover object-top"
                />
              </div>

              <div className="relative rounded-md border border-white/3 bg-white/3 px-4 py-8 transition-all duration-500 lg:px-8 lg:py-16">
                <div className="top-4 right-4 mb-6 flex flex-wrap items-center gap-4 gap-y-2 lg:absolute lg:mb-0">
                  {coach.tags?.nodes.map((tag, key) => (
                    <span
                      key={key}
                      className="bg-prime-red/60 text-prime-light/75 rounded-md px-4 py-1 text-sm lg:text-base"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                <h3 className="text-prime-light gap-2 text-2xl font-bold lg:text-3xl">
                  {coach.title}
                </h3>

                <strong className="text-prime-red/85 mt-1 block font-medium">
                  $
                  {Number(coach.instructorFields.earnings).toLocaleString(
                    "en-US",
                  )}{" "}
                  em ganhos
                </strong>

                <div
                  className="text-prime-light mt-4 flex flex-col gap-4 text-sm md:max-w-[75%] lg:text-base"
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
