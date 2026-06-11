"use client"

import { useState, useRef } from "react"
import { MapPin } from "lucide-react"

/* ── dados ──────────────────────────────────────────────────────────── */

const EDUCATION = [
  {
    seal: "P",
    degree: "Bacharelado em Engenharia de Software",
    school: "PUC Minas",
    schoolFull: "Pontifícia Universidade Católica de Minas Gerais",
    location: "Belo Horizonte, MG",
    period: "jan 2023 — dez 2026",
    status: "Em curso" as const,
    statusNote: "previsão de conclusão",
  },
  {
    seal: "C",
    degree: "Técnico em Desenvolvimento Web e Mobile",
    school: "Colégio COTEMIG",
    schoolFull: "Ensino Médio Técnico integrado",
    location: "Belo Horizonte, MG",
    period: "fev 2020 — nov 2022",
    status: "Concluído" as const,
    statusNote: null,
  },
]

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

const ACCOLADES: Accolade[] = [
  {
    tone: "celest",
    kind: "Certificação",
    seal: "RH",
    title: "Red Hat System Administration I",
    code: "RH124",
    issuer: "Red Hat",
    year: "",
    desc: "Fundamentos de administração de sistemas Linux corporativos, gerenciamento de processos e automações de infraestrutura.",
  },
  {
    tone: "rubric",
    kind: "Distinção",
    seal: "V",
    title: "Melhores Trabalhos — 5º Período",
    code: "Trabalho Interdisciplinar de Software",
    issuer: "PUC Minas",
    year: "2025",
    desc: "Reconhecimento de melhor trabalho da disciplina entre as turmas do período.",
  },
  {
    tone: "rubric",
    kind: "Distinção",
    seal: "IV",
    title: "Melhores Trabalhos — 4º Período",
    code: "Trabalho Interdisciplinar de Software",
    issuer: "PUC Minas",
    year: "mar 2025",
    desc: "Reconhecimento de melhor trabalho da disciplina entre as turmas do período.",
  },
  {
    tone: "rubric",
    kind: "Distinção",
    seal: "II",
    title: "Melhores Trabalhos — 2º Período",
    code: "Trabalho Interdisciplinar de Software",
    issuer: "PUC Minas",
    year: "abr 2024",
    desc: "Reconhecimento de melhor trabalho da disciplina entre as turmas do período.",
  },
]

/* ── tokens de cor por tom ────────────────────────────────────────── */
const toneColor: Record<Tone, string> = {
  celest: "var(--celest)",
  rubric: "var(--rubric)",
  gold:   "var(--gold)",
}

/* ── sub-componentes ─────────────────────────────────────────────────── */

function Sigil() {
  return (
    <span
      className="relative inline-grid place-items-center shrink-0"
      aria-hidden="true"
      style={{ width: 14, height: 14, border: "1px solid var(--accent)", borderRadius: "50%" }}
    >
      <span className="absolute w-full h-px" style={{ background: "var(--accent)", opacity: 0.45 }} />
      <span className="absolute w-px h-full" style={{ background: "var(--accent)", opacity: 0.45 }} />
      <span className="z-10" style={{ width: 4, height: 4, background: "var(--accent)", transform: "rotate(45deg)" }} />
    </span>
  )
}

function EduCard({ e }: { e: typeof EDUCATION[number] }) {
  const isCurrent = e.status === "Em curso"

  return (
    <article
      className="edu-card group relative flex gap-5 items-start p-[18px_16px] sm:p-[26px_28px] border border-line-soft bg-surface transition-[border-color,transform] duration-[250ms] hover:border-line hover:-translate-y-0.5"
    >
      {/* cantos decorativos — hover gerenciado via CSS (grupo filho) */}
      <span className="ph-corner tl" /><span className="ph-corner tr" />
      <span className="ph-corner bl" /><span className="ph-corner br" />

      {/* monograma da instituição */}
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
        {/* sigil posicionado no canto */}
        <span
          className="absolute"
          style={{ top: -7, right: -7, background: "var(--surface)" }}
        >
          <Sigil />
        </span>
      </div>

      {/* conteúdo */}
      <div className="flex flex-col min-w-0">

        {/* status */}
        <span
          className={[
            "inline-flex items-center gap-[7px] self-start mb-[9px]",
            "uppercase tracking-[.1em]",
            isCurrent ? "text-accent-bright" : "text-faint",
          ].join(" ")}
          style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
        >
          {/* dot */}
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

function RelicDetail({ item }: { item: Accolade }) {
  const color = toneColor[item.tone]
  return (
    <div
      className="relic-body flex flex-col gap-[6px] p-[18px_22px] border border-line-soft bg-surface"
      style={{ borderTop: `2px solid ${color}` }}
    >
      {/* linha superior: badge de tipo + ano */}
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
        className="italic text-[14px] text-muted"
        style={{ fontFamily: "var(--font-alt)" }}
      >
        {item.issuer}
      </span>

      <p className="text-[14px] text-muted leading-[1.6] mt-[4px] max-w-[58ch]">
        {item.desc}
      </p>
    </div>
  )
}

function Reliquary() {
  const [open, setOpen] = useState(-1)
  const lastOpen = useRef(0)
  if (open >= 0) lastOpen.current = open
  const shown = ACCOLADES[open >= 0 ? open : lastOpen.current]

  return (
    <div className="mt-[40px]">

      {/* cabeçalho */}
      <div className="flex items-center gap-[14px] mb-[26px]">
        <Sigil />
        <span
          className="text-[11px] uppercase tracking-[.2em] text-muted whitespace-nowrap"
          style={{ fontFamily: "var(--font-caps)" }}
        >
          Selos &amp; reconhecimentos
        </span>
        <span
          className="hidden sm:inline italic text-[14px] text-faint whitespace-nowrap"
          style={{ fontFamily: "var(--font-alt)" }}
        >
          toque um selo para revelar
        </span>
        <span
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, var(--line-soft), transparent)" }}
        />
      </div>

      {/* fileira de selos */}
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

      {/* painel expansível — grid-rows 0→1fr */}
      <div className={"relic-detail mt-[8px]" + (open >= 0 ? " open" : "")}>
        <div className="relic-detail-inner">
          {shown && <RelicDetail item={shown} />}
        </div>
      </div>
    </div>
  )
}

/* ── componente principal ────────────────────────────────────────────── */

export default function AcademicInfo() {
  return (
    <div className="flex flex-col gap-3">
      {EDUCATION.map((e, i) => (
        <EduCard key={i} e={e} />
      ))}
      <Reliquary />
    </div>
  )
}
