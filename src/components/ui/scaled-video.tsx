"use client";

import dynamic from "next/dynamic";
import { type ComponentProps, useEffect, useRef, useState } from "react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

type ScaledVideoProps = ComponentProps<typeof ReactPlayer>;

/**
 * Player para mídia externa (YouTube e afins), onde o iframe vem com
 * proporção fixa e precisa ser escalado para cobrir o container.
 *
 * Vídeo hospedado no WordPress não passa mais por aqui: virou `<video>`
 * nativo em `NativeVideo`, que renderiza no servidor e não depende do
 * react-player para aparecer.
 */
export function ScaledVideo(props: ScaledVideoProps) {
  const [scale, setScale] = useState(1);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    const updateScale = () => {
      const { clientHeight, clientWidth } = el;
      if (!clientHeight || !clientWidth) return;
      const relativeWidth = clientHeight * (16 / 9);
      const normalScale = clientWidth / relativeWidth;
      setScale(normalScale >= 1 ? normalScale : relativeWidth / clientWidth);
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    updateScale();

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} className="size-full">
      <ReactPlayer {...props} playsInline style={{ scale }} />
    </div>
  );
}
