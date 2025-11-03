import { InstagramLogoIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

export function Post({ content }: { content: any }) {
  return (
    <a href={content.url} target="_blank">
      <div className="group relative size-full">
        <Image
          src={`${process.env.NEXT_PUBLIC_INSTAGRAM_URL}/media/${process.env.NEXT_PUBLIC_INSTAGRAM_PROFILE}/${content.media}`}
          width={425}
          height={425}
          alt=""
          className="size-full object-cover object-top"
        />

        <div className="absolute inset-0 z-10 grid place-items-center bg-black/40 opacity-0 transition-all duration-500 group-hover:opacity-100">
          <InstagramLogoIcon className="size-12 text-white lg:size-24" />
        </div>
      </div>
    </a>
  );
}
