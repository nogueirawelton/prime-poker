"use client";

import dynamic from "next/dynamic";

import { ComponentProps, useEffect, useRef, useState } from "react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export function ScaledVideo(props: ComponentProps<typeof ReactPlayer>) {
  const [scale, setScale] = useState(1);

  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (container.current) {
      const { clientHeight, clientWidth } = container.current;

      const relativeWidth = clientHeight * (16 / 9);
      const normalScale = clientWidth / relativeWidth;
      const invertedScale = relativeWidth / clientWidth;

      setScale(normalScale >= 1 ? normalScale : invertedScale);
    }
  });

  return (
    <div ref={container} className="h-full w-full">
      <ReactPlayer
        {...props}
        style={{
          scale: props.about == "external" ? scale : 1,
        }}
      />
    </div>
  );
}
