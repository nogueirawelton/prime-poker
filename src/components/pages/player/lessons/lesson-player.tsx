"use client";

import { LockSimpleIcon, PlayIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Script from "next/script";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { registerLessonProgress, registerLessonView } from "@/actions/lesson";
import { coverStyle } from "@/lib/lessons";

type Props = {
  lessonId: number;
  title: string;
  /** Link assinado do player do Bunny; `null` sem acesso ou sem vídeo. */
  video: string | null;
  /** `null` quando o jogador pode assistir. */
  locked: { tierLabel: string } | null;
  /**
   * Botão de upgrade da aula trancada.
   *
   * Vem pronto de fora, do servidor, porque ele precisa do perfil do jogador
   * e da lista de planos — dados que o player não tem e não deveria buscar.
   */
  upgrade?: ReactNode;
  image: string | null;
  /** Cor da trilha, usada na capa quando não há imagem. */
  trackColor: string | null;
  /** Onde o jogador parou da última vez, em segundos. */
  watched: number;
};

/**
 * De quanto em quanto tempo o progresso vai para o WordPress.
 *
 * Quinze segundos: perder mais que isso ao fechar a aba de repente seria
 * notado por quem volta, e gravar a cada segundo encheria o servidor de
 * escritas para nada.
 */
const SAVE_EVERY = 15;

/**
 * O pedaço do player.js do Bunny que este componente usa.
 *
 * Só o `timeupdate` recebe dados: `ready`, `pause` e `ended` são avisos
 * secos, sem posição nenhuma. Por isso guardamos o último ponto conhecido —
 * é ele que vale na hora de pausar ou terminar.
 */
type BunnyPlayer = {
  on: {
    (
      event: "timeupdate",
      handler: (data: { seconds: number; duration: number }) => void,
    ): void;
    (event: "ready" | "pause" | "ended", handler: () => void): void;
  };
  setCurrentTime: (seconds: number) => void;
};

declare global {
  interface Window {
    playerjs?: { Player: new (iframe: HTMLIFrameElement) => BunnyPlayer };
  }
}

/**
 * Player da aula.
 *
 * O vídeo é o player do Bunny Stream num iframe. O link vem assinado do
 * WordPress, com validade, e só para quem tem o tier da aula; o Bunny ainda
 * confere o domínio de quem incorpora.
 *
 * Sem acesso, o lugar do vídeo vira o aviso do tier exigido. Sem vídeo
 * cadastrado, a capa com o play desabilitado — um player vazio pareceria
 * quebrado.
 *
 * O progresso é conversado com o iframe pelo player.js do Bunny: ele avisa
 * onde o vídeo está, e é por ele que retomamos de onde o jogador parou.
 */
export function LessonPlayer({
  lessonId,
  title,
  video,
  locked,
  upgrade,
  image,
  trackColor,
  watched,
}: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  // O último ponto já enviado, para não repetir a escrita a cada segundo.
  const sent = useRef(watched);
  const connected = useRef(false);
  // O último ponto que o player informou, já que pausar e terminar não
  // dizem onde o vídeo estava.
  const position = useRef({ seconds: watched, duration: 0 });

  /**
   * O link do vídeo é fixado na primeira renderização desta aula.
   *
   * O WordPress assina o link com a hora atual, então cada renderização
   * devolve um endereço diferente para o MESMO vídeo. Salvar a aula pede um
   * `refresh()`, e sem isto o iframe trocaria de `src` no meio da aula: o
   * vídeo reiniciaria do zero enquanto o jogador assiste. O link vale seis
   * horas, muito mais do que uma sessão de estudo.
   */
  const [shown, setShown] = useState({ lessonId, video });

  if (shown.lessonId !== lessonId) setShown({ lessonId, video });

  // Conta a visualização de quem de fato abriu a aula (ver a action).
  useEffect(() => {
    if (!locked) registerLessonView(lessonId);
  }, [lessonId, locked]);

  const save = useCallback(
    (seconds: number) => {
      if (Math.abs(seconds - sent.current) < 1) return;

      sent.current = seconds;
      registerLessonProgress(lessonId, seconds);
    },
    [lessonId],
  );

  // Sair da aula clicando em outro link não pausa o vídeo: sem esta
  // gravação, quem navega para outra página perderia até 15 segundos.
  useEffect(() => () => save(Math.floor(position.current.seconds)), [save]);

  /**
   * Liga o player.js ao iframe, depois que o script carrega.
   *
   * Passa a ser chamado de novo a cada troca de aula porque o iframe é
   * remontado; o script em si o Next carrega uma vez só.
   */
  const connect = useCallback(() => {
    const iframe = frame.current;

    // Chamado por dois caminhos — o iframe que carregou e o script que
    // ficou pronto —, porque qualquer um dos dois pode vir por último. Dois
    // players no mesmo iframe gravariam o progresso em dobro.
    if (!iframe || !window.playerjs || connected.current) return;

    connected.current = true;

    const player = new window.playerjs.Player(iframe);

    // Quem já concluiu a aula recebe `watched` zerado da página: rever uma
    // aula deve começar do início, não dos créditos.
    player.on("ready", () => {
      if (watched > 0) player.setCurrentTime(watched);
    });

    player.on("timeupdate", ({ seconds, duration }) => {
      position.current = { seconds, duration };

      if (Math.abs(seconds - sent.current) >= SAVE_EVERY) {
        save(Math.floor(seconds));
      }
    });

    // Sair no meio é o caso mais comum de "continuar depois": vale uma
    // gravação fora do intervalo.
    player.on("pause", () => save(Math.floor(position.current.seconds)));

    // No fim, grava a duração cheia: o último `timeupdate` costuma parar uns
    // décimos antes, e é isso que decide se a aula conclui sozinha.
    player.on("ended", () => {
      const { seconds, duration } = position.current;

      save(Math.floor(duration > 0 ? duration : seconds));
    });
  }, [save, watched]);

  if (locked) {
    return (
      <Poster image={image} trackColor={trackColor}>
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-amber-400/60 bg-prime-dark/60">
          <LockSimpleIcon
            className="size-7 text-amber-400"
            weight="fill"
            aria-hidden="true"
          />
        </span>

        <div className="max-w-md px-6">
          <p className="font-bold text-lg text-prime-light">
            Aula exclusiva para {locked.tierLabel} ou superior
          </p>
          <p className="mt-1 text-prime-light/60 text-sm">
            Peça o upgrade e a equipe do Prime Poker Team libera o seu acesso.
          </p>

          {upgrade && <div className="mt-4 flex justify-center">{upgrade}</div>}
        </div>
      </Poster>
    );
  }

  if (!video) {
    return (
      <Poster image={image} trackColor={trackColor}>
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-prime-light/40 bg-prime-dark/40">
          <PlayIcon
            className="ml-1 size-7 text-prime-light/60"
            weight="fill"
            aria-hidden="true"
          />
        </span>
        <p className="text-prime-light/60 text-sm">
          Vídeo em breve nesta aula.
        </p>
      </Poster>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-prime-dark">
      <iframe
        ref={frame}
        src={shown.video ?? video}
        title={title}
        className="absolute inset-0 size-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        onLoad={connect}
      />

      {/* A biblioteca é do próprio Bunny e conversa com o iframe dele por
          postMessage; não há versão em pacote npm publicada por eles. */}
      <Script
        src="https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js"
        strategy="afterInteractive"
        onReady={connect}
      />
    </div>
  );
}

function Poster({
  image,
  trackColor,
  children,
}: {
  image: string | null;
  trackColor: string | null;
  children: React.ReactNode;
}) {
  return (
    <div
      style={coverStyle(trackColor)}
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-white/10"
    >
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="(min-width: 1536px) 1536px, 100vw"
          className="object-cover opacity-30 blur-sm"
        />
      )}

      <div className="relative flex flex-col items-center gap-3 text-center">
        {children}
      </div>
    </div>
  );
}
