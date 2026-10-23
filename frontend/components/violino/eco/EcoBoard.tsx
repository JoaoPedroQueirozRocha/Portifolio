"use client"

import { STRINGS } from "@/lib/armaduras"
import { OPEN_MIDI } from "@/lib/leitura"
import { Board, BoardCell, BoardCells, BoardRow, BoardWire } from "../shared/Board"
import { FretCell, type FretState } from "../shared/Fret"
import { fmt } from "../shared/text"
import type { EcoDict } from "./i18n"
import { currentItem, fingerAt, prefPlace, type State } from "./logic"
import type { EcoText } from "./text"
import type { Flash } from "./useSequencer"

const COLS = Array.from({ length: 9 }, (_, ci) => ci)

interface Props {
  t: EcoDict
  tx: EcoText
  st: State
  flash: Flash | null
  onTap: (si: number, ci: number) => void
}

/** Braço na 1ª posição: 4 cordas × (solta + 8 casas). Cada casa mostra o dedo; os nomes só aparecem como resposta. */
export default function EcoBoard({ t, tx, st, flash, onTap }: Props) {
  const key = st.round.key
  const it = currentItem(st)
  const target = it.to
  const revealed = st.phase === "hit" || st.phase === "reveal"
  const fix = prefPlace(target)
  const s = t.board.states

  return (
    <div className="ec-board">
      <div className="ec-board-head">
        <span>{t.board.hint}</span>
        <span>{t.board.cols}</span>
      </div>

      <Board>
        {STRINGS.map((sg, si) => (
          <BoardRow key={si} name={tx.stringName(si)} cap={t.board.string_cap}>
            <BoardWire />
            <BoardCells>
              {COLS.map((ci) => {
                const p = { si, ci }
                const m = OPEN_MIDI[si] + ci
                const finger = fingerAt(p, key)
                let text = ci === 0 ? "0" : finger ? String(finger) : "·"
                let state: FretState = ""
                let note: string | undefined
                let label = ""

                if (st.phase !== "summary" && st.here.si === si && st.here.ci === ci) {
                  state = "here"; text = tx.name(it.from, key); note = s.here; label = s.here
                }
                const tryAt = st.tries.findIndex((x) => x.si === si && x.ci === ci)
                if (tryAt >= 0) {
                  state = "bad"; text = "✕"; note = fmt(s.try, { n: tryAt + 1 }); label = s.wrong
                }
                if (revealed && m === target) {
                  if (st.phase === "hit" && st.hit?.si === si && st.hit.ci === ci) {
                    state = "ok"; text = "✓ " + tx.name(target, key); note = s.right; label = s.right
                  } else {
                    const era = st.phase === "reveal" && fix.si === si && fix.ci === ci
                    state = era ? "fix" : "alt"; text = tx.name(target, key)
                    note = era ? s.fix : s.alt; label = note
                  }
                }
                const playingHere = flash?.si === si && flash.ci === ci
                if (playingHere && !state) note = s.playing

                return (
                  <BoardCell key={ci} open={ci === 0}>
                    <FretCell
                      name={text}
                      tone="neutral"
                      number={ci}
                      open={ci === 0}
                      note={note}
                      state={state}
                      dotClassName={playingHere ? "is-playing" : undefined}
                      button={{
                        disabled: st.phase !== "search",
                        onClick: (e) => {
                          onTap(si, ci)
                          // clique de mouse: solta o foco, para a barra de espaço continuar sendo "ouvir o alvo"
                          if (e.detail > 0) e.currentTarget.blur()
                        },
                        "aria-label": fmt(t.board.cell_aria, { string: tx.stringName(si), pos: tx.pos(p, key) }) + (label ? ` — ${label}` : ""),
                      }}
                    />
                  </BoardCell>
                )
              })}
            </BoardCells>
          </BoardRow>
        ))}
      </Board>

      <div className="ec-legend">
        <span className="ec-legend-title">{t.board.legend}</span>
        <span><i className="ec-key is-here" />{s.here}</span>
        <span><i className="ec-key is-playing" />{s.playing}</span>
        <span><i className="ec-key is-bad">✕</i>{s.wrong}</span>
        <span><i className="ec-key is-ok">✓</i>{s.right}</span>
        <span><i className="ec-key is-fix" />{s.fix} · {s.alt}</span>
      </div>
    </div>
  )
}
