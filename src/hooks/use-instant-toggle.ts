"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "react-toastify";
import type { ToggleResult } from "@/actions/lesson";

/**
 * Liga/desliga que responde no clique, com a gravação em segundo plano.
 *
 * O botão muda na hora; a action roda depois e devolve o estado que ficou
 * gravado. Se ela falha, o valor otimista expira sozinho ao fim da
 * transição — o botão volta ao que era — e um toast avisa.
 *
 * O valor confirmado mora num estado local, e não só na prop: a rolagem
 * infinita guarda os cards em estado próprio, e o `refresh()` do servidor
 * nunca chega até eles. Quando a prop muda de verdade (a página
 * recarregou), ela ganha.
 *
 * Cliques seguidos não precisam esperar: o último valor pedido é o que
 * aparece, e as actions do Next rodam em fila, na ordem dos cliques — o
 * servidor alterna tantas vezes quanto a tela.
 */
export function useInstantToggle(
  value: boolean,
  request: () => Promise<ToggleResult>,
) {
  const [confirmed, setConfirmed] = useState(value);
  const [previous, setPrevious] = useState(value);

  if (value !== previous) {
    setPrevious(value);
    setConfirmed(value);
  }

  const [current, setCurrent] = useOptimistic(confirmed);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !current;

    startTransition(async () => {
      setCurrent(next);

      const result = await request();

      if ("error" in result) {
        toast.error(result.error);

        return;
      }

      startTransition(() => setConfirmed(result.value));
    });
  }

  return [current, toggle] as const;
}
