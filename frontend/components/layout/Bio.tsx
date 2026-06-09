"use client"

import type { Dictionary } from "@/app/[lang]/dictionaries"

interface BioProps {
  hero: Dictionary["hero"]
}

export default function Bio({ hero }: BioProps) {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>

      {/* Eyebrow */}
      <span
        className="eyebrow"
        style={{ marginBottom: "18px", display: "inline-flex" }}
      >
        <span className="lozenge" />
        {hero.eyebrow}
      </span>

      {/* Nome */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "78px",
          letterSpacing: ".01em",
          lineHeight: "0.96",
        }}
      >
        João Pedro
      </h1>

      {/* Bio com drop cap via CSS first-letter */}
      <p
        className="hero-bio"
        style={{
          fontSize: "18px",
          color: "var(--muted)",
          maxWidth: "50ch",
          marginTop: "22px",
          lineHeight: "1.72",
        }}
      >
        {hero.bio}
      </p>

      {/* Tagline itálica */}
      <p
        style={{
          fontFamily: "var(--font-alt)",
          fontStyle: "italic",
          fontSize: "20px",
          color: "var(--faint)",
          marginTop: "16px",
          maxWidth: "48ch",
          lineHeight: "1.4",
        }}
      >
        {hero.bio_short}
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: "10px", marginTop: "30px", flexWrap: "wrap" }}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: "4px",
            letterSpacing: ".01em",
            background: "var(--accent)",
            color: "var(--on-accent)",
            transition: ".18s",
            textDecoration: "none",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--accent-bright)"
            ;(e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--accent)"
            ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
          }}
        >
          {hero.cta_github}
        </a>

        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: "4px",
            letterSpacing: ".01em",
            border: "1px solid var(--line)",
            color: "var(--text)",
            transition: ".18s",
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
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: "4px",
            letterSpacing: ".01em",
            border: "1px solid var(--line)",
            color: "var(--text)",
            transition: ".18s",
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
