import { home } from "./home";

const animations = {
  home,
};

export default animations;

export type Animation = keyof typeof animations;
