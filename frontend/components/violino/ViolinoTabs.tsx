"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { VIOLINO_MODES } from "./modes"
import { useViolinoText } from "./shared/text"

export default function ViolinoTabs({ lang }: { lang: string }) {
  const t = useViolinoText()
  const pathname = usePathname()

  return (
    <nav className="vl-tabs" aria-label={t.tabs_aria}>
      <div className="vl-tabs-brand" aria-hidden="true">
        <span>{t.brand_top}</span>
        <span>{t.brand_bottom}</span>
      </div>
      {VIOLINO_MODES.filter((m) => m.enabled).map((m) => {
        const href = `/${lang}/violino/${m.slug}`
        const active = pathname.startsWith(href)
        const label = t.modes[m.id]
        return (
          <Link
            key={m.id}
            href={href}
            className={"vl-tabs-item" + (active ? " active" : "")}
            aria-current={active ? "page" : undefined}
          >
            <span className="vl-tabs-num">{m.numeral}</span>
            <span className="vl-tabs-text">
              <span className="vl-tabs-label">{label.label}</span>
              <span className="vl-tabs-hint">{label.hint}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
