"use client"

import type { Dictionary } from "@/app/[lang]/dictionaries"

interface BioProps {
  hero: Dictionary["hero"]
}

export default function Bio({ hero }: BioProps) {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>

      {/* Eyebrow */}
      <span className="eyebrow" style={{ marginBottom: "14px", display: "inline-flex" }}>
        <span className="lozenge" />
        {hero.eyebrow}
      </span>

      {/* Nome — escala de 38px (mobile) a 78px (desktop) */}
      <h1
        className="text-[38px] sm:text-[56px] lg:text-[78px]"
        style={{
          fontFamily: "var(--font-display)",
          letterSpacing: ".01em",
          lineHeight: "0.96",
        }}
      >
        João Pedro
      </h1>

      {/* Bio com drop cap */}
      <p
        className="hero-bio text-[15px] sm:text-[17px] lg:text-[18px]"
        style={{
          color: "var(--muted)",
          maxWidth: "50ch",
          marginTop: "18px",
          lineHeight: "1.72",
        }}
      >
        {hero.bio}
      </p>

      {/* Tagline — visível em todas as telas, menor no mobile */}
      <p
        className="text-[14px] sm:text-[17px] lg:text-[20px]"
        style={{
          fontFamily: "var(--font-alt)",
          fontStyle: "italic",
          color: "var(--faint)",
          marginTop: "12px",
          maxWidth: "48ch",
          lineHeight: "1.4",
        }}
      >
        {hero.bio_short}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap gap-[10px] mt-5 lg:mt-[30px]">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm text-[13px] sm:text-[14px] lg:text-[15px] font-medium tracking-[.01em] transition-all duration-[180ms] hover:-translate-y-px"
          style={{
            padding: "8px 14px",
            fontFamily: "var(--font-body)",
            background: "var(--accent)",
            color: "var(--on-accent)",
            textDecoration: "none",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--accent-bright)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--accent)"
          }}
        >
          {hero.cta_github}
        </a>

        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm text-[13px] sm:text-[14px] lg:text-[15px] font-medium tracking-[.01em] transition-all duration-[180ms] hover:-translate-y-px"
          style={{
            padding: "8px 14px",
            fontFamily: "var(--font-body)",
            border: "1px solid var(--line)",
            color: "var(--text)",
            textDecoration: "none",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
            ;(e.currentTarget as HTMLElement).style.color = "var(--accent-bright)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"
            ;(e.currentTarget as HTMLElement).style.color = "var(--text)"
          }}
        >
          {hero.cta_linkedin}
        </a>

        <a
          href="/cv.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm text-[13px] sm:text-[14px] lg:text-[15px] font-medium tracking-[.01em] transition-all duration-[180ms] hover:-translate-y-px"
          style={{
            padding: "8px 14px",
            fontFamily: "var(--font-body)",
            border: "1px solid var(--line)",
            color: "var(--text)",
            textDecoration: "none",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
            ;(e.currentTarget as HTMLElement).style.color = "var(--accent-bright)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"
            ;(e.currentTarget as HTMLElement).style.color = "var(--text)"
          }}
        >
          {hero.cta_cv}
        </a>
      </div>
    </div>
  )
}
