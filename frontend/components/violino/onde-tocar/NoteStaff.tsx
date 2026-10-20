"use client"

import { FLAT_STEPS, SHARP_STEPS } from "@/lib/armaduras"
import { NOTES_PER_LINE, type ReadNote } from "@/lib/leitura"
import { AccidentalGlyph, FlatGlyph, SharpGlyph } from "../shared/Glyphs"

/* ---------------------------------------------------------------
   Partitura em linhas (sistemas) de 2 compassos 4/4 com 8 notas;
   uma linha por vez na tela.
   Coordenadas em px do viewBox de cada linha (940×230) — o SVG
   escala com a largura disponível.
--------------------------------------------------------------- */
const W = 940
const H = 230
const BOTTOM = 154      // 1ª linha da pauta (Mi⁴)
const STEP = 8          // meio espaço entre linha e espaço
const XS = [220, 302, 384, 466, 588, 670, 752, 834]
const yOf = (s: number) => BOTTOM - s * STEP

export type NoteState = "idle" | "current" | "ok" | "bad"

export interface StaffNote {
  note: ReadNote
  state: NoteState
  name?: string   // mostrado embaixo depois de respondida
  label?: string  // corda · dedo
  tag?: string    // ♯ escrito / ainda vale / barra
}

interface SystemProps {
  keyN: number
  notes: StaffNote[]
  line: number          // 0 = primeira linha
  last: boolean
  cursor: number | null // índice local da nota atual nesta linha
  cursorState: "idle" | "ok" | "bad"
  ariaLabel: string
}

function StaffSystem({ keyN, notes, line, last, cursor, cursorState, ariaLabel }: SystemProps) {
  const cnt = Math.abs(keyN)
  const keySteps = keyN > 0 ? SHARP_STEPS.slice(0, cnt) : FLAT_STEPS.slice(0, cnt)
  const tsX = 78 + cnt * 22 + (cnt ? 2 : 0)
  const firstMeasure = line * 2 + 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      {cursor !== null && (
        <rect
          className={"ot-cursor is-" + cursorState}
          x={-28} y={46} width={56} height={170} rx={4}
          style={{ transform: `translateX(${XS[cursor]}px)` }}
        />
      )}

      <g className="ot-lines">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={4} x2={W - 6} y1={BOTTOM - i * 16} y2={BOTTOM - i * 16} />
        ))}
        <line x1={4} x2={4} y1={BOTTOM - 64} y2={BOTTOM} />
        <line x1={522} x2={522} y1={BOTTOM - 64} y2={BOTTOM} strokeWidth={1.4} />
        <line x1={last ? 926 : W - 6} x2={last ? 926 : W - 6} y1={BOTTOM - 64} y2={BOTTOM} strokeWidth={1.4} />
      </g>
      {last && <rect x={930} y={BOTTOM - 64} width={4.5} height={64} fill="currentColor" opacity={0.85} />}
      <text x={10} y={BOTTOM} className="ot-clef" fill="currentColor">𝄞</text>

      {keySteps.map((s, q) =>
        keyN > 0
          ? <SharpGlyph key={q} x={78 + q * 22} y={yOf(s)} k={1.6} />
          : <FlatGlyph key={q} x={78 + q * 22} y={yOf(s)} k={1.5} />
      )}
      {line === 0 && (
        <>
          <text x={tsX} y={115} className="ot-time" fill="currentColor">4</text>
          <text x={tsX} y={147} className="ot-time" fill="currentColor">4</text>
        </>
      )}
      <text x={188} y={76} className="ot-measure">{firstMeasure}</text>
      <text x={530} y={76} className="ot-measure">{firstMeasure + 1}</text>

      {notes.map(({ note: n, state, name, label, tag }, i) => {
        const cx = XS[i]
        const cy = yOf(n.s)
        const ledgers: number[] = []
        if (n.s <= -2) for (let k = -2; k >= n.s; k -= 2) ledgers.push(k)
        if (n.s >= 10) for (let k = 10; k <= n.s; k += 2) ledgers.push(k)
        return (
          <g key={i} className={"ot-note is-" + state}>
            {ledgers.map((k) => (
              <line key={k} className="ot-ledger" x1={cx - 18} x2={cx + 18} y1={yOf(k)} y2={yOf(k)} />
            ))}
            {n.written !== null && (
              <AccidentalGlyph alt={n.written} x={cx - 28} y={cy} k={n.written === 0 ? 1 : n.written === 1 ? 1.6 : 1.5} />
            )}
            <ellipse cx={cx} cy={cy} rx={7.5} ry={5} transform={`rotate(-22 ${cx} ${cy})`} />
            {tag && <text x={cx} y={28} className="ot-tag">{tag}</text>}
            {name && <text x={cx} y={212} className="ot-name">{name}</text>}
            {label && <text x={cx} y={226} className="ot-label">{label}</text>}
          </g>
        )
      })}
    </svg>
  )
}

interface NoteStaffProps {
  keyN: number
  notes: StaffNote[]
  cursor: number | null   // índice global da nota atual (null = fim)
  cursorState: "idle" | "ok" | "bad"
  ariaLabel: string
}

/** Mostra só a linha da nota atual; a próxima aparece quando esta termina */
export default function NoteStaff({ keyN, notes, cursor, cursorState, ariaLabel }: NoteStaffProps) {
  const lines = Math.ceil(notes.length / NOTES_PER_LINE)
  const line = cursor === null ? lines - 1 : Math.floor(cursor / NOTES_PER_LINE) // no fim, a última
  const start = line * NOTES_PER_LINE

  return (
    <div className="ot-plate">
      <div className="ot-staff">
        {/* key por linha: o cursor não "desliza" de uma linha para a outra */}
        <StaffSystem
          key={line}
          keyN={keyN}
          notes={notes.slice(start, start + NOTES_PER_LINE)}
          line={line}
          last={line === lines - 1}
          cursor={cursor === null ? null : cursor - start}
          cursorState={cursorState}
          ariaLabel={ariaLabel}
        />
      </div>
    </div>
  )
}
