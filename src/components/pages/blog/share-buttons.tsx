"use client";

import {
  CheckIcon,
  LinkedinLogoIcon,
  LinkSimpleIcon,
  ShareNetworkIcon,
  WhatsappLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const ACTION =
  "grid size-11 place-items-center rounded-md border border-white/15 text-prime-light transition-all duration-500 hover:border-prime-red hover:bg-prime-red";

export function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // A URL só existe no cliente; no servidor não há window.
    setUrl(window.location.href);
    setCanShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard bloqueado (contexto inseguro ou permissão negada).
    }
  }

  async function share() {
    try {
      await navigator.share({ title, url });
    } catch {
      // O usuário cancelou o menu nativo: não é erro.
    }
  }

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-semibold text-prime-light/60 text-xs uppercase">
        Compartilhar
      </span>

      {/* Menu nativo do sistema — principal caminho no mobile. */}
      {canShare && (
        <button
          type="button"
          onClick={share}
          aria-label="Compartilhar"
          className={ACTION}
        >
          <ShareNetworkIcon className="size-5" />
        </button>
      )}

      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Compartilhar no WhatsApp"
        className={ACTION}
      >
        <WhatsappLogoIcon className="size-5" />
      </a>

      <a
        href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Compartilhar no X"
        className={ACTION}
      >
        <XLogoIcon className="size-5" />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Compartilhar no LinkedIn"
        className={ACTION}
      >
        <LinkedinLogoIcon className="size-5" />
      </a>

      <button
        type="button"
        onClick={copy}
        aria-label="Copiar link"
        className={ACTION}
      >
        {copied ? (
          <CheckIcon className="size-5" weight="bold" />
        ) : (
          <LinkSimpleIcon className="size-5" />
        )}
      </button>

      <span aria-live="polite" className="sr-only">
        {copied ? "Link copiado" : ""}
      </span>
    </div>
  );
}
