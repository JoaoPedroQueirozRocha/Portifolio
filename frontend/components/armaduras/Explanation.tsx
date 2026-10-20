"use client"

import { Fragment } from "react"
import { X } from "lucide-react"
import {
  STRINGS, accLetters, keyAcc, relMinor, scale, stringAnswer, tonic,
  type Mode, type StringAnswer, type ViolinString,
} from "@/lib/armaduras"
import KeyStaff from "./KeyStaff"
import { fmt, Lozenge, Rich, useArmText } from "./text"

/** Linhas de "como ler a armadura" para n acidentes */
function useHowToRead(n: number) {
  const { t, nn, keyName } = useArmText()
  const r = t.read
  const list = accLetters(n).map((l) => nn.note(l, n > 0 ? 1 : -1))
  const key = keyName(n, "major")
  const tn = tonic(n)

  if (n === 0) return [r.none_1, fmt(r.none_2, { key })]
  if (n > 0) {
    return [
      fmt(r.sharps_1, { n, word: n === 1 ? r.sharp_one : r.sharp_many, list: list.join(", ") }),
      fmt(r.sharps_2, { last: list[list.length - 1], tonic: nn.note(tn.l, tn.alt), key }),
    ]
  }
  if (n === -1) return [fmt(r.flat_one_1, { list: list[0] }), fmt(r.flat_one_2, { key })]
  return [
    fmt(r.flats_1, { n: -n, list: list.join(", ") }),
    fmt(r.flats_2, { penult: list[list.length - 2], key }),
  ]
}

function NoteChain({ s, p, ans }: { s: ViolinString; p: number; ans: StringAnswer }) {
  const { nn } = useArmText()
  const items: { k: number; name: string; out?: boolean }[] = []
  if (p === 1) items.push({ k: 0, name: nn.note(s.l), out: ans.openOut })
  ans.letters.forEach((l, i) => items.push({ k: i + 1, name: nn.note(l, ans.alts[i]) }))

  return (
    <div className="arm-chain">
      {items.map((it, i) => {
        const prev = items[i - 1]
        const half = prev && ans.halves.includes(prev.k)
        const stretch = prev && ans.stretches.includes(prev.k)
        return (
          <Fragment key={it.k}>
            {prev && (
              <span className={"arm-chain-gap" + (half ? " is-half" : "") + (stretch ? " is-stretch" : "")}>
                {half ? "½" : stretch ? "1½" : ""}
              </span>
            )}
            <span className={"arm-chain-n" + (it.out ? " is-out" : "")}><i>{it.k}</i>{it.name}</span>
          </Fragment>
        )
      })}
    </div>
  )
}

interface ExplanationProps {
  n: number
  mode: Mode
  p: number
  onClose: () => void
}

export default function Explanation({ n, mode, p, onClose }: ExplanationProps) {
  const { t, nn, keyName } = useArmText()
  const ex = t.explain
  const sc = scale(n)
  const rel = relMinor(n)
  const relNote = nn.note(rel.l, rel.alt)
  const lines = useHowToRead(n)
  const acc = keyAcc(n)

  return (
    <section className="arm-explain" aria-label={ex.aria}>
      <header className="arm-explain-head">
        <span className="eyebrow"><Lozenge /> {ex.eyebrow}</span>
        <h3>{keyName(n, "major")} <span>· {fmt(ex.relative, { key: keyName(n, "minor") })}</span></h3>
        <button type="button" className="arm-x" onClick={onClose} aria-label={ex.close}><X size={16} /></button>
      </header>

      <div className="arm-explain-grid">
        <div className="arm-ex-block">
          <h4>{ex.how_to_read}</h4>
          <KeyStaff n={n} mini />
          {lines.map((l, i) => <p key={i}>{l}</p>)}
          {mode === "minor" && <p><Rich as="strong" text={fmt(ex.rel_minor_note, { key: keyName(n, "minor") })} /></p>}
        </div>
        <div className="arm-ex-block">
          <h4>{ex.scale_notes}</h4>
          <div className="arm-scale">
            {sc.map((x, i) => (
              <span key={i} className={"arm-scale-n" + (x.altered ? " is-alt" : "") + (i === 5 ? " is-rel" : "")}>
                <i>{i + 1}</i>{nn.note(x.l, x.alt)}
              </span>
            ))}
          </div>
          <p className="arm-note">{fmt(ex.scale_note, { note: relNote })}</p>
        </div>
      </div>

      <div className="arm-ex-block arm-ex-violin">
        <h4>{fmt(ex.on_violin, { pos: fmt(ex.pos_name, { n: p }) })}</h4>
        <div className="arm-ex-strings">
          {STRINGS.map((s) => {
            const a = stringAnswer(s, p, n)
            const sh = t.shapes[a.shape]
            return (
              <div key={s.l} className="arm-ex-string">
                <div className="arm-ex-s-head">
                  <b>{nn.note(s.l)}</b>
                  <span className="arm-shape-badge">{sh.label}</span>
                  <span className="arm-ex-desc">{sh.desc}</span>
                </div>
                <NoteChain s={s} p={p} ans={a} />
                {(a.openOut || a.stretches.length > 0) && (
                  <ul className="arm-alerts">
                    {a.openOut && (
                      <li>{fmt(ex.open_out_alert, { string: nn.note(s.l), note: nn.note(s.l, acc[s.l]) })}</li>
                    )}
                    {a.stretches.map((k) => (
                      <li key={k}>{fmt(ex.stretch_alert, { a: k, b: k + 1 })}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
