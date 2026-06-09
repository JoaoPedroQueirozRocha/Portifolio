import { notFound } from "next/navigation"
import { getDictionary, isValidLocale } from "./dictionaries"

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <main className="content-container flex flex-col">
      {/* Hero sample */}
      <section className="flex flex-col gap-3">
        <span className="eyebrow">
          <span className="lozenge" />
          {dict.hero.eyebrow}
        </span>
        <h1
          className="text-[78px] leading-[0.96] tracking-[.01em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          João Pedro
        </h1>
        <p
          className="text-[20px] italic mt-2"
          style={{ fontFamily: "var(--font-alt)", color: "var(--faint)" }}
        >
          {dict.hero.bio}
        </p>
        <div className="flex gap-3 mt-4">
          <button
            className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-sm text-[15px] font-medium tracking-[.01em] transition-all hover:-translate-y-px"
            style={{ background: "var(--accent)", color: "var(--on-accent)", fontFamily: "var(--font-body)" }}
          >
            {dict.hero.cta_projects}
          </button>
          <button
            className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-sm text-[15px] tracking-[.01em] transition-all hover:text-[--accent-bright]"
            style={{ border: "1px solid var(--line)", fontFamily: "var(--font-body)" }}
          >
            {dict.hero.cta_contact}
          </button>
        </div>
      </section>

      {/* Paleta */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-5">
          <span className="lozenge" />
          <span
            className="text-[11px] tracking-[.2em] uppercase"
            style={{ fontFamily: "var(--font-caps)", color: "var(--faint)" }}
          >
            Paleta de Cores
          </span>
          <div className="sec-rule" />
        </div>
        <div className="grid grid-cols-4 gap-[1px] border border-[--line-soft] bg-[--line-soft]">
          {[
            { label: "--bg",            bg: "var(--bg)" },
            { label: "--bg-2",          bg: "var(--bg-2)" },
            { label: "--surface",       bg: "var(--surface)" },
            { label: "--surface-2",     bg: "var(--surface-2)" },
            { label: "--accent",        bg: "var(--accent)" },
            { label: "--accent-bright", bg: "var(--accent-bright)" },
            { label: "--gold",          bg: "var(--gold)" },
            { label: "--rubric",        bg: "var(--rubric)" },
            { label: "--celest",        bg: "var(--celest)" },
            { label: "--text",          bg: "var(--text)" },
            { label: "--muted",         bg: "var(--muted)" },
            { label: "--faint",         bg: "var(--faint)" },
          ].map(({ label, bg }) => (
            <div key={label} className="flex items-end p-3 h-16" style={{ background: bg }}>
              <span
                className="text-[10px] tracking-[.06em] mix-blend-difference opacity-80"
                style={{ fontFamily: "var(--font-mono)", color: "white" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}
