"use client";

import { PhoneInput } from "@/components/globals/form/phone-input";
import { TextInput } from "@/components/globals/form/text-input";
import { wp } from "@/providers/wp";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { Tabs } from "radix-ui";
import { Fragment, useState, useTransition } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FormData, primeApplicationSchema } from "./schema";

export function Form() {
  const [value, setValue] = useState("0");

  const [pending, startTransition] = useTransition();

  const {
    handleSubmit,
    control,
    reset,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(primeApplicationSchema),
    defaultValues: {
      dadosPessoais: {
        entry_502479035: "",
        entry_1045653986: "",
        entry_431975596: "",
        entry_1067624691: "",
      },
      situacaoAtual: {
        entry_1524797025: "",
        entry_936724915: "",
        entry_1945294488: "",
        entry_661900987: "",
      },
      historicoOnline: {
        entry_683158185: "",
        entry_1091112575: "",
      },
      metasDedicacao: {
        entry_1979104888: "",
        entry_899222282: "",
        entry_462376964: "",
        entry_1510858042: "",
      },
    },
  });

  const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    const stepFields = {
      "0": "dadosPessoais" as const,
      "1": "situacaoAtual" as const,
      "2": "historicoOnline" as const,
      "3": "metasDedicacao" as const,
    };

    const currentField = stepFields[value as keyof typeof stepFields];

    const isValid = await trigger(currentField);

    if (isValid) {
      setValue((prev) => String(+prev + 1));
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    startTransition(async () => {
      try {
        // const response = await fetch("/api/submit-form", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(data),
        // });

        // const result = await response.json();

        // if (!response.ok) {
        //   throw new Error(result.error || "Erro ao enviar formulário");
        // }

        await wp("169", {
          nome_completo: data.dadosPessoais.entry_502479035,
          email: data.dadosPessoais.entry_1045653986,
          numero_whatsapp: data.dadosPessoais.entry_431975596,
          onde_mora: data.dadosPessoais.entry_1067624691,
          idade: data.situacaoAtual.entry_1524797025,
          ocupacao: data.situacaoAtual.entry_936724915,
          fonte_de_renda: data.situacaoAtual.entry_1945294488,
          discord: data.situacaoAtual.entry_661900987,
          nick_poker_stars: data.historicoOnline.entry_683158185,
          outros_sites: data.historicoOnline.entry_1091112575,
          disponibilidade: data.metasDedicacao.entry_1979104888,
          jogou_em_time: data.metasDedicacao.entry_899222282,
          porque_se_inscreveu: data.metasDedicacao.entry_462376964,
          indicacao: data.metasDedicacao.entry_1510858042,
        });

        toast.success("Formulário enviado com sucesso!");
        reset();
        setValue("0");
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error
            ? err.message
            : "Ocorreu um erro ao enviar o formulário!",
        );
      }
    });
  };
  return (
    <Tabs.Root value={value} onValueChange={setValue}>
      <div className="flex items-center justify-between gap-4 px-8">
        {Array(4)
          .fill("")
          .map((_, key) => (
            <Fragment key={key}>
              <span
                data-active={+value >= key}
                className="data-[active=true]:bg-prime-red/75 text-prime-light/75 grid size-9 shrink-0 place-items-center rounded-full bg-white/10 font-bold transition-all duration-500 data-[active=true]:text-white"
              >
                {key + 1}
              </span>
              <span
                data-active={+value - 1 >= key}
                className="data-[active=true]:bg-prime-red/75 block h-1 w-full rounded-full bg-white/10 transition-all duration-500 last:hidden"
              />
            </Fragment>
          ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-12">
        <Tabs.Content value="0" className="flex flex-col gap-4">
          <strong className="text-center text-2xl text-white">
            Dados Pessoais
          </strong>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_502479035">Seu Nome Completo*</label>
            <Controller
              control={control}
              name="dadosPessoais.entry_502479035"
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_502479035"
                  onValueChange={onChange}
                  value={value}
                  error={errors.dadosPessoais?.entry_502479035}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_1045653986">Seu E-mail*</label>
            <Controller
              name="dadosPessoais.entry_1045653986"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_1045653986"
                  error={errors.dadosPessoais?.entry_1045653986}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  onValueChange={onChange}
                  value={value}
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_431975596">
              Qual seu nº de WhatsApp (com DDD)*
            </label>
            <Controller
              name="dadosPessoais.entry_431975596"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <PhoneInput
                  id="entry_431975596"
                  onValueChange={onChange}
                  value={value}
                  error={errors.dadosPessoais?.entry_431975596}
                  className="!h-12 !rounded-md !bg-white/10 !text-sm"
                  containerClass="!border ! !rounded-md !border-white/20"
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_1067624691">
              Onde você mora? (Cidade/Estado)*
            </label>
            <Controller
              name="dadosPessoais.entry_1067624691"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_1067624691"
                  onValueChange={onChange}
                  value={value}
                  error={errors.dadosPessoais?.entry_1067624691}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="1" className="flex flex-col gap-4">
          <strong className="text-center text-2xl text-white">
            Situação Atual
          </strong>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_1524797025">Sua idade*</label>
            <Controller
              name="situacaoAtual.entry_1524797025"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_1524797025"
                  onValueChange={onChange}
                  value={value}
                  error={errors.situacaoAtual?.entry_1524797025}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_936724915">
              Sua ocupação? (Trabalha? Estuda? Nada?)*
            </label>
            <Controller
              name="situacaoAtual.entry_936724915"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_936724915"
                  onValueChange={onChange}
                  value={value}
                  error={errors.situacaoAtual?.entry_936724915}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_1945294488">
              Caso não trabalhe, possui alguma fonte de renda ou renda
              guardada?*
            </label>
            <Controller
              name="situacaoAtual.entry_1945294488"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_1945294488"
                  onValueChange={onChange}
                  value={value}
                  error={errors.situacaoAtual?.entry_1945294488}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_661900987">
              Possui Discord? Qual login?*
            </label>
            <Controller
              name="situacaoAtual.entry_661900987"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_661900987"
                  onValueChange={onChange}
                  value={value}
                  error={errors.situacaoAtual?.entry_661900987}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="2" className="flex flex-col gap-4">
          <strong className="text-center text-2xl text-white">
            Histórico Online
          </strong>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_683158185">
              Seu nick PokerStars? (Precisa estar com busca ABERTA no
              SharkScope.)*
            </label>
            <Controller
              name="historicoOnline.entry_683158185"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_683158185"
                  onValueChange={onChange}
                  value={value}
                  error={errors.historicoOnline?.entry_683158185}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_1091112575">
              Joga em outros sites? Quais? Quais nicks?*
            </label>
            <Controller
              name="historicoOnline.entry_1091112575"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_1091112575"
                  onValueChange={onChange}
                  value={value}
                  error={errors.historicoOnline?.entry_1091112575}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="3" className="flex flex-col gap-4">
          <strong className="text-center text-2xl text-white">
            Metas e Dedicação
          </strong>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_1979104888">
              Qual sua disponibilidade para se dedicar ao pôquer? (Horas por dia
              e dias na semana)*
            </label>
            <Controller
              name="metasDedicacao.entry_1979104888"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_1979104888"
                  onValueChange={onChange}
                  value={value}
                  error={errors.metasDedicacao?.entry_1979104888}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_899222282">
              Já jogou em time? Se sim, quais?*
            </label>
            <Controller
              name="metasDedicacao.entry_899222282"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_899222282"
                  onValueChange={onChange}
                  value={value}
                  error={errors.metasDedicacao?.entry_899222282}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_462376964">
              Por que decidiu se inscrever para jogar no Prime?*
            </label>
            <Controller
              name="metasDedicacao.entry_462376964"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_462376964"
                  onValueChange={onChange}
                  value={value}
                  error={errors.metasDedicacao?.entry_462376964}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="text-prime-light/75 flex flex-col gap-2 text-sm lg:text-base">
            <label htmlFor="entry_1510858042">
              Alguém te indicou/sugeriu se inscrever no Prime? Se sim, quem?*
            </label>
            <Controller
              name="metasDedicacao.entry_1510858042"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="entry_1510858042"
                  onValueChange={onChange}
                  value={value}
                  error={errors.metasDedicacao?.entry_1510858042}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>
        </Tabs.Content>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            disabled={value == "0"}
            onClick={() => setValue((prev) => String(+prev - 1))}
            className="h-12 cursor-pointer rounded-md border border-white/10 bg-white/10 px-4 text-white transition-all duration-500 disabled:opacity-0"
          >
            Anterior
          </button>
          {value == "3" ? (
            <button
              type="submit"
              className="bg-prime-red/75 grid h-12 min-w-[99px] cursor-pointer place-items-center rounded-md px-4 text-white"
            >
              {true ? (
                <CircleNotchIcon className="size-6 animate-spin" />
              ) : (
                "Enviar inscrição"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="bg-prime-red/75 h-12 cursor-pointer rounded-md px-4 text-white"
            >
              Próximo
            </button>
          )}
        </div>
      </form>
    </Tabs.Root>
  );
}
