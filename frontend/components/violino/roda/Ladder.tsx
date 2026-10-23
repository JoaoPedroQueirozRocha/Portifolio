"use client"

import type { RodaDict } from "./i18n"
import { ladder, type Name, type State } from "./logic"

/* A mesma roda aberta numa linha, de Dó a Dó — as notas aparecem conforme se acerta */
interface Props {
  t: RodaDict
  st: State
  name: (n: Name) => string
}

export default function Ladder({ t, st, name }: Props) {
  const cells = ladder(st)
  return (
    <ol className="rd-ladder" aria-label={t.ladder.aria}>
      {cells.map((c, i) => {
        if (c.kind === "half") {
          return (
            <li key={i} className="rd-lad-half" title={t.ladder.half_title}>
              <b>½</b>
              <span>{t.ladder.half}</span>
            </li>
          )
        }
        const top = c.top ? (st.mode === "ordem" && !c.known ? "·" : name(c.top)) : "·"
        const sub = c.sub
          ? c.sub.map(name).join(" · ") || t.ladder.none
          : st.mode === "eq" ? t.ladder.unknown : ""
        const cls = ["rd-lad-note", c.black && "is-black", c.known && "is-known", c.hot && "is-hot"]
        return (
          <li key={i} className={cls.filter(Boolean).join(" ")}>
            <span className="rd-lad-top">{top}</span>
            <span className="rd-lad-sub">{sub}</span>
          </li>
        )
      })}
    </ol>
  )
}
