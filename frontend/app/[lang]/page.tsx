import { notFound } from "next/navigation"
import { getDictionary, isValidLocale } from "./dictionaries"
import Portrait from "@/components/layout/Portrait"
import Bio from "@/components/layout/Bio"
import SectionHeader from "@/components/ui/SectionHeader"
import ExperienceTimeline from "@/components/ui/ExperienceTimeline"
import { EXPERIENCE } from "@/lib/experience"
import TechDetails from "@/components/layout/TechDetails"
import Astrolabe from "@/components/layout/Astrolabe"
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <main className="content-container flex flex-col" style={{ position: "relative" }}>

      {/* Astrolábio — posicionado no canto sup-dir da main, atrás de tudo */}
      <Astrolabe
        style={{
          position: "absolute",
          top: "-30px",
          right: "-300px",
          opacity: 0.28,
          zIndex: 0,
        }}
      />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "54px",
          alignItems: "center",
          padding: "76px 0 80px",
        }}
      >
        <Portrait portrait={dict.portrait} />
        <Bio hero={dict.hero} />
      </section>
      <section style={{ position: "relative", zIndex: 1, padding: "64px 0", borderTop: "1px solid var(--line-soft)" }}>
        <SectionHeader
          numeral="I"
          label={dict.sections.stack.label}
          title={dict.sections.stack.title}
        />
        <TechDetails tech={dict.tech} />
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "64px 0", borderTop: "1px solid var(--line-soft)" }}>
        <SectionHeader
          numeral="II"
          label={dict.sections.experience.label}
          title={dict.sections.experience.title}
        />
        <ExperienceTimeline entries={EXPERIENCE} defaultOpen={0} />
      </section>


    </main>
  )
}
