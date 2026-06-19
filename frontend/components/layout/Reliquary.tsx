"use client"

import { useState, useRef } from "react"
import academicData from "@/assets/academic.json"

type Tone = "celest" | "rubric" | "gold"

interface Accolade {
  tone: Tone
  kind: string
  seal: string
  title: string
  code: string
  issuer: string
  year: string
  desc: string
}

const ACCOLADES = academicData.accolades as Accolade[]

const toneColor: Record<Tone, string> = {
  celest: "var(--celest)",
  rubric: "var(--rubric)",
  gold:   "var(--gold)",
}

function RelicDetail({ item }: { item: Accolade }) {
  const color = toneColor[item.tone]
  return (
    <div
      className="relic-body flex flex-col gap-[6px] p-[18px_22px] border border-line-soft bg-surface"
      style={{ borderTop: `2px solid ${color}` }}
    >
      <div className="flex items-center gap-[10px] mb-[4px]">
        <span
          className="text-[10px] uppercase tracking-[.14em] px-[8px] py-[2px] rounded-[2px]"
          style={{
            fontFamily: "var(--font-mono)",
            color,
            border: `1px solid ${color}`,
            opacity: 0.85,
          }}
        >
          {item.kind}
        </span>
        {item.year && (
          <span
            className="ml-auto text-[11px] text-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {item.year}
          </span>
        )}
      </div>

      <p
        className="text-[20px] leading-[1.15] text-text"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {item.title}
      </p>

      <span
        className="text-[11px] tracking-[.05em] text-accent-bright"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {item.code}
      </span>

      <span
        className="italic text-[15px] text-accent-bright"
        style={{ fontFamily: "var(--font-alt)" }}
      >
        {item.issuer}
      </span>

      <p className="text-[15px] text-text leading-[1.6] mt-[4px] max-w-[58ch]">
        {item.desc}
      </p>
    </div>
  )
}

export default function Reliquary() {
  const [open, setOpen] = useState(-1)
  const lastOpen = useRef(0)
  if (open >= 0) lastOpen.current = open
  const shown = ACCOLADES[open >= 0 ? open : lastOpen.current]

  return (
    <div>

      <div className="col-wax flex flex-wrap gap-x-[34px] gap-y-[30px] py-[6px]">
        {ACCOLADES.map((a, i) => {
          const active = open === i
          return (
            <button
              key={i}
              className={"seal seal-" + a.tone + (active ? " active" : "")}
              onClick={() => setOpen(active ? -1 : i)}
              aria-expanded={active}
              aria-label={`${a.kind}: ${a.title}`}
              style={{ width: 84, display: "flex", flexDirection: "column", alignItems: "center", gap: 11, background: "none", border: "none", cursor: "pointer" }}
            >
              <span className="seal-disc">
                <span className="seal-ring" aria-hidden="true" />
                <span className="seal-init">{a.seal}</span>
              </span>
              <span
                className="seal-cap text-[9.5px] uppercase tracking-[.12em] text-center transition-colors duration-200"
                style={{ fontFamily: "var(--font-mono)", color: active ? "var(--accent-bright)" : "var(--faint)" }}
              >
                {a.kind}
              </span>
            </button>
          )
        })}
      </div>

      <div className={"relic-detail mt-[8px]" + (open >= 0 ? " open" : "")}>
        <div className="relic-detail-inner">
          {shown && <RelicDetail item={shown} />}
        </div>
      </div>
    </div>
  )
}
