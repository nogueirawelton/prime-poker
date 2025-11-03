import { home } from "./home";
import { misc } from "./misc";

const animations = {
  misc,
  home,
};

export default animations;

export type Animation = keyof typeof animations;
