import Link from "next/link"

interface LogoProps {
  href?: string
}

export default function Logo({ href = "/" }: LogoProps) {
  return (
    <Link href={href} className="flex items-center gap-3">
      {/* brand-mark: caixa com sigil flutuando no topo */}
      <div
        className="relative w-9 h-9 flex items-center justify-center rounded-sm"
        style={{ border: "1px solid var(--line)" }}
      >        
        {/* iniciais */}
        <span
          className="text-[17px] tracking-[.02em]"
          style={{ fontFamily: "var(--font-display)", color: "var(--accent-bright)" }}
        >
          JP
        </span>
      </div>

      {/* nome completo */}
      <span
        className="text-[23px] tracking-[.01em] whitespace-nowrap"
        style={{ fontFamily: "var(--font-display)" }}
      >
        João Pedro
      </span>
    </Link>
  )
}
