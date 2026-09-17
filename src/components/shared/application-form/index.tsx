"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { Tabs } from "radix-ui";
import { Fragment, useState, useTransition } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { PhoneInput } from "@/components/ui/form/phone-input";
import { TextInput } from "@/components/ui/form/text-input";
import { wp } from "@/providers/wp";
import { getUtmParams } from "@/utils/utm";
import { type FormData, primeApplicationSchema } from "./schema";

/** Formulário de inscrição no Contact Form 7. */
const FORM_ID = "169";

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
      personalData: {
        nome_completo: "",
        email: "",
        numero_whatsapp: "",
        onde_mora: "",
      },
      currentSituation: {
        idade: "",
        ocupacao: "",
        fonte_de_renda: "",
        discord: "",
      },
      onlineHistory: {
        nick_poker_stars: "",
        outros_sites: "",
      },
      goalsCommitment: {
        disponibilidade: "",
        jogou_em_time: "",
        porque_se_inscreveu: "",
        indicacao: "",
      },
    },
  });

  const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    const stepFields = {
      "0": "personalData" as const,
      "1": "currentSituation" as const,
      "2": "onlineHistory" as const,
      "3": "goalsCommitment" as const,
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
        // Os nomes dos campos do schema são os mesmos do Contact Form 7:
        // achatar os grupos já produz o payload esperado.
        await wp(FORM_ID, {
          ...data.personalData,
          ...data.currentSituation,
          ...data.onlineHistory,
          ...data.goalsCommitment,
          ...getUtmParams(),
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
                className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 font-bold text-prime-light/75 transition-all duration-500 data-[active=true]:bg-prime-red/75 data-[active=true]:text-white"
              >
                {key + 1}
              </span>
              <span
                data-active={+value - 1 >= key}
                className="block h-1 w-full rounded-full bg-white/10 transition-all duration-500 last:hidden data-[active=true]:bg-prime-red/75"
              />
            </Fragment>
          ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-12">
        <Tabs.Content value="0" className="flex flex-col gap-4">
          <strong className="text-center text-2xl text-white">
            Dados Pessoais
          </strong>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="nome_completo">Seu Nome Completo*</label>
            <Controller
              control={control}
              name="personalData.nome_completo"
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="nome_completo"
                  onValueChange={onChange}
                  value={value}
                  error={errors.personalData?.nome_completo}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="email">Seu E-mail*</label>
            <Controller
              name="personalData.email"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="email"
                  error={errors.personalData?.email}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  onValueChange={onChange}
                  value={value}
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="numero_whatsapp">
              Qual seu nº de WhatsApp (com DDD)*
            </label>
            <Controller
              name="personalData.numero_whatsapp"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <PhoneInput
                  id="numero_whatsapp"
                  onValueChange={onChange}
                  value={value}
                  error={errors.personalData?.numero_whatsapp}
                  className="!h-12 !rounded-md !bg-white/10 !text-sm"
                  containerClass="!border ! !rounded-md !border-white/20"
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="onde_mora">Onde você mora? (Cidade/Estado)*</label>
            <Controller
              name="personalData.onde_mora"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="onde_mora"
                  onValueChange={onChange}
                  value={value}
                  error={errors.personalData?.onde_mora}
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

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="idade">Sua idade*</label>
            <Controller
              name="currentSituation.idade"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="idade"
                  onValueChange={onChange}
                  value={value}
                  error={errors.currentSituation?.idade}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="ocupacao">
              Sua ocupação? (Trabalha? Estuda? Nada?)*
            </label>
            <Controller
              name="currentSituation.ocupacao"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="ocupacao"
                  onValueChange={onChange}
                  value={value}
                  error={errors.currentSituation?.ocupacao}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="fonte_de_renda">
              Caso não trabalhe, possui alguma fonte de renda ou renda
              guardada?*
            </label>
            <Controller
              name="currentSituation.fonte_de_renda"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="fonte_de_renda"
                  onValueChange={onChange}
                  value={value}
                  error={errors.currentSituation?.fonte_de_renda}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="discord">Possui Discord? Qual login?*</label>
            <Controller
              name="currentSituation.discord"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="discord"
                  onValueChange={onChange}
                  value={value}
                  error={errors.currentSituation?.discord}
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

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="nick_poker_stars">
              Seu nick PokerStars? (Precisa estar com busca ABERTA no
              SharkScope.)*
            </label>
            <Controller
              name="onlineHistory.nick_poker_stars"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="nick_poker_stars"
                  onValueChange={onChange}
                  value={value}
                  error={errors.onlineHistory?.nick_poker_stars}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="outros_sites">
              Joga em outros sites? Quais? Quais nicks?*
            </label>
            <Controller
              name="onlineHistory.outros_sites"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="outros_sites"
                  onValueChange={onChange}
                  value={value}
                  error={errors.onlineHistory?.outros_sites}
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

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="disponibilidade">
              Qual sua disponibilidade para se dedicar ao pôquer? (Horas por dia
              e dias na semana)*
            </label>
            <Controller
              name="goalsCommitment.disponibilidade"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="disponibilidade"
                  onValueChange={onChange}
                  value={value}
                  error={errors.goalsCommitment?.disponibilidade}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="jogou_em_time">
              Já jogou em time? Se sim, quais?*
            </label>
            <Controller
              name="goalsCommitment.jogou_em_time"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="jogou_em_time"
                  onValueChange={onChange}
                  value={value}
                  error={errors.goalsCommitment?.jogou_em_time}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="porque_se_inscreveu">
              Por que decidiu se inscrever para jogar no Prime?*
            </label>
            <Controller
              name="goalsCommitment.porque_se_inscreveu"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="porque_se_inscreveu"
                  onValueChange={onChange}
                  value={value}
                  error={errors.goalsCommitment?.porque_se_inscreveu}
                  className="h-12 rounded-md border border-white/10 bg-white/10 px-4 text-sm outline-none"
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 text-prime-light/75 text-sm lg:text-base">
            <label htmlFor="indicacao">
              Alguém te indicou/sugeriu se inscrever no Prime? Se sim, quem?*
            </label>
            <Controller
              name="goalsCommitment.indicacao"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextInput
                  id="indicacao"
                  onValueChange={onChange}
                  value={value}
                  error={errors.goalsCommitment?.indicacao}
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
            disabled={value === "0"}
            onClick={() => setValue((prev) => String(+prev - 1))}
            className="h-12 cursor-pointer rounded-md border border-white/10 bg-white/10 px-4 text-white transition-all duration-500 disabled:opacity-0"
          >
            Anterior
          </button>
          {value === "3" ? (
            <button
              type="submit"
              disabled={pending}
              className="grid h-12 min-w-[99px] cursor-pointer place-items-center rounded-md bg-prime-red/75 px-4 text-white transition-opacity duration-500 disabled:opacity-70"
            >
              {pending ? (
                <CircleNotchIcon className="size-6 animate-spin" />
              ) : (
                "Enviar inscrição"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="h-12 cursor-pointer rounded-md bg-prime-red/75 px-4 text-white"
            >
              Próximo
            </button>
          )}
        </div>
      </form>
    </Tabs.Root>
  );
}
