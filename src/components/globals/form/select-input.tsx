import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import { ScrollArea, Select } from "radix-ui";

import { RefObject } from "react";
import { FieldError, RefCallBack } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface SelectInputProps {
  id: string;
  error?: FieldError;
  placeholder?: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  ref?: RefObject<HTMLButtonElement> | RefCallBack;
  className?: string;
  viewportClass?: string;
  contentClass?: string;
  itemClass?: string;
  errorClass?: string;
  onValueChange: (value: string) => void;
  value?: string;
}

export function SelectInput({
  id,
  error,
  options,
  ref,
  placeholder,
  onValueChange,
  value,
  className,
  viewportClass,
  contentClass,
  itemClass,
  errorClass,
  ...props
}: SelectInputProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={(value) => {
        onValueChange(value == "empty" ? "" : value);
      }}
      {...props}
    >
      <div>
        <Select.Trigger
          id={id}
          ref={ref}
          className={twMerge(
            "group flex w-full items-center justify-between text-left",
            className,
          )}
        >
          <span
            data-filled={!!value}
            className="data-[filled=true]:inherit text-inherit"
          >
            <Select.Value placeholder={placeholder} />
          </span>
          <Select.Icon className="block shrink-0 transition-all duration-500 group-data-[state=open]:!rotate-180">
            <CaretDownIcon className="size-4 text-zinc-400" />
          </Select.Icon>
        </Select.Trigger>

        {error && (
          <small className={twMerge("text-red-500", errorClass)}>
            {error.message}
          </small>
        )}
      </div>

      <Select.Portal>
        <Select.Content
          position="popper"
          className={twMerge(
            "z-[100] min-w-[--radix-select-trigger-width] border border-zinc-100 bg-white shadow-sm",
            contentClass,
          )}
        >
          <ScrollArea.Root className="overflow-hidden" type="auto">
            <ScrollArea.Viewport className="max-h-[200px]">
              <Select.Viewport className={twMerge(viewportClass)}>
                {options.map((item, key) => (
                  <Select.Item
                    key={key}
                    value={item.value}
                    className={twMerge(
                      "flex min-h-10 cursor-pointer items-center px-4 py-2 transition-all duration-500 outline-none hover:bg-zinc-100",
                      itemClass,
                    )}
                  >
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar
              className="w-1 rounded-full bg-zinc-300"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="bg-galwan-blue-700 flex-1 rounded-full" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
