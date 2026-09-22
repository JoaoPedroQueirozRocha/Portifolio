/**
 * Astrolabe — marca-d'água decorativa SVG.
 * Server Component puro (sem hooks). Animações via globals.css.
 * Usar com position:absolute/fixed no elemento pai.
 *
 * Tamanho: fluido. O wrapper (.astrolabe) lê --astro-size, que o consumidor
 * ajusta por breakpoint; o SVG escala junto via viewBox + width/height 100%.
 */

const S  = 480
const cx = S / 2
const cy = S / 2
const R1 = 228
const R2 = 192
const R3 = 148
const R4 = 104
const R5 = 62

function pt(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arc(r: number, a1: number, a2: number) {
  const p1 = pt(r, a1)
  const p2 = pt(r, a2)
  const large = a2 - a1 > 180 ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`
}

function Ticks({ outerR, step, len, majorStep, majorLen }: {
  outerR: number; step: number; len: number; majorStep?: number; majorLen?: number
}) {
  const lines = []
  for (let deg = 0; deg < 360; deg += step) {
    const isMajor = majorStep != null && deg % majorStep === 0
    const tickLen = isMajor ? (majorLen ?? len * 2) : len
    const p1 = pt(outerR, deg)
    const p2 = pt(outerR - tickLen, deg)
    lines.push(
      <line key={deg}
        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke="currentColor"
        strokeWidth={isMajor ? 1.2 : 0.6}
        opacity={isMajor ? 0.7 : 0.4}
      />
    )
  }
  return <>{lines}</>
}

function Pointers({ r, step, size }: { r: number; step: number; size: number }) {
  const tris = []
  for (let deg = 0; deg < 360; deg += step) {
    const tip = pt(r, deg)
    const b1  = pt(r + size * 1.8, deg - 4)
    const b2  = pt(r + size * 1.8, deg + 4)
    tris.push(
      <polygon key={deg}
        points={`${tip.x},${tip.y} ${b1.x},${b1.y} ${b2.x},${b2.y}`}
        fill="currentColor" opacity={0.5}
      />
    )
  }
  return <>{tris}</>
}

function Spokes({ innerR, outerR, step }: { innerR: number; outerR: number; step: number }) {
  const lines = []
  for (let deg = 0; deg < 360; deg += step) {
    const p1 = pt(innerR, deg)
    const p2 = pt(outerR, deg)
    lines.push(
      <line key={deg}
        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke="currentColor" strokeWidth={0.7} opacity={0.35}
      />
    )
  }
  return <>{lines}</>
}

const layerStyle = (name: string, duration: string): React.CSSProperties => ({
  transformOrigin: `${cx}px ${cy}px`,
  animationName: name,
  animationDuration: duration,
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
})

export default function Astrolabe({
  className = "",
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`astrolabe pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={style}
    >
      <svg
        viewBox={`0 0 ${S} ${S}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", color: "var(--gold)" }}
      >

        {/* Camada 1 — anel externo + marcações — gira horário 120s */}
        <g style={layerStyle("astro-cw-slow", "120s")} opacity={0.55}>
          <circle cx={cx} cy={cy} r={R1} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.6} />
          <circle cx={cx} cy={cy} r={R1 - 14} fill="none" stroke="currentColor" strokeWidth={0.5} opacity={0.3} />
          <Ticks outerR={R1} step={5} len={8} majorStep={30} majorLen={18} />
          <Pointers r={R1 - 28} step={90} size={6} />
        </g>

        {/* Camada 2 — 24 divisões + ponteiros — gira anti-horário 90s */}
        <g style={layerStyle("astro-ccw-slow", "90s")} opacity={0.5}>
          <circle cx={cx} cy={cy} r={R2} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.5} />
          <Ticks outerR={R2} step={15} len={10} majorStep={45} majorLen={18} />
          <Pointers r={R2 - 22} step={45} size={5} />
        </g>

        {/* Camada 3 — armila + raios — estática */}
        <g opacity={0.45}>
          <circle cx={cx} cy={cy} r={R3} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.55} />
          <Spokes innerR={R4 + 4} outerR={R3 - 4} step={45} />
          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
            <path key={deg}
              d={arc(R3 - 20, deg - 16, deg + 16)}
              fill="none" stroke="currentColor" strokeWidth={1.4} opacity={0.4}
            />
          ))}
        </g>

        {/* Camada 4 — anel interno + cruz cardinal — gira horário 60s */}
        <g style={layerStyle("astro-cw-medium", "60s")} opacity={0.6}>
          <circle cx={cx} cy={cy} r={R4} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.6} />
          <Ticks outerR={R4} step={10} len={6} majorStep={90} majorLen={12} />
          <line x1={cx - R4} y1={cy} x2={cx + R4} y2={cy} stroke="currentColor" strokeWidth={0.7} opacity={0.45} />
          <line x1={cx} y1={cy - R4} x2={cx} y2={cy + R4} stroke="currentColor" strokeWidth={0.7} opacity={0.45} />
          {[45, -45].map((deg) => {
            const cos = Math.cos((deg * Math.PI) / 180)
            const sin = Math.sin((deg * Math.PI) / 180)
            return (
              <line key={deg}
                x1={cx - R4 * cos} y1={cy - R4 * sin}
                x2={cx + R4 * cos} y2={cy + R4 * sin}
                stroke="currentColor" strokeWidth={0.6} opacity={0.3}
              />
            )
          })}
        </g>

        {/* Camada 5 — anel do núcleo — gira anti-horário 40s */}
        <g style={layerStyle("astro-ccw-fast", "40s")} opacity={0.65}>
          <circle cx={cx} cy={cy} r={R5} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.6} />
          <Ticks outerR={R5} step={30} len={8} majorStep={90} majorLen={14} />
          <Pointers r={R5 - 16} step={90} size={5} />
        </g>

        {/* Núcleo — losango pulsante */}
        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          animationName: "astro-pulse",
          animationDuration: "6s",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
        }}>
          <circle cx={cx} cy={cy} r={10} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.8} />
          <rect
            x={cx - 5.5} y={cy - 5.5} width={11} height={11}
            fill="currentColor"
            transform={`rotate(45, ${cx}, ${cy})`}
            opacity={0.9}
          />
        </g>

      </svg>
    </div>
  )
}
