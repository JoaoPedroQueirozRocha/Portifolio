"use client"

import type { RodaDict } from "./i18n"
import { bankFor, isSpecial, nameKey, tileView, type Name, type State } from "./logic"

/* O banco de nomes: naturais, com ♯ e com ♭ — a gente escolhe aqui */
interface Props {
  t: RodaDict
  st: State
  name: (n: Name) => string
  onPick: (n: Name) => void
}

export default function Bank({ t, st, name, onPick }: Props) {
  return (
    <div className="rd-bank" role="group" aria-label={t.bank.aria}>
      {bankFor(st).map(({ row, tiles }) => (
        <div key={row} className="rd-bank-row">
          <span className="rd-bank-label">{t.bank[row]}</span>
          <div className="rd-tiles">
            {tiles.map((n) => {
              const v = tileView(st, n)
              const mark: string = v.mark === "" ? "" : v.mark === "alias" && v.alias ? t.bank.alias.replace("{name}", name(v.alias)) : t.bank[v.mark as "used"]
              const cls = ["rd-tile", isSpecial(n) && "is-special", v.dim && "is-dim", v.mark && `is-${v.mark}`]
              return (
                <button
                  key={nameKey(n)}
                  type="button"
                  className={cls.filter(Boolean).join(" ")}
                  aria-label={name(n) + (mark ? `, ${mark}` : "")}
                  onClick={() => onPick(n)}
                >
                  <span>{name(n)}</span>
                  <span className="rd-tile-mark">{mark}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
