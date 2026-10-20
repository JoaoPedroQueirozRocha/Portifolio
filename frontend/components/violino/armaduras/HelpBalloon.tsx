"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { X } from "lucide-react"
import { SHAPE_IDS, keysForPitch, makeNoteNames, spellings, tonic } from "@/lib/armaduras"
import KeyStaff from "./KeyStaff"
import { useViolinoText } from "../shared/text"
import { ArmTextContext, buildKeyName, fmt, Lozenge, Rich, useArmText, type ArmDict } from "./text"

/* ---------------------------------------------------------------
   Botão "?" + balão "Como ler uma armadura". Traz o próprio contexto
   de textos, então funciona em qualquer modo do caderno — basta
   passar o dicionário de Armaduras.
--------------------------------------------------------------- */
export function HelpButton({ t }: { t: ArmDict }) {
  const { letters } = useViolinoText()
  const text = useMemo(() => {
    const nn = makeNoteNames(letters)
    return { t, nn, keyName: buildKeyName(t, nn) }
  }, [t, letters])
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <ArmTextContext.Provider value={text}>
      <div className="arm-help-wrap">
        <button
          type="button"
          className={"arm-help-btn" + (open ? " on" : "")}
          onClick={() => setOpen(!open)}
          aria-label={t.actions.help}
          aria-expanded={open}
        >
          ?
        </button>
        {open && <HelpBalloon onClose={close} />}
      </div>
    </ArmTextContext.Provider>
  )
}

function HelpBalloon({ onClose }: { onClose: () => void }) {
  const { t } = useArmText()
  const h = t.help
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    const down = (e: MouseEvent) => {
      const target = e.target as Element
      if (ref.current && !ref.current.contains(target) && !target.closest(".arm-help-btn")) onClose()
    }
    document.addEventListener("keydown", key)
    document.addEventListener("mousedown", down)
    return () => {
      document.removeEventListener("keydown", key)
      document.removeEventListener("mousedown", down)
    }
  }, [onClose])

  return (
    <div className="arm-help" ref={ref} role="dialog" aria-label={t.actions.help}>
      <div className="arm-help-head">
        <h4>{h.title}</h4>
        <button type="button" className="vl-x" onClick={onClose} aria-label={t.actions.close}><X size={15} /></button>
      </div>
      <ul className="arm-rules">
        {h.rules.map((r, i) => <li key={i}><Rich text={r} /></li>)}
      </ul>
      <div className="arm-help-ex">
        <KeyStaff n={3} mini />
        <p><Rich text={h.example_sharps} /></p>
      </div>
      <div className="arm-help-ex">
        <KeyStaff n={-2} mini />
        <p><Rich text={h.example_flats} /></p>
      </div>
      <RelativeLookup />
      <h5>{h.forms}</h5>
      <div className="arm-forms">
        {SHAPE_IDS.map((id) => {
          const f = t.shapes[id]
          return (
            <div key={id} className="arm-form">
              <span className="arm-shape-badge">{f.label}</span>
              <span className="arm-form-pair">{f.pair}</span>
              <span className="arm-form-ex">{f.example}</span>
            </div>
          )
        })}
      </div>
      <p className="arm-tip"><Lozenge /> {h.tip}</p>
    </div>
  )
}

/** Dó Ré Mi ½ Fá Sol Lá Si ½ Dó */
export function HalfRuler() {
  const { t, nn } = useArmText()
  const seq: (number | "½")[] = [0, 1, 2, "½", 3, 4, 5, 6, "½", 0]
  return (
    <div className="arm-ruler" aria-label={t.ruler_aria}>
      {seq.map((x, i) =>
        x === "½"
          ? <span key={i} className="arm-ruler-h">½</span>
          : <span key={i} className="arm-ruler-n">{nn.note(x)}</span>
      )}
    </div>
  )
}

const accLabel = (n: number, h: { acc_none: string; acc_sharps: string; acc_flats: string }) =>
  n === 0 ? h.acc_none : fmt(n > 0 ? h.acc_sharps : h.acc_flats, { n: Math.abs(n) })

/** Escolhe uma nota → outros nomes dela, tonalidade maior e relativa menor */
function RelativeLookup() {
  const { t, nn, keyName } = useArmText()
  const h = t.help
  const [pc, setPc] = useState(6) // Fá♯ — o exemplo clássico de equivalente

  // rótulo de cada nota: a tônica da armadura mais simples (Ré♭, não Dó♯)
  const chips = Array.from({ length: 12 }, (_, p) => {
    const tn = tonic(keysForPitch(p)[0])
    return { p, label: nn.note(tn.l, tn.alt) }
  })
  const names = spellings(pc).map((s) => nn.note(s.l, s.alt))
  const keys = keysForPitch(pc)
  const main = tonic(keys[0])
  const mainName = nn.note(main.l, main.alt)
  const others = names.filter((x) => x !== mainName)

  return (
    <div className="arm-rel">
      <h5>{h.relatives_title}</h5>
      <ul className="arm-rules">
        <li><Rich text={h.relative_rule} /></li>
        <li><Rich text={h.enharmonic_rule} /></li>
      </ul>
      <div className="arm-rel-pick" role="group" aria-label={h.lookup_label}>
        <span className="vl-seg-l">{h.lookup_label}</span>
        <div className="arm-rel-chips">
          {chips.map((c) => (
            <button
              key={c.p}
              type="button"
              className={"vl-tab" + (c.p === pc ? " active" : "")}
              aria-pressed={c.p === pc}
              onClick={() => setPc(c.p)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="arm-rel-out" aria-live="polite">
        <p>
          {others.length
            ? <Rich text={fmt(h.lookup_note, { note: mainName, others: others.join(" / ") })} />
            : <Rich text={fmt(h.lookup_note_single, { note: mainName })} />}
        </p>
        {keys.length > 1 && <p className="arm-rel-same">{h.lookup_same_sound}</p>}
        {keys.map((n) => (
          <p key={n} className="arm-rel-key">
            <Rich text={fmt(h.lookup_key, { key: keyName(n, "major"), acc: accLabel(n, h), rel: keyName(n, "minor") })} />
          </p>
        ))}
      </div>
    </div>
  )
}
