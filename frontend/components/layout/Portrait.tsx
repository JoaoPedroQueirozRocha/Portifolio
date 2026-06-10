'use client'
import Image from "next/image"
import type { Dictionary } from "@/app/[lang]/dictionaries"

interface PortraitProps {
  portrait: Dictionary["portrait"]
  /** Em modo compact só exibe a foto, sem cantos decorativos nem badge */
  compact?: boolean
}

export default function Portrait({ portrait, compact = false }: PortraitProps) {
  if (compact) {
    return (
      <Image
        src="/profile.jpeg"
        alt="Portrait"
        fill
        sizes="80px"
        style={{ objectFit: "cover" }}
      />
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", position: "relative", zIndex: 1 }}>

      {/* Retrato com cantos decorativos */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/5",
          border: "1px solid var(--line)",
          background: `repeating-linear-gradient(135deg, var(--line-soft) 0 1px, transparent 1px 13px), var(--surface)`,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Cantos decorativos */}
        <span style={{ position: "absolute", top: "-1px", left: "-1px",   width: "13px", height: "13px", borderTop: "1px solid var(--accent)", borderLeft: "1px solid var(--accent)" }} />
        <span style={{ position: "absolute", top: "-1px", right: "-1px",  width: "13px", height: "13px", borderTop: "1px solid var(--accent)", borderRight: "1px solid var(--accent)" }} />
        <span style={{ position: "absolute", bottom: "-1px", left: "-1px",  width: "13px", height: "13px", borderBottom: "1px solid var(--accent)", borderLeft: "1px solid var(--accent)" }} />
        <span style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "13px", height: "13px", borderBottom: "1px solid var(--accent)", borderRight: "1px solid var(--accent)" }} />

        {/* Imagem */}
        <Image src="/profile.jpeg" alt="Portrait" width={300} height={300} />
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
          justifyContent: "center",
          padding: "8px",
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
        {portrait.available}
      </span>

    </div>
  )
}
