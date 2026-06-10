/**
 * SectionHeader — cabeçalho de seção do design medieval/manuscript.
 *
 * Estrutura (da esquerda para direita):
 *   [numeral itálico] [label mono + title display] [linha decorativa flex:1] [sigil astrolábio]
 *
 * Props:
 *   numeral  — algarismo romano (ex: "I", "II")
 *   label    — eyebrow mono uppercase (ex: "Domínio técnico") — vem do dicionário
 *   title    — título display grande (ex: "A forja") — vem do dicionário
 *
 * CSS extraído do design original:
 *   .sec-head      — flex, align-items:flex-start, gap:20px, margin-bottom:38px
 *   .sec-numeral   — font-display italic 34px, color:accent, line-height:1, min-width:42px
 *   .sec-label     — font-caps 11px, letter-spacing:.2em, uppercase, color:faint
 *   .sec-title     — font-display 38px, letter-spacing:.01em, line-height:1, white-space:nowrap
 *   .sec-rule      — flex:1, h:1px, gradient line→line-soft, margin-top:30px
 *   .sec-sigil     — margin-top:23px (o sigil astrolábio no fim)
 */

interface SectionHeaderProps {
  numeral: string
  label: string
  title: string
}

export default function SectionHeader({ numeral, label, title }: SectionHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "20px",
        marginBottom: "38px",
      }}
    >
      {/* Numeral itálico iluminado */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "34px",
          color: "var(--accent)",
          lineHeight: "1",
          minWidth: "42px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {numeral}
      </span>

      {/* Label + título */}
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", flexShrink: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-caps)",
            fontSize: "11px",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--faint)",
          }}
        >
          {label}
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "38px",
            letterSpacing: ".01em",
            lineHeight: "1",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h2>
      </div>

      {/* Linha decorativa */}
      <span
        aria-hidden="true"
        style={{
          flex: "1",
          height: "1px",
          background: "linear-gradient(90deg, var(--line), var(--line-soft))",
          marginTop: "30px",
          alignSelf: "flex-start",
        }}
      />

      {/* Sigil astrolábio */}
      <span
        aria-hidden="true"
        style={{
          marginTop: "23px",
          position: "relative",
          width: "14px",
          height: "14px",
          border: "1px solid var(--accent)",
          borderRadius: "50%",
          display: "inline-grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {/* Cruz horizontal */}
        <span
          style={{
            position: "absolute",
            width: "100%",
            height: "1px",
            background: "var(--accent)",
            opacity: 0.45,
          }}
        />
        {/* Cruz vertical */}
        <span
          style={{
            position: "absolute",
            height: "100%",
            width: "1px",
            background: "var(--accent)",
            opacity: 0.45,
          }}
        />
        {/* Losango central */}
        <span
          style={{
            width: "4px",
            height: "4px",
            background: "var(--accent)",
            transform: "rotate(45deg)",
            zIndex: 1,
          }}
        />
      </span>
    </header>
  )
}
