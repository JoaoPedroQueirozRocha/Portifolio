"use client"

import { STRINGS, inScale, openMidi, windowFor, type PracticeTarget } from "@/lib/armaduras"
import type { VerdictState } from "@/lib/pitch"
import { Board, BoardCell, BoardCells, BoardRow, BoardWire } from "../shared/Board"
import { FretCell } from "../shared/Fret"
import { useArmText } from "./text"

/* ---------------------------------------------------------------
   O espelho inteiro durante a prática: as quatro cordas com o nome de
   cada casa, as notas da escala acesas e as fora dela apagadas. Por
   cima, as notas do exercício — a já tocada, a pedida agora e as que
   ainda vêm — para a pessoa ver onde a nota realmente fica.
--------------------------------------------------------------- */

interface PracticeBoardProps {
  n: number
  p: number
  targets: PracticeTarget[]
  /** índice da nota pedida agora */
  idx: number
  /** resultado da tentativa atual, quando já houve uma */
  state: VerdictState | null
}

export default function PracticeBoard({ n, p, targets, idx, state }: PracticeBoardProps) {
  const { t, nn } = useArmText()
  const { start: b, cols: COLS } = windowFor(p)
  const cols = Array.from({ length: COLS }, (_, i) => b + i)
  const colOf = (f: number) => Math.max(0, Math.min(COLS - 1, f - b))
  const left = (f: number) => `${((colOf(f) + 0.5) / COLS) * 100}%`

  return (
    <div className="prt-board">
      <Board>
        {STRINGS.map((s, si) => {
          const stringName = nn.note(s.l)
          const mine = targets
            .map((tg, i) => ({ tg, i }))
            .filter(({ tg }) => tg.si === si)

          return (
            <BoardRow key={s.l} name={stringName} cap={t.string}>
              <BoardWire />
              <BoardCells cols={COLS}>
                {cols.map((f, i) => {
                  const open = p === 1 && i === 0
                  return (
                    <BoardCell key={f} open={open}>
                      <FretCell
                        name={open ? stringName : nn.casa(s, f, n)}
                        tone={inScale(openMidi(s) + f, n) ? "scale" : "out"}
                        number={f}
                        open={open}
                        dot={false}
                      />
                    </BoardCell>
                  )
                })}
              </BoardCells>

              {mine.map(({ tg, i }) => {
                const done = i < idx
                const now = i === idx
                const cls = now ? " is-now" + (state ? " is-" + state : "") : done ? " is-done" : ""
                return (
                  <span key={tg.k} className={"prt-mark" + cls} style={{ left: left(tg.fret) }}>
                    <i>{tg.k}</i><b>{nn.note(tg.l, tg.alt)}</b>
                  </span>
                )
              })}
            </BoardRow>
          )
        })}
      </Board>
    </div>
  )
}
