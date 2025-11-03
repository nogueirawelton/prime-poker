"use client";

import Link from "next/link";
import { ComponentProps } from "react";
import { useSmoother } from ".";

export function Scroller(props: ComponentProps<typeof Link>) {
  const { scrollTo } = useSmoother();

  return (
    <Link
      {...props}
      onClick={(e) => {
        e.preventDefault();
        scrollTo(e.currentTarget.getAttribute("href"));
      }}
    />
  );
}
