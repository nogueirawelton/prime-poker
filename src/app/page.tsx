import { Home } from "@/@types/pages/Home";
import { BePart } from "@/components/pages/home/be-part";
import { Evolution } from "@/components/pages/home/evolution";
import { Faq } from "@/components/pages/home/faq";
import { Instagram } from "@/components/pages/home/instagram";
import { Instructors } from "@/components/pages/home/instructors";
import { client } from "@/graphql/client";
import { HOME } from "@/graphql/queries/pages/HOME";
import { getSEO } from "@/services/get-seo";
import { Banner } from "../components/pages/home/banner";
import { HeadCoachs } from "../components/pages/home/head-coachs";
import { WhatWeDo } from "../components/pages/home/what-we-do";
import { WhoWeAre } from "../components/pages/home/who-we-are";

export const generateMetadata = getSEO({ postType: "page", uri: "home" });

export default async function HomePage() {
  const { page } = await client.request<Home>(HOME);

  return (
    <main className="pt-24 lg:pt-28">
      <Banner content={page.homeFields.banner} />
      <WhoWeAre content={page.homeFields.whoWeAre} />
      <WhatWeDo content={page.homeFields.whatWeDo} />
      <HeadCoachs content={page.homeFields.headCoaches} />
      <Instructors content={page.homeFields.instructors} />
      <Evolution content={page.homeFields.evolution} />
      <BePart content={page.homeFields.bePart} />
      <Faq content={page.homeFields.faq} />
      <Instagram />
    </main>
  );
}
