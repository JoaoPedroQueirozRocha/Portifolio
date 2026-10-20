"use client"

import { STRINGS, type NoteNames } from "@/lib/armaduras"
import { FINGER_COLS, OPEN_MIDI, inScale, type Config, type ReadNote } from "@/lib/leitura"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import { fmt } from "../shared/text"

type OTDict = Dictionary["onde_tocar"]

const DIGITS = ["0", "1", "1", "2", "2", "3", "3", "4"]

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

/** Braço na 1ª posição: 4 cordas × (solta + 7 casas de meio tom) */
export default function Fingerboard({ t, nn, cfg, keyN, cur, fb, onTap }: FingerboardProps) {
  const cols = Array.from({ length: FINGER_COLS }, (_, ci) => ci)

  return (
    <div className="ot-board">
      <div className="ot-board-head" aria-hidden="true">
        <span />
        {t.cols.map((c) => <span key={c}>{c}</span>)}
      </div>

      {STRINGS.map((sg, si) => {
        const enabled = cfg.strings[si]
        const sname = nn.note(sg.l)
        return (
          <div key={si} className={"ot-row" + (enabled ? "" : " is-off")}>
            <div className="ot-sname">
              <span>{enabled ? t.string_cap : t.string_off}</span>
              <b>{sname}</b>
            </div>
            {cols.map((ci) => {
              const m = OPEN_MIDI[si] + ci
              let kind: "" | "ok" | "bad" | "fix" | "alt" = ""
              if (fb && cur && enabled) {
                if (fb.si === si && fb.ci === ci) kind = fb.ok ? "ok" : "bad"
                else if (m === cur.midi) kind = fb.ok ? "alt" : "fix"
              }

              let text = ""
              let scaleCls = ""
              if (cfg.digits === "names") {
                text = nn.pitch(m, keyN)
                scaleCls = inScale(m, keyN) ? " is-scale" : " is-out"
              } else if (cfg.digits === "digits") text = DIGITS[ci]
              if (kind === "ok" && cur) text = nn.note(cur.l, cur.alt)
              if (kind === "bad") text = nn.pitch(m, keyN)

              const note = kind === "fix" ? t.was_here : kind === "alt" ? t.also_ok : ""
              return (
                <div key={ci} className={"ot-cell" + (ci === 0 ? " is-open" : "")}>
                  <span className="ot-wire" />
                  <button
                    type="button"
                    className={"ot-spot" + scaleCls + (kind ? " is-" + kind : "")}
                    disabled={!!fb || !cur || !enabled}
                    onClick={() => onTap(si, ci)}
                    aria-label={fmt(t.cell_aria, { string: sname, pos: t.cols_long[ci] })}
                  >
                    {text}
                  </button>
                  {note && <span className="ot-cell-note">{note}</span>}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
