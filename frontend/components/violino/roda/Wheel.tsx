"use client"

import type { CSSProperties } from "react"
import type { RodaDict } from "./i18n"
import { BOX, CENTER, HALF_TAGS, PCS, RADIUS, polar, type Name, type Slot } from "./logic"

/* ---------------------------------------------------------------
   A roda: 12 casas em círculo, de meio em meio tom. Tudo é posicionado
   em % da caixa de 560, então a roda encolhe junto com a tela; os
   tamanhos de letra seguem a largura da própria roda (cqw).
--------------------------------------------------------------- */
const pct = (v: number) => `${(v / BOX) * 100}%`

export interface CenterView {
  eyebrow: string
  big: string
  sub: string
  dir: string
  ok: boolean
}

interface Props {
  t: RodaDict
  slots: Slot[]
  center: CenterView
  mode: "ordem" | "eq" | "explorar"
  name: (n: Name) => string
  onSlot: (s: Slot) => void
}

export default function Wheel({ t, slots, center, mode, name, onSlot }: Props) {
  return (
    <div className="rd-wheel" role="group" aria-label={t.wheel.aria}>
      <svg className="rd-rings" viewBox={`0 0 ${BOX} ${BOX}`} aria-hidden="true">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} className="rd-ring" />
        <circle cx={CENTER} cy={CENTER} r={118} className="rd-hub" />
        <circle cx={CENTER} cy={CENTER} r={124} className="rd-hub-dots" />
      </svg>

      {HALF_TAGS.map((i) => {
        const p = polar(i, 262)
        return (
          <div key={i} className="rd-half" title={t.wheel.half_title} style={{ left: pct(p.x), top: pct(p.y) }}>
            ½
          </div>
        )
      })}

      {slots.map((s) => {
        const p = polar(s.pc, RADIUS)
        const size = s.black ? 64 : 78
        const label = s.name ? name(s.name) : s.ask ? "?" : ""
        const sub = mode === "eq"
          ? s.ask ? "= ?" : s.done ? s.sub.map(name).join(" · ") || "—" : ""
          : s.sub.map(name).join(" · ")
        const long = label.length > 3
        const cls = ["rd-slot", s.black && "is-black", !s.name && "is-empty", s.ask && "is-ask", s.sel && "is-sel", s.done && "is-done", s.flash && "is-flash", long && "is-long"]
        return (
          <button
            key={s.pc}
            type="button"
            className={cls.filter(Boolean).join(" ")}
            style={{ left: pct(p.x), top: pct(p.y), width: pct(size) } as CSSProperties}
            disabled={!s.name}
            aria-pressed={mode === "explorar" ? s.sel : undefined}
            aria-label={
              s.name
                ? t.wheel.named.replace("{n}", String(s.pc + 1)).replace("{names}", PCS[s.pc].map(name).join(t.wheel.or))
                : t.wheel.empty.replace("{n}", String(s.pc + 1))
            }
            onClick={() => onSlot(s)}
          >
            <span className="rd-slot-name">{label}</span>
            {sub && <span className="rd-slot-sub">{sub}</span>}
          </button>
        )
      })}

      <div className="rd-center" aria-hidden="true">
        <span className="rd-center-eyebrow">{center.eyebrow}</span>
        <span className={"rd-center-big" + (center.ok ? " is-ok" : "")}>{center.big}</span>
        <span className="rd-center-sub">{center.sub}</span>
        <span className="rd-center-dir">{center.dir}</span>
      </div>
    </div>
  )
}
