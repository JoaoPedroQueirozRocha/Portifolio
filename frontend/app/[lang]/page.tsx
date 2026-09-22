import { notFound } from "next/navigation"
import { getDictionary, isValidLocale } from "./dictionaries"
import Portrait from "@/components/layout/Portrait"
import Bio from "@/components/layout/Bio"
import SectionHeader from "@/components/ui/SectionHeader"
import ExperienceTimeline from "@/components/ui/ExperienceTimeline"
import { EXPERIENCE } from "@/lib/experience"
import TechDetails from "@/components/layout/TechDetails"
import Astrolabe from "@/components/layout/Astrolabe"
import AcademicInfo from "@/components/layout/AcademicInfo"
import Reliquary from "@/components/layout/Reliquary"

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <main className="content-container flex flex-col" style={{ position: "relative" }}>

      {/* Astrolábio — canto sup-dir da main, atrás de tudo.
          Tamanho e sangria por breakpoint em .astrolabe-hero (globals.css) */}
      <Astrolabe className="astrolabe-hero" />

      {/* ── HERO ───────────────────────────────────────────────────────────
          Mobile  : Bio em cima (nome grande), Portrait abaixo como card
          Desktop : Portrait à esq (coluna fixa), Bio à dir               */}
      <section className="relative z-[1] py-8 sm:py-14 lg:py-[76px] lg:pb-[80px]">

        {/* Desktop: grid de 2 colunas — aparece somente em md+ */}
        <div className="hidden md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] gap-10 lg:gap-[54px] items-center">
          <Portrait portrait={dict.portrait} />
          <Bio hero={dict.hero} />
        </div>

        {/* Mobile: empilhado, portrait menor embaixo */}
        <div className="flex flex-col gap-6 md:hidden">
          {/* Bio primeiro — nome e CTAs são o conteúdo principal */}
          <Bio hero={dict.hero} />

          {/* Portrait compacto abaixo — menor, sem badge, lado a lado com available */}
          <div className="flex items-center gap-4 mt-2">
            {/* Foto pequena */}
            <div
              className="shrink-0"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "4px",
                border: "1px solid var(--line)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Portrait portrait={dict.portrait} compact />
            </div>

            {/* Badge "Aberto a propostas" */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: ".04em",
                color: "var(--muted)",
                padding: "8px 12px",
                border: "1px solid var(--line-soft)",
                borderRadius: "3px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "oklch(0.72 0.13 150)",
                  boxShadow: "0 0 0 3px oklch(0.72 0.13 150 / 0.2)",
                  flexShrink: 0,
                }}
              />
              {dict.portrait.available}
            </span>
          </div>
        </div>

      </section>

      {/* ── STACK ──────────────────────────────────────────────────────── */}
      <section className="relative z-[1] py-8 sm:py-12 lg:py-[64px]" style={{ borderTop: "1px solid var(--line-soft)" }}>
        <SectionHeader
          numeral="I"
          label={dict.sections.stack.label}
          title={dict.sections.stack.title}
        />
        <TechDetails tech={dict.tech} labels={dict.tech_groups} />
      </section>

      {/* ── EXPERIÊNCIA ────────────────────────────────────────────────── */}
      <section className="relative z-[1] py-8 sm:py-12 lg:py-[64px]" style={{ borderTop: "1px solid var(--line-soft)" }}>
        <SectionHeader
          numeral="II"
          label={dict.sections.experience.label}
          title={dict.sections.experience.title}
        />
        <ExperienceTimeline entries={EXPERIENCE} defaultOpen={0} />
      </section>

      {/* ── FORMAÇÃO ────────────────────────────────────────────────── */}
      <section className="relative z-[1] py-8 sm:py-12 lg:py-[64px]" style={{ borderTop: "1px solid var(--line-soft)" }}>
        <SectionHeader
          numeral="III"
          label={dict.sections.education.label}
          title={dict.sections.education.title}
        />
        <AcademicInfo />
      </section>

      {/* ── RELICÁRIO ───────────────────────────────────────────────── */}
      <section className="relative z-[1] py-8 sm:py-12 lg:py-[64px]" style={{ borderTop: "1px solid var(--line-soft)" }}>
        <SectionHeader
          numeral="IV"
          label={dict.sections.accolades.label}
          title={dict.sections.accolades.title}
        />
        <Reliquary />
      </section>

    </main>
  )
}
