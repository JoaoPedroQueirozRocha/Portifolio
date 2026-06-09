import Header from "@/components/layout/Header"
export default function Home() {
  return (
    <main className="content-container flex flex-col">
      <Header />
      {/* Hero sample */}
      <section className="flex flex-col gap-3">
        <span className="eyebrow">
          <span className="lozenge" />
          Portfolio & Media Tracker
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
          Construindo coisas que eu mesmo uso no dia a dia.
        </p>
        <p
          className="text-[18px] mt-2 max-w-[50ch] leading-[1.72]"
          style={{ color: "var(--muted)" }}
        >
          Desenvolvedor Full Stack. Esta página confirma que o background,
          a tipografia e as cores do design estão aplicados corretamente.
        </p>
        <div className="flex gap-3 mt-4">
          <button
            className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-sm text-[15px] font-medium tracking-[.01em] transition-all hover:-translate-y-px"
            style={{ background: "var(--accent)", color: "var(--on-accent)", fontFamily: "var(--font-body)" }}
          >
            Ver projetos
          </button>
          <button
            className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-sm text-[15px] tracking-[.01em] transition-all hover:text-[--accent-bright]"
            style={{ border: "1px solid var(--line)", fontFamily: "var(--font-body)" }}
          >
            Entrar em contato
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
            <div
              key={label}
              className="flex items-end p-3 h-16"
              style={{ background: bg }}
            >
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

      {/* Tipografia */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-5">
          <span className="lozenge" />
          <span
            className="text-[11px] tracking-[.2em] uppercase"
            style={{ fontFamily: "var(--font-caps)", color: "var(--faint)" }}
          >
            Tipografia
          </span>
          <div className="sec-rule" />
        </div>
        <div className="divider-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              variable: "--font-display",
              name: "IM Fell English",
              role: "Títulos principais",
              sample: "The Quick Brown Fox",
              style: { fontFamily: "var(--font-display)", fontSize: "32px" },
            },
            {
              variable: "--font-alt",
              name: "Cormorant Garamond",
              role: "Display suave & itálicos",
              sample: "Cormorant Italic",
              style: { fontFamily: "var(--font-alt)", fontSize: "32px", fontStyle: "italic" },
            },
            {
              variable: "--font-body",
              name: "EB Garamond",
              role: "Corpo de texto",
              sample: "Corpo de texto corrido com serifa clássica.",
              style: { fontFamily: "var(--font-body)", fontSize: "20px" },
            },
            {
              variable: "--font-caps",
              name: "Cinzel",
              role: "Labels & small-caps",
              sample: "FRONTEND · BACKEND · DEVOPS",
              style: { fontFamily: "var(--font-caps)", fontSize: "16px", letterSpacing: ".14em" },
            },
            {
              variable: "--font-mono",
              name: "JetBrains Mono",
              role: "Tags & metadados",
              sample: "const x = 42; // mono",
              style: { fontFamily: "var(--font-mono)", fontSize: "16px" },
            },
          ].map(({ variable, name, role, sample, style }) => (
            <div key={variable} className="p-6 flex flex-col gap-2">
              <span
                className="text-[10px] tracking-[.16em] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "var(--accent-bright)" }}
              >
                {variable}
              </span>
              <p className="leading-tight" style={{ ...style, color: "var(--text)" }}>
                {sample}
              </p>
              <span
                className="text-[13px]"
                style={{ fontFamily: "var(--font-mono)", color: "var(--faint)" }}
              >
                {name} — {role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Status badges */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-5">
          <span className="lozenge" />
          <span
            className="text-[11px] tracking-[.2em] uppercase"
            style={{ fontFamily: "var(--font-caps)", color: "var(--faint)" }}
          >
            Elementos de UI
          </span>
          <div className="sec-rule" />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          {/* mono-tag */}
          <span
            className="text-[11px] px-[9px] py-[4px] rounded-sm tracking-[.01em]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", border: "1px solid var(--line-soft)" }}
          >
            Next.js
          </span>
          <span
            className="text-[11px] px-[9px] py-[4px] rounded-sm tracking-[.01em]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", border: "1px solid var(--line-soft)" }}
          >
            TypeScript
          </span>
          {/* Status — Concluído */}
          <span
            className="inline-flex items-center gap-2 text-[11px] tracking-[.04em] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
          >
            <span className="w-[6px] h-[6px] rounded-full" style={{ background: "var(--gold)" }} />
            Concluído
          </span>
          {/* Status — Em andamento */}
          <span
            className="inline-flex items-center gap-2 text-[11px] tracking-[.04em] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
          >
            <span className="w-[6px] h-[6px] rounded-full" style={{ background: "var(--celest)" }} />
            Em andamento
          </span>
          {/* Status — Quero ver */}
          <span
            className="inline-flex items-center gap-2 text-[11px] tracking-[.04em] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
          >
            <span className="w-[6px] h-[6px] rounded-full" style={{ background: "var(--rubric)" }} />
            Quero ver
          </span>
          {/* Rating */}
          <span
            className="inline-flex items-baseline gap-[1px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-[14px] font-medium" style={{ color: "var(--gold)" }}>8.5</span>
            <span className="text-[10.5px]" style={{ color: "var(--faint)" }}>/10</span>
          </span>
          {/* Sigil */}
          <span className="sigil">
            <span className="sigil-core" />
          </span>
        </div>
      </section>

    </main>
  )
}
