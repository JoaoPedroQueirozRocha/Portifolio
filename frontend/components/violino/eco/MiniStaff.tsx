"use client"

import { FLAT_STEPS, NAT, SHARP_STEPS } from "@/lib/armaduras"
import { AccidentalGlyph, FlatGlyph, SharpGlyph } from "../shared/Glyphs"
import type { EcoDict } from "./i18n"
import { currentItem, inScale, spellPitch, type State } from "./logic"
import type { EcoText } from "./text"

/* Pauta opcional: a nota de partida e, depois do acerto, o alvo.
   Coordenadas do viewBox (520 × 190); a 1ª linha é o Mi⁴ (passo 0). */
const W = 520
const H = 190
const BOTTOM = 124
const STEP = 8
const yOf = (s: number) => BOTTOM - s * STEP

/** Passo na pauta de uma nota MIDI, pela grafia da tonalidade (0 = Mi⁴) */
function stepOf(m: number, key: number) {
  const g = spellPitch(m, key)
  return ((m - g.alt - NAT[g.l]) / 12 - 1) * 7 + g.l - 30
}

interface Props {
  t: EcoDict
  tx: EcoText
  st: State
}

export default function MiniStaff({ t, tx, st }: Props) {
  const key = st.round.key
  const it = currentItem(st)
  const revealed = st.phase === "hit" || st.phase === "reveal"
  const count = Math.abs(key)
  const keySteps = key > 0 ? SHARP_STEPS.slice(0, count) : FLAT_STEPS.slice(0, count)

  const notes = [
    { m: it.from, cx: 230, shown: true, cls: "is-here", label: t.staff.here },
    {
      m: it.to, cx: 340, shown: revealed,
      cls: revealed ? (st.phase === "hit" ? "is-ok" : "is-fix") : "is-here",
      label: revealed ? tx.name(it.to, key) : t.staff.target,
    },
  ]

  return (
    <div className="ec-plate">
      <svg className="ec-staff" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.staff.aria}>
        <g className="ec-lines">
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={4} x2={W - 4} y1={BOTTOM - i * 16} y2={BOTTOM - i * 16} />)}
          <line x1={4} x2={4} y1={BOTTOM - 64} y2={BOTTOM} />
        </g>
        <text x={10} y={BOTTOM} className="ec-clef" fill="currentColor">𝄞</text>
        {keySteps.map((s, q) => key > 0
          ? <SharpGlyph key={q} x={78 + q * 16} y={yOf(s)} k={1.5} />
          : <FlatGlyph key={q} x={78 + q * 16} y={yOf(s)} k={1.4} />)}

        {notes.map(({ m, cx, shown, cls, label }) => {
          const step = stepOf(m, key)
          const ledgers: number[] = []
          if (shown) {
            if (step <= -2) for (let k = -2; k >= step; k -= 2) ledgers.push(k)
            if (step >= 10) for (let k = 10; k <= step; k += 2) ledgers.push(k)
          }
          const g = spellPitch(m, key)
          const cy = yOf(step)
          return (
            <g key={cx} className={"ec-note " + cls}>
              {ledgers.map((k) => <line key={k} className="ec-ledger" x1={cx - 17} x2={cx + 17} y1={yOf(k)} y2={yOf(k)} />)}
              {shown && !inScale(m, key) && <AccidentalGlyph alt={g.alt} x={cx - 28} y={cy} k={g.alt === 0 ? 1 : 1.5} />}
              {shown
                ? <ellipse cx={cx} cy={cy} rx={7.5} ry={5} transform={`rotate(-22 ${cx} ${cy})`} />
                : <text x={cx} y={BOTTOM - 40} className="ec-q">?</text>}
              <text x={cx} y={176} className="ec-note-label">{label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
