import type { RefObject } from "react";
import type { FieldError, RefCallBack } from "react-hook-form";
import ReactPhoneInput, { type PhoneInputProps } from "react-phone-input-2";

import "react-phone-input-2/lib/style.css";
import { twMerge } from "tailwind-merge";

interface PhoneInputCustomProps extends PhoneInputProps {
  id: string;
  error?: FieldError;
  errorClass?: string;
  onValueChange: (value: string) => void;
  className?: string;
  ref?: RefObject<HTMLInputElement> | RefCallBack;
}

export function PhoneInput({
  isValid,
  error,
  errorClass,
  placeholder,
  onValueChange,
  value,
  className,
  buttonClass,
  containerClass,
  ref,
  ...props
}: PhoneInputCustomProps) {
  return (
    <div>
      <ReactPhoneInput
        inputClass={twMerge(
          "!border-none !rounded-none !text-base !bg-transparent !w-full",
          className,
        )}
        onChange={(value) => {
          onValueChange(value);
        }}
        containerClass={twMerge("!font-sans !rounded-none", containerClass)}
        buttonClass={twMerge(
          "!border-none !border-zinc-200 !bg-transparent",
          buttonClass,
        )}
        placeholder={placeholder}
        countryCodeEditable={!!placeholder}
        value={value ?? ""}
        inputProps={{
          inputMode: "numeric",
          "aria-invalid": !!error,
          ...props,
          ref,
        }}
        country="br"
        // A máscara padrão da lib para o Brasil não separa o número:
        // `+55 (21) 981788877`. Com esta, fica `+55 (21) 98178-8877`.
        masks={{ br: "(..) .....-...." }}
      />
      {error && (
        <small className={twMerge("text-red-500", errorClass)}>
          {error?.message}
        </small>
      )}
    </div>
  );
}
