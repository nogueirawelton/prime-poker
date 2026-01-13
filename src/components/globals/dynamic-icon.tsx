import * as PhosphorIcons from "@phosphor-icons/react/dist/ssr";

type DynamicIconProps = {
  icon: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  size?: number;
  color?: string;
  className?: string;
};

export const DynamicIcon = ({
  icon,
  weight = "regular",
  size = 24,
  color = "currentColor",
  className = "",
}: DynamicIconProps) => {
  const IconComponent = (PhosphorIcons as any)[
    icon
      ?.split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") + "Icon"
  ];

  if (!IconComponent) {
    return (
      <PhosphorIcons.QuestionIcon size={size} weight="regular" color="red" />
    );
  }

  return (
    <IconComponent
      weight={weight}
      size={size}
      color={color}
      className={className}
    />
  );
};
