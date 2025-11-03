import { ComponentProps } from "react";
import { FieldError } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface TextAreaProps extends ComponentProps<"textarea"> {
  error?: FieldError;
  errorClass?: string;
  onValueChange: (value: string) => void;
}

export function TextArea({
  error,
  errorClass,
  className,
  onValueChange,
  maxLength,
  ref,
  ...props
}: TextAreaProps) {
  return (
    <div>
      <textarea
        className={twMerge("w-full resize-none py-2", className)}
        ref={ref}
        onChange={(e) => onValueChange(e.target.value)}
        maxLength={maxLength}
        {...props}
      />

      {maxLength && (
        <small>
          {props.value ? (props.value as string).length : 0}/{maxLength}
        </small>
      )}

      {error && (
        <small className={twMerge("text-red-500", errorClass)}>
          {error.message}
        </small>
      )}
    </div>
  );
}
