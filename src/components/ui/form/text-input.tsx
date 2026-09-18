import type { ComponentProps } from "react";
import type { FieldError } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface TextInputProps extends ComponentProps<"input"> {
  error?: FieldError;
  errorClass?: string;
  onValueChange: (value: string) => void;
}

export function TextInput({
  error,
  errorClass,
  onValueChange,
  ref,
  value,
  ...props
}: TextInputProps) {
  return (
    <div>
      <input
        {...props}
        type="text"
        value={value ?? ""}
        aria-invalid={!!error}
        aria-describedby={error && props.id ? `${props.id}-error` : undefined}
        className={twMerge(
          "w-full bg-transparent",
          props.className,
          error && "border-red-500",
        )}
        ref={ref}
        onChange={(e) => onValueChange(e.target.value)}
      />
      {error && (
        <small
          id={props.id ? `${props.id}-error` : undefined}
          className={twMerge("text-red-500", errorClass)}
        >
          {error.message}
        </small>
      )}
    </div>
  );
}
