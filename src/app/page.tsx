import { BePart } from "@/components/pages/home/be-part";
import { Evolution } from "@/components/pages/home/evolution";
import { Faq } from "@/components/pages/home/faq";
import { Instagram } from "@/components/pages/home/instagram";
import { Instructors } from "@/components/pages/home/instructors/instructors";
import { Banner } from "../components/pages/home/banner";
import { HeadCoachs } from "../components/pages/home/head-coachs";
import { WhatWeDo } from "../components/pages/home/what-we-do";
import { WhoWeAre } from "../components/pages/home/who-we-are";

export default function Home() {
  return (
    <main className="pt-24 lg:pt-28">
      <Banner />
      <WhoWeAre />
      <WhatWeDo />
      <HeadCoachs />
      <Instructors />
      <Evolution />
      <BePart />
      <Faq />
      <Instagram />
    </main>
  );
}
