"use client"

import { MapPin } from "lucide-react"
import Sigil from "./Sigil"
import academicData from "@/assets/academic.json"

type EducationStatus = "Em curso" | "Concluído"

interface Education {
  seal: string
  degree: string
  school: string
  schoolFull: string
  location: string
  period: string
  status: EducationStatus
  statusNote: string | null
}

const EDUCATION = academicData.education as Education[]

function EduCard({ e }: { e: Education }) {
  const isCurrent = e.status === "Em curso"

  return (
    <article
      className="edu-card group relative flex gap-5 items-start p-[18px_16px] sm:p-[26px_28px] border border-line-soft bg-surface transition-[border-color,transform] duration-[250ms] hover:border-line hover:-translate-y-0.5"
    >
      <span className="ph-corner tl" /><span className="ph-corner tr" />
      <span className="ph-corner bl" /><span className="ph-corner br" />

      <div
        className="edu-seal relative shrink-0 grid place-items-center w-[44px] h-[44px] sm:w-[54px] sm:h-[54px] border border-line rounded-[3px] bg-bg transition-[border-color] duration-[250ms]"
        aria-hidden="true"
      >
        <span
          className="leading-none"
          style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--accent-bright)" }}
        >
          {e.seal}
        </span>
        <span
          className="absolute"
          style={{ top: -7, right: -7, background: "var(--surface)" }}
        >
          <Sigil />
        </span>
      </div>

      <div className="flex flex-col min-w-0">

        <span
          className={[
            "inline-flex items-center gap-[7px] self-start mb-[9px]",
            "uppercase tracking-[.1em]",
            isCurrent ? "text-accent-bright" : "text-faint",
          ].join(" ")}
          style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
        >
          <i
            className="not-italic shrink-0 rounded-full"
            style={isCurrent
              ? { width: 6, height: 6, background: "oklch(0.72 0.13 150)", boxShadow: "0 0 0 3px oklch(0.72 0.13 150 / 0.22)" }
              : { width: 6, height: 6, background: "var(--gold)" }
            }
          />
          {e.status}
          {e.statusNote && (
            <em className="not-italic opacity-85 tracking-[.04em]" style={{ color: "var(--faint)" }}>
              — {e.statusNote}
            </em>
          )}
        </span>

        <h3
          className="text-[19px] sm:text-[24px] leading-[1.12]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {e.degree}
        </h3>

        <span
          className="mt-[5px] text-[15px] sm:text-[18px] italic text-accent-bright"
          style={{ fontFamily: "var(--font-alt)" }}
        >
          {e.school}
        </span>

        <span className="mt-[2px] text-[14px] text leading-[1.4]">
          {e.schoolFull}
        </span>

        <div
          className="flex items-center gap-[9px] flex-wrap mt-[14px] text-[11px] text-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>{e.period}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span className="inline-flex items-center gap-[5px]">
            <MapPin size={12} aria-hidden="true" />
            {e.location}
          </span>
        </div>
      </div>
    </article>
  )
}

export default function AcademicInfo() {
  return (
    <div className="flex flex-col gap-3">
      {EDUCATION.map((e, i) => (
        <EduCard key={i} e={e} />
      ))}
    </div>
  )
}
