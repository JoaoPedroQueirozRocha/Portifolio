"use client"

import { useSyncExternalStore } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { getSoundStatus, subscribeSound, turnSoundOff, turnSoundOn } from "@/lib/violinSound"
import { useViolinoText } from "./text"

/* ---------------------------------------------------------------
   Peças comuns aos modos: seletor segmentado, placar e botão de som.
--------------------------------------------------------------- */

export function Seg<T extends string | number>({ label, value, options, onChange }: {
  label: string
  value: T
  options: { v: T; l: string; disabled?: boolean }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="vl-seg" role="group" aria-label={label}>
      <span className="vl-seg-l">{label}</span>
      <div className="vl-seg-o">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            className={"vl-tab" + (value === o.v ? " active" : "")}
            aria-pressed={value === o.v}
            disabled={o.disabled}
            onClick={() => value !== o.v && onChange(o.v)}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ScoreBoard({ label, items }: { label: string; items: { label: string; value: number | string }[] }) {
  return (
    <dl className="vl-score" aria-label={label}>
      {items.map((it) => (
        <div key={it.label}><dt>{it.label}</dt><dd>{it.value}</dd></div>
      ))}
    </dl>
  )
}

export function useSoundStatus() {
  return useSyncExternalStore(subscribeSound, getSoundStatus, () => "off" as const)
}

export function SoundButton() {
  const t = useViolinoText().sound
  const status = useSoundStatus()

  function toggle() {
    if (status === "on") turnSoundOff()
    else if (status !== "loading") void turnSoundOn()
  }

  return (
    <button
      type="button"
      className={"vl-btn vl-btn-ghost vl-nowrap" + (status === "on" ? " on" : "")}
      onClick={toggle}
      aria-pressed={status === "on"}
      aria-busy={status === "loading"}
      title={status === "error" ? t.error : undefined}
    >
      {status === "on" ? <Volume2 size={16} /> : <VolumeX size={16} />}
      {t[status]}
    </button>
  )
}
