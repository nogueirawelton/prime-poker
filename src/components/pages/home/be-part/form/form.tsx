"use client";

import { PhoneInput } from "@/components/globals/form/phone-input";
import { SelectInput } from "@/components/globals/form/select-input";
import { TextArea } from "@/components/globals/form/text-area";
import { TextInput } from "@/components/globals/form/text-input";

export function Form() {
  return (
    <form className="flex flex-col gap-4">
      <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
        <label htmlFor="name">Nome Completo</label>
        <TextInput
          id="name"
          onValueChange={console.log}
          className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
        />
      </div>

      <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
        <label htmlFor="email">E-mail</label>
        <TextInput
          id="email"
          onValueChange={console.log}
          className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
        />
      </div>

      <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
        <label htmlFor="phone">Telefone</label>
        <PhoneInput
          id="phone"
          onValueChange={console.log}
          className="!h-12 !rounded-md !bg-white/10 !text-sm"
          containerClass="!border ! !rounded-md !border-white/20"
        />
      </div>

      <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
        <label htmlFor="experience">Nível de Experiência</label>
        <SelectInput
          id="experience"
          options={[]}
          placeholder="Selecione"
          onValueChange={console.log}
          className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
        />
      </div>

      <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
        <label htmlFor="why">
          Por que você quer fazer parte do Prime Poker Team?
        </label>
        <TextArea
          id="why"
          onValueChange={console.log}
          className="h-28 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
        />
      </div>

      <button
        type="submit"
        className="bg-prime-red text-prime-light hover:bg-prime-light hover:text-prime-red mx-auto flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-sm px-4 text-sm font-bold transition-all duration-500"
      >
        Enviar inscrição
      </button>
    </form>
  );
}
