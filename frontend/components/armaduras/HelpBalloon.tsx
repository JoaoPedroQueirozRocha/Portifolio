"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { SHAPE_IDS } from "@/lib/armaduras"
import KeyStaff from "./KeyStaff"
import { Lozenge, Rich, useArmText } from "./text"

export default function HelpBalloon({ onClose }: { onClose: () => void }) {
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
        <button type="button" className="arm-x" onClick={onClose} aria-label={t.actions.close}><X size={15} /></button>
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
