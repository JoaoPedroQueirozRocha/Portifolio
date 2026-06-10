interface SectionHeaderProps {
  numeral: string
  label: string
  title: string
}

export default function SectionHeader({ numeral, label, title }: SectionHeaderProps) {
  return (
    <header className="flex items-start gap-4 lg:gap-5 mb-8 lg:mb-[38px]">

      {/* Numeral itálico iluminado */}
      <span
        aria-hidden="true"
        className="text-[24px] sm:text-[28px] lg:text-[34px] shrink-0 text-center"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          color: "var(--accent)",
          lineHeight: "1",
          minWidth: "32px",
        }}
      >
        {numeral}
      </span>

      {/* Label + título */}
      <div className="flex flex-col gap-[5px] shrink-0">
        <span
          className="text-[10px] lg:text-[11px] uppercase tracking-[.2em]"
          style={{ fontFamily: "var(--font-caps)", color: "var(--faint)" }}
        >
          {label}
        </span>
        <h2
          className="text-[22px] sm:text-[30px] lg:text-[38px] leading-none tracking-[.01em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
      </div>

      {/* Linha decorativa */}
      <span
        aria-hidden="true"
        className="flex-1 h-px self-start mt-[22px] lg:mt-[30px]"
        style={{ background: "linear-gradient(90deg, var(--line), var(--line-soft))" }}
      />

      {/* Sigil */}
      <span
        aria-hidden="true"
        className="shrink-0 relative inline-grid place-items-center mt-[17px] lg:mt-[23px]"
        style={{
          width: "14px",
          height: "14px",
          border: "1px solid var(--accent)",
          borderRadius: "50%",
        }}
      >
        <span className="absolute w-full h-px" style={{ background: "var(--accent)", opacity: 0.45 }} />
        <span className="absolute w-px h-full" style={{ background: "var(--accent)", opacity: 0.45 }} />
        <span className="z-10" style={{ width: "4px", height: "4px", background: "var(--accent)", transform: "rotate(45deg)" }} />
      </span>

    </header>
  )
}
