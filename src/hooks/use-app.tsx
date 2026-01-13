"use client";

import { ReactNode, createContext, use, useEffect, useState } from "react";

import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

type AppProviderProps = {
  headers: Promise<ReadonlyHeaders>;
  children: ReactNode;
};

type AppProps = {
  device: {
    isMobile: boolean;
    isApple: boolean;
  };
};

const AppContext = createContext({} as AppProps);

export function AppProvider({ children, headers }: AppProviderProps) {
  const ua = new Map(use(headers)).get("user-agent")!;
  const [isMobileScreen, setIsMobileScreen] = useState(ua.includes("Mobile"));

  function verifyMobileScreen() {
    return window.innerWidth < 1024;
  }

  useEffect(() => {
    function onResize() {
      setIsMobileScreen(verifyMobileScreen);
    }

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <AppContext
      value={{
        device: {
          isMobile: ua.includes("Mobile") || isMobileScreen,
          isApple: ua.includes("iPhone") || ua.includes("Mac"),
        },
      }}
    >
      {children}
    </AppContext>
  );
}

export const useApp = () => use(AppContext);
