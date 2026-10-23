"use client"

import type { EcoDict } from "./i18n"
import type { EcoText } from "./text"
import type { State } from "./logic"

/* Fim da rodada: números, as 8 notas com as tentativas e o que deu trabalho */
interface Props {
  t: EcoDict
  tx: EcoText
  st: State
  onTrain: (hard: number[]) => void
  onNew: () => void
}

export default function Summary({ t, tx, st, onTrain, onNew }: Props) {
  const s = tx.summary(st)
  const noHard = s.hardIdx.length === 0

  return (
    <div className="ec-sum">
      <div className="ec-sum-stats">
        {s.stats.map((x) => (
          <div key={x.label}>
            <span className="ec-eyebrow is-faint">{x.label}</span>
            <b>{x.value}</b>
            <i>{x.sub}</i>
          </div>
        ))}
      </div>

      <div className="ec-sum-block">
        <span className="ec-eyebrow">{t.summary.notes_title}</span>
        <div className="ec-sum-notes">
          {s.notes.map((n, i) => (
            <div key={i} className={"ec-sum-note is-" + n.tone}>
              <span className="ec-sum-jump">{n.jump}</span>
              <b>{n.name}</b>
              <span className="ec-marks" aria-hidden="true">
                {n.marks.map((bad, k) => <i key={k} className={bad ? "is-bad" : "is-ok"} />)}
              </span>
              <span className="ec-sum-status">{n.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ec-sum-boxes">
        <div>
          <span className="ec-eyebrow">{t.summary.hard_title}</span>
          <p>{s.hard}</p>
        </div>
        <div>
          <span className="ec-eyebrow">{t.summary.jumps_title}</span>
          <p>{s.jumps}</p>
        </div>
      </div>

      <div className="ec-sum-actions">
        <button type="button" className="vl-btn vl-btn-ghost" disabled={noHard} onClick={() => onTrain(s.hardIdx)}>
          {t.summary.train}
        </button>
        <button type="button" className="vl-btn vl-btn-primary" onClick={onNew}>{t.summary.new_round}</button>
      </div>
    </div>
  )
}
