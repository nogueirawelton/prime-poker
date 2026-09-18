import type { Home } from "@/@types/pages/Home";
import { Banner } from "@/components/pages/home/banner";
import { BePart } from "@/components/pages/home/be-part";
// Blog oculto na master — reativar quando for ao ar.
// import { BlogHighlights } from "@/components/pages/home/blog-highlights";
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
import { HOME_CACHE_TAG } from "@/lib/cache-tags";
import { getSEO } from "@/utils/get-seo";

export const generateMetadata = getSEO("page", "home");

const SITE = process.env.NEXT_PUBLIC_SITE_URL;

/** Dados estruturados da organização, lidos pelo Google e por IAs. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: "Prime Poker Team",
  url: `${SITE}/`,
  logo: `${SITE}/img/logo.svg`,
  email: "prime@primepokerteam.com.br",
  foundingDate: "2018",
  sport: "Poker",
  sameAs: ["https://instagram.com/primepokerteam"],
};

export default async function HomePage() {
  const { page } = await query<Home>(HOME, { tags: [HOME_CACHE_TAG] });

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Loading />

      <Banner content={page.homeFields.banner} />
      <WhoWeAre content={page.homeFields.whoWeAre} />
      <WhatWeDo content={page.homeFields.whatWeDo} />
      <HeadCoachs content={page.homeFields.headCoaches} />
      <Instructors content={page.homeFields.instructors} />
      <Evolution content={page.homeFields.evolution} />
      <BePart content={page.homeFields.bePart} />
      <Faq content={page.homeFields.faq} />
      {/* <BlogHighlights /> */}
      <Instagram />
    </main>
  );
}
