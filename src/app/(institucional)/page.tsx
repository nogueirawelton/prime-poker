import type { Home } from "@/@types/pages/Home";
import { Banner } from "@/components/pages/home/banner";
import { BePart } from "@/components/pages/home/be-part";
import { BlogHighlights } from "@/components/pages/home/blog-highlights";
import { Evolution } from "@/components/pages/home/evolution";
import { Faq } from "@/components/pages/home/faq";
import { HeadCoachs } from "@/components/pages/home/head-coachs";
import { Instagram } from "@/components/pages/home/instagram";
import { Instructors } from "@/components/pages/home/instructors";
import { WhatWeDo } from "@/components/pages/home/what-we-do";
import { WhoWeAre } from "@/components/pages/home/who-we-are";
import { Loading } from "@/components/ui/loading";
import { query } from "@/graphql/client";
import { HOME } from "@/graphql/queries/pages/HOME";
import { getSEO } from "@/utils/get-seo";

export const generateMetadata = getSEO("page", "home");

export default async function HomePage() {
  const { page } = await query<Home>(HOME);

  return (
    <main>
      <Loading />

      <Banner content={page.homeFields.banner} />
      <WhoWeAre content={page.homeFields.whoWeAre} />
      <WhatWeDo content={page.homeFields.whatWeDo} />
      <HeadCoachs content={page.homeFields.headCoaches} />
      <Instructors content={page.homeFields.instructors} />
      <Evolution content={page.homeFields.evolution} />
      <BePart content={page.homeFields.bePart} />
      <Faq content={page.homeFields.faq} />
      <BlogHighlights />
      <Instagram />
    </main>
  );
}
