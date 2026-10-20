"use client"

import type { CSSProperties } from "react"
import { FLAT_STEPS, SHARP_STEPS } from "@/lib/armaduras"
import { FlatGlyph, SharpGlyph } from "../shared/Glyphs"
import { fmt, useArmText } from "./text"

/** Pauta com clave de Sol e a armadura de `n` acidentes */
export default function KeyStaff({ n, mini }: { n: number; mini?: boolean }) {
  const { t } = useArmText()
  const count = Math.abs(n)
  const top = 26, bottom = top + 40, x0 = 50, dx = 12
  const w = x0 + Math.max(count, 1) * dx + 30
  const yOf = (s: number) => bottom - s * 5
  const steps = n > 0 ? SHARP_STEPS.slice(0, count) : FLAT_STEPS.slice(0, count)
  const label = fmt(n >= 0 ? t.staff_aria_sharps : t.staff_aria_flats, { n: count })

  return (
    <svg
      className={"key-staff" + (mini ? " is-mini" : "")}
      viewBox={`0 0 ${w} 92`}
      style={{ "--vw": w } as CSSProperties}
      role="img"
      aria-label={label}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="2" x2={w - 2} y1={top + i * 10} y2={top + i * 10} stroke="currentColor" strokeWidth="0.8" opacity="0.75" />
      ))}
      <line x1="2" x2="2" y1={top} y2={bottom} stroke="currentColor" strokeWidth="0.8" opacity="0.75" />
      <text x="5" y={bottom - 1} className="key-clef" fill="currentColor">𝄞</text>
      {steps.map((s, i) =>
        n > 0
          ? <SharpGlyph key={i} x={x0 + i * dx} y={yOf(s)} />
          : <FlatGlyph key={i} x={x0 + i * dx} y={yOf(s)} />
      )}
    </svg>
  )
}
