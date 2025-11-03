import { ComponentProps } from "react";
import { FieldError } from "react-hook-form";
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
  ...props
}: TextInputProps) {
  return (
    <div>
      <input
        {...props}
        type="text"
        className={twMerge("w-full bg-transparent", props.className)}
        ref={ref}
        onChange={(e) => onValueChange(e.target.value)}
      />
      {error && (
        <small className={twMerge("text-red-500", errorClass)}>
          {error.message}
        </small>
      )}
    </div>
  );
}
