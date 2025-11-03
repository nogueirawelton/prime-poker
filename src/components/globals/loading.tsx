import { AnimationContainer } from "@/hooks/use-animation";
import { Icon } from "./icon";

export function Loading() {
  return (
    <AnimationContainer
      animation="misc/loading"
      className="bg-prime-dark fixed right-0 bottom-0 left-0 z-50 grid h-screen origin-bottom place-items-center overflow-hidden"
    >
      <Icon />
    </AnimationContainer>
  );
}
