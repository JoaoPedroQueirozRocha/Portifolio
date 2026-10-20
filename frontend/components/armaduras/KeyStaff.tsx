"use client"

import type { CSSProperties } from "react"
import { FLAT_STEPS, SHARP_STEPS } from "@/lib/armaduras"
import { fmt, useArmText } from "./text"

function SharpGlyph({ x, y }: { x: number; y: number }) {
  const bar = (yc: number) => `${x - 5},${yc + 2.6} ${x + 5},${yc - 0.4} ${x + 5},${yc - 2.6} ${x - 5},${yc + 0.4}`
  return (
    <g>
      <line x1={x - 2} y1={y - 11} x2={x - 2} y2={y + 13} stroke="currentColor" strokeWidth="1.1" />
      <line x1={x + 2} y1={y - 13} x2={x + 2} y2={y + 11} stroke="currentColor" strokeWidth="1.1" />
      <polygon points={bar(y - 3.5)} fill="currentColor" />
      <polygon points={bar(y + 3.5)} fill="currentColor" />
    </g>
  )
}

// a barriga do bemol fica centrada em y (na linha/espaço da nota)
function FlatGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x - 3} y1={y - 17} x2={x - 3} y2={y + 4.6} stroke="currentColor" strokeWidth="1.2" />
      <path
        d={`M${x - 3},${y + 4.6} C${x + 1},${y + 2} ${x + 6.5},${y - 1.5} ${x + 3.5},${y - 4} C${x + 1.5},${y - 5.6} ${x - 1},${y - 3.6} ${x - 3},${y - 1.2}`}
        fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"
      />
    </g>
  )
}

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
