"use client"

import { useState } from "react"
import { MapPin, ArrowRight, ArrowDown } from "lucide-react"

/* ---------------------------------------------------------------
   Types
--------------------------------------------------------------- */

export interface ExperienceEntry {
  /** Cargo / título do papel */
  role: string
  /** Nome da empresa */
  company: string
  /** Período exibido (ex: "jan 2024 — mai 2026") */
  period: string
  /** Duração opcional (ex: "2 anos · 5 meses") */
  range?: string
  /** Cidade / estado */
  location?: string
  /** Parágrafo descritivo */
  desc: string
  /** Bullet points de realizações */
  points: string[]
  /** Tags de tecnologias usadas */
  stack?: string[]
}

interface ExperienceTimelineProps {
  /** Array de experiências — da mais recente para a mais antiga */
  entries: ExperienceEntry[]
  /** Índice do item aberto por padrão (0 = primeiro, -1 = nenhum) */
  defaultOpen?: number
}

/* ---------------------------------------------------------------
   Helpers
--------------------------------------------------------------- */

/** Stagger delay para os bullets ao abrir */
function bulletDelay(i: number): React.CSSProperties {
  return { transitionDelay: `${0.12 + i * 0.07}s` }
}

/* ---------------------------------------------------------------
   Component
--------------------------------------------------------------- */

export default function ExperienceTimeline({
  entries,
  defaultOpen = 0,
}: ExperienceTimelineProps) {
  const [open, setOpen] = useState<number>(defaultOpen)

  function toggle(i: number) {
    setOpen((cur) => (cur === i ? -1 : i))
  }

  return (
    <ol className="xp-timeline">
      {entries.map((entry, i) => {
        const isOpen = open === i

        return (
          <li
            key={i}
            className={["xp-item", isOpen ? "open" : ""].filter(Boolean).join(" ")}
          >
            {/* Marcador na linha do tempo */}
            <span className="xp-marker" aria-hidden="true">
              <span className="lozenge" />
            </span>

            {/* Linha clicável — role + company à esq, período + chevron à dir */}
            <button
              className="xp-row"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
            >
              {/* Cabeçalho: role em cima, company em baixo */}
              <span className="xp-head">
                <span className="xp-role">{entry.role}</span>
                <span className="xp-co">{entry.company}</span>
              </span>

              {/* Período + chevron direcional */}
              <span className="xp-when">
                <span className="xp-period">{entry.period}</span>
                {isOpen
                  ? <ArrowDown size={16} className="xp-chev" aria-hidden="true" />
                  : <ArrowRight size={16} className="xp-chev" aria-hidden="true" />
                }
              </span>
            </button>

            {/* Painel expandível */}
            <div className={["xp-detail", isOpen ? "open" : ""].filter(Boolean).join(" ")}>
              <div className="xp-detail-inner">

                {/* Descrição */}
                <p className="xp-desc">{entry.desc}</p>

                {/* Bullets de realizações */}
                {entry.points.length > 0 && (
                  <ul className="xp-bullets">
                    {entry.points.map((point, j) => (
                      <li
                        key={j}
                        className="xp-bullet"
                        style={bulletDelay(j)}
                      >
                        <span className="lozenge" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Localização */}
                {entry.location && (
                  <span className="xp-loc">
                    <MapPin size={13} aria-hidden="true" />
                    {entry.location}
                  </span>
                )}

                {/* Stack de tecnologias */}
                {entry.stack && entry.stack.length > 0 && (
                  <div className="xp-stack">
                    {entry.stack.map((tag) => (
                      <span key={tag} className="mono-tag">{tag}</span>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
