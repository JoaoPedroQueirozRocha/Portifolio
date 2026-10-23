"use client"

import { Volume2, VolumeX } from "lucide-react"
import type { SoundStatus } from "@/lib/violinSound"
import type { EcoDict } from "./i18n"

/* O Eco é um exercício de ouvir: sem som, esta tela ocupa o lugar do fólio */
interface Props {
  t: EcoDict
  status: SoundStatus
  onEnable: () => void
}

export default function Gate({ t, status, onEnable }: Props) {
  const g = status === "loading" ? t.gate.loading : status === "error" ? t.gate.error : t.gate.off
  return (
    <div className="ec-gate">
      <div className={"ec-gate-ring" + (status === "error" ? " is-error" : "")}>
        {status === "loading" ? <span className="ec-spin" aria-hidden="true" />
          : status === "error" ? <VolumeX size={38} strokeWidth={1.6} aria-hidden="true" />
            : <Volume2 size={38} strokeWidth={1.6} aria-hidden="true" />}
      </div>
      <span className="ec-eyebrow">{g.eyebrow}</span>
      <h2 className="ec-gate-title">{g.title}</h2>
      <p className="ec-gate-text" aria-live="polite">{g.text}</p>
      {status !== "loading" && (
        <button type="button" className="vl-btn vl-btn-primary ec-gate-btn" onClick={onEnable}>
          <Volume2 size={18} aria-hidden="true" /> {g.button}
        </button>
      )}
      <span className="ec-gate-hint">{t.gate.hint}</span>
    </div>
  )
}
