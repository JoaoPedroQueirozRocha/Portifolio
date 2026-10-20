/* ---------------------------------------------------------------
   Acidentes desenhados em SVG, centrados em (x, y) — a linha/espaço
   da nota. `k` escala o glifo (1 = tamanho da pauta de Armaduras).
--------------------------------------------------------------- */

interface GlyphProps {
  x: number
  y: number
  k?: number
}

const at = (x: number, y: number, k: number) => `translate(${x} ${y}) scale(${k})`

export function SharpGlyph({ x, y, k = 1 }: GlyphProps) {
  const bar = (yc: number) => `-5,${yc + 2.6} 5,${yc - 0.4} 5,${yc - 2.6} -5,${yc + 0.4}`
  return (
    <g transform={at(x, y, k)}>
      <line x1={-2} y1={-11} x2={-2} y2={13} stroke="currentColor" strokeWidth="1.1" />
      <line x1={2} y1={-13} x2={2} y2={11} stroke="currentColor" strokeWidth="1.1" />
      <polygon points={bar(-3.5)} fill="currentColor" />
      <polygon points={bar(3.5)} fill="currentColor" />
    </g>
  )
}

// a barriga do bemol fica centrada em y
export function FlatGlyph({ x, y, k = 1 }: GlyphProps) {
  return (
    <g transform={at(x, y, k)}>
      <line x1={-3} y1={-17} x2={-3} y2={4.6} stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M-3,4.6 C1,2 6.5,-1.5 3.5,-4 C1.5,-5.6 -1,-3.6 -3,-1.2"
        fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"
      />
    </g>
  )
}

export function NaturalGlyph({ x, y, k = 1 }: GlyphProps) {
  return (
    <g transform={at(x, y, k)}>
      <line x1={-5} y1={-19} x2={-5} y2={6} stroke="currentColor" strokeWidth="1.6" />
      <line x1={5} y1={-9} x2={5} y2={19} stroke="currentColor" strokeWidth="1.6" />
      <polygon points="-5,-2.5 5,-6.5 5,-10 -5,-6" fill="currentColor" />
      <polygon points="-5,7 5,3 5,-0.5 -5,3.5" fill="currentColor" />
    </g>
  )
}

export function AccidentalGlyph({ alt, ...p }: GlyphProps & { alt: -1 | 0 | 1 }) {
  return alt === 1 ? <SharpGlyph {...p} /> : alt === -1 ? <FlatGlyph {...p} /> : <NaturalGlyph {...p} />
}
