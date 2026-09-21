"use client";

import { CheckCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { Dialog } from "radix-ui";
import { type ReactNode, useState, useTransition } from "react";
import { DarkSelect } from "@/components/ui/form/dark-select";
import { PhoneInput } from "@/components/ui/form/phone-input";
import { wp } from "@/providers/wp";

/**
 * Formulário do Contact Form 7 que recebe os pedidos de upgrade.
 *
 * Constante, como o `FORM_ID` da inscrição: o WordPress é o mesmo em produção
 * e em staging, então o ID não muda de ambiente e não há o que configurar no
 * deploy.
 */
const FORM_ID = "1147";

/**
 * Pedido de upgrade de plano.
 *
 * Enquanto não há gateway de pagamento, quem muda o tier é a equipe, pelo
 * painel. Este diálogo é a ponte: o jogador diz para qual plano quer ir e a
 * equipe recebe o pedido por e-mail, com quem ele é, como falar com ele e de
 * que aula ele veio.
 *
 * Os campos vão com os nomes em português porque são contrato do Contact Form
 * 7 — mudar aqui sem mudar lá derruba o envio.
 *
 * Nome, e-mail e WhatsApp já vêm preenchidos do perfil: o jogador está logado,
 * e pedir de novo o que o site já sabe é atrito puro. Continuam editáveis,
 * porque o contato de cobrança pode não ser o do cadastro.
 */
export function UpgradeDialog({
  children,
  name,
  email,
  phone,
  currentTier,
  tiers,
  suggestedTier,
  lessonTitle,
}: {
  children: ReactNode;
  name: string;
  email: string;
  phone: string;
  /** Nome do plano atual, para a equipe saber de onde ele sai. */
  currentTier: string;
  /** Planos do site, do mais baixo para o mais alto. */
  tiers: Array<{ slug: string; label: string }>;
  /** Plano exigido pela aula trancada, quando o pedido nasce de uma. */
  suggestedTier?: string;
  /** Aula que disparou o pedido, quando houver. */
  lessonTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  // Controlado, como no perfil: o `react-phone-input-2` mostra o número
  // mascarado e entrega os dígitos limpos, que são os que o CF7 recebe.
  const [whatsapp, setWhatsapp] = useState(phone);
  const [wantedTier, setWantedTier] = useState(suggestedTier ?? "");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    startTransition(async () => {
      setError(null);

      try {
        // O `DarkSelect` não é um campo de formulário nativo, então o
        // navegador não cobra o preenchimento por nós.
        if (!wantedTier) {
          throw new Error("Escolha o plano que você quer.");
        }

        await wp(FORM_ID, {
          nome_completo: String(data.get("nome_completo") ?? ""),
          email: String(data.get("email") ?? ""),
          numero_whatsapp: whatsapp,
          plano_atual: currentTier,
          plano_desejado: wantedTier,
          aula: lessonTitle ?? "",
          mensagem: String(data.get("mensagem") ?? ""),
        });

        setSent(true);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível enviar o pedido. Tente novamente.",
        );
      }
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        // Fechar e reabrir mostra o formulário limpo de novo: manter a tela
        // de sucesso daria a impressão de que o pedido novo já foi enviado.
        if (!next) {
          setSent(false);
          setError(null);
        }
      }}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />

        {/* Mesma moldura do diálogo de inscrição (`FormDialog`): borda
            vermelha, cantos `rounded-md` e fundo `zinc-950`. A largura é
            menor porque o conteúdo é menor — são seis campos, não quatro
            etapas. */}
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-prime-red/75 bg-zinc-950 px-6 py-8 data-[state=closed]:animate-dialog-close data-[state=open]:animate-dialog-open">
          <Dialog.Title className="font-bold text-prime-light text-xl">
            {sent ? "Pedido enviado" : "Fazer upgrade de plano"}
          </Dialog.Title>

          {sent ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <CheckCircleIcon
                className="size-12 text-emerald-400"
                weight="fill"
                aria-hidden="true"
              />

              <Dialog.Description className="text-prime-light/70 text-sm leading-relaxed">
                A equipe do Prime Poker Team recebeu o seu pedido e vai falar
                com você pelo WhatsApp. Assim que o plano for liberado, as aulas
                aparecem aqui sem você precisar fazer nada.
              </Dialog.Description>

              <Dialog.Close className="mt-2 flex h-11 items-center justify-center rounded-md border border-white/15 px-6 font-semibold text-prime-light text-sm transition-colors duration-500 hover:border-prime-red hover:text-prime-red">
                Fechar
              </Dialog.Close>
            </div>
          ) : (
            <>
              <Dialog.Description className="mt-1 text-prime-light/60 text-sm leading-relaxed">
                {lessonTitle
                  ? `A aula “${lessonTitle}” é de um plano acima do seu. Conte para a equipe o que você quer liberar.`
                  : "Diga para qual plano você quer ir e a equipe fala com você."}
              </Dialog.Description>

              <form
                onSubmit={handleSubmit}
                className="mt-5 flex flex-col gap-4"
              >
                <Field label="Nome" htmlFor="upgrade-nome">
                  <input
                    id="upgrade-nome"
                    name="nome_completo"
                    required
                    defaultValue={name}
                    className={FIELD_CLASS}
                  />
                </Field>

                <Field label="E-mail" htmlFor="upgrade-email">
                  <input
                    id="upgrade-email"
                    name="email"
                    type="email"
                    required
                    defaultValue={email}
                    className={FIELD_CLASS}
                  />
                </Field>

                <Field label="WhatsApp" htmlFor="upgrade-whatsapp">
                  <PhoneInput
                    id="upgrade-whatsapp"
                    value={whatsapp}
                    onValueChange={setWhatsapp}
                    className="!h-12 !rounded-md !bg-transparent !text-prime-light !text-sm"
                    containerClass="!rounded-md !border !border-white/10 !bg-white/10"
                    buttonClass="!rounded-l-md"
                  />
                </Field>

                <Field label="Plano desejado" htmlFor="upgrade-plano">
                  {/* O mesmo select do painel de filtros das aulas. O nativo
                      abre uma lista desenhada pelo sistema, que ignora o tema
                      escuro do site. */}
                  <DarkSelect
                    label="Plano desejado"
                    value={wantedTier}
                    onChange={setWantedTier}
                    placeholder="Escolha um plano"
                    triggerClass={FIELD_CLASS}
                    options={tiers.map((tier) => ({
                      value: tier.label,
                      label: tier.label,
                    }))}
                  />
                </Field>

                <Field label="Mensagem (opcional)" htmlFor="upgrade-mensagem">
                  <textarea
                    id="upgrade-mensagem"
                    name="mensagem"
                    rows={3}
                    maxLength={1000}
                    className={`${FIELD_CLASS} h-auto resize-none py-3`}
                  />
                </Field>

                {error && (
                  <p role="alert" className="text-prime-red text-sm">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                  <Dialog.Close className="flex h-11 items-center justify-center rounded-md border border-white/15 px-5 font-semibold text-prime-light/70 text-sm transition-colors duration-500 hover:text-prime-light">
                    Cancelar
                  </Dialog.Close>

                  <button
                    type="submit"
                    disabled={pending}
                    className="flex h-11 items-center justify-center gap-2 rounded-md bg-prime-red px-6 font-semibold text-prime-light text-sm transition-all duration-500 hover:bg-prime-light hover:text-prime-red disabled:opacity-60"
                  >
                    {pending && (
                      <CircleNotchIcon className="size-4 animate-spin" />
                    )}
                    Enviar pedido
                  </button>
                </div>
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Mesmos campos do diálogo de inscrição: `rounded-md` e `bg-white/10`, para os
 * dois formulários do site parecerem o mesmo formulário.
 */
const FIELD_CLASS =
  "h-12 w-full rounded-md border border-white/10 bg-white/10 px-4 text-prime-light text-sm outline-none transition-colors duration-500 placeholder:text-prime-light/40 focus:border-prime-red/60";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-semibold text-[11px] text-prime-light/50 uppercase tracking-wide"
      >
        {label}
      </label>

      {children}
    </div>
  );
}
