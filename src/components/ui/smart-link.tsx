"use client";

import Link from "next/link";
import { type ComponentProps, useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
];

export function SmartLink({
  href,
  children,
  ...props
}: ComponentProps<typeof Link>) {
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null,
  );

  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  const getUrlWithUtms = (targetHref: string) => {
    if (!targetHref.startsWith("/") && !targetHref.startsWith(BASE_URL)) {
      return targetHref;
    }

    const url = new URL(targetHref, BASE_URL);

    if (searchParams) {
      for (const key of UTM_PARAMS) {
        const value = searchParams.get(key);
        if (value) url.searchParams.set(key, value);
      }
    }

    return `${url.pathname}${url.search}${url.hash}`;
  };

  const finalHref = typeof href === "string" ? getUrlWithUtms(href) : href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (props.scroll === false) {
      sessionStorage.setItem("skip-scroll", "true");
    }
    props.onClick?.(e);
  };

  return (
    <Link href={finalHref} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
