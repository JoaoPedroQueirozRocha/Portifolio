"use client"

import { STRINGS, fingerFor, type NoteNames } from "@/lib/armaduras"
import { FINGER_COLS, OPEN_MIDI, inScale, type Config, type ReadNote } from "@/lib/leitura"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import { Board, BoardCell, BoardCells, BoardRow, BoardWire } from "../shared/Board"
import { FretCell, type FretState } from "../shared/Fret"
import { fmt } from "../shared/text"

type OTDict = Dictionary["onde_tocar"]

export interface Feedback {
  ok: boolean
  si: number   // -1 quando acabou o tempo
  ci: number
  m: number | null
  timeout?: boolean
}

interface FingerboardProps {
  t: OTDict
  nn: NoteNames
  cfg: Config
  keyN: number
  cur: ReadNote | null
  fb: Feedback | null
  onTap: (si: number, ci: number) => void
}

/** Braço na 1ª posição: 4 cordas × (solta + 8 casas de meio tom) */
export default function Fingerboard({ t, nn, cfg, keyN, cur, fb, onTap }: FingerboardProps) {
  const cols = Array.from({ length: FINGER_COLS }, (_, ci) => ci)

  return (
    <Board>
      {STRINGS.map((sg, si) => {
        const enabled = cfg.strings[si]
        const sname = nn.note(sg.l)
        return (
          <BoardRow key={si} name={sname} cap={enabled ? t.string_cap : t.string_off} off={!enabled}>
            <BoardWire />
            <BoardCells>
              {cols.map((ci) => {
                const m = OPEN_MIDI[si] + ci
                const open = ci === 0
                const finger = open ? 0 : fingerFor(sg, 1, m, keyN)
                const scale = inScale(m, keyN)

                let kind: FretState = ""
                if (fb && cur && enabled) {
                  if (fb.si === si && fb.ci === ci) kind = fb.ok ? "ok" : "bad"
                  else if (m === cur.midi) kind = fb.ok ? "alt" : "fix"
                }

                // conteúdo do círculo conforme a "Ajuda no braço"
                let text = ""
                if (cfg.digits === "names") text = nn.pitch(m, keyN)
                else if (cfg.digits === "digits") text = finger === null ? "" : String(finger)
                if (kind === "ok" && cur) text = nn.note(cur.l, cur.alt)
                if (kind === "bad") text = nn.pitch(m, keyN)
                // notas da escala mais claras (só quando a casa mostra o nome)
                const tone = cfg.digits !== "names" || scale ? "scale" : "out"
                const note = kind === "fix" ? t.was_here : kind === "alt" ? t.also_ok : undefined
                return (
                  <BoardCell key={ci} open={open}>
                    <FretCell
                      name={text}
                      tone={tone}
                      number={ci}
                      open={open}
                      finger={cfg.digits === "names" ? finger : null}
                      note={note}
                      state={kind}
                      button={{
                        disabled: !!fb || !cur || !enabled,
                        onClick: () => onTap(si, ci),
                        "aria-label": fmt(t.cell_aria, { string: sname, pos: t.cols_long[ci] }),
                      }}
                    />
                  </BoardCell>
                )
              })}
            </BoardCells>
          </BoardRow>
        )
      })}
    </Board>
  )
}
