'use client'

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react'

/* -----------------------------------------------------------------------
   Types
----------------------------------------------------------------------- */

export interface AstrolabeLoaderProps {
  /** Tamanho do canvas em px. Default: 380 */
  size?: number
  /** Texto exibido abaixo do canvas. Default: "Carregando" */
  label?: string
  /** Exibe barra de progresso. Default: true */
  showProgress?: boolean
  /** Duração da barra de progresso em ms. Default: 3500 */
  duration?: number
  /** Callback chamado quando a barra atinge 100% */
  onComplete?: () => void
  /** Classe CSS extra para o wrapper externo */
  className?: string
}

interface Particle {
  angle: number
  dist: number
  baseOpacity: number
  size: number
  speed: number
  drift: number
  driftSpeed: number
}

interface Ring {
  radius: number
  lineWidth: number
  majorTicks: number
  subTicks: number
  speed: number         // rad/frame (+ = CW, - = CCW)
  angle: number
}

interface Orbit {
  radius: number
  speed: number
  angle: number
  jewelRadius: number
  jewelColorKey: 'jewel' | 'jewel2' | 'jewel3'
  satellites: { orbitRadius: number; speed: number; angle: number }[]
}

interface Needle {
  length: number
  speed: number
  angle: number
  lineWidth: number
  alpha: number
}

/* -----------------------------------------------------------------------
   Paleta — espelha os tokens do design (âmbar/ouro medieval)
   Lida a cada frame via getComputedStyle para responder a mudança de tema
----------------------------------------------------------------------- */

interface Palette {
  ring: string
  ringDim: string
  tick: string
  needle: string
  /** accent do design — ouro âmbar */
  jewel: string
  /** celest — índigo do astrolábio */
  jewel2: string
  /** rubric — vermelho manuscrito */
  jewel3: string
  orbit: string
  planet: string
  center: string
  dustBase: string        // cor base sem alpha, ex: "80 68 32"
  dustIsDark: boolean
}

function getColors(): Palette {
  if (typeof window === 'undefined') {
    return {
      ring: 'rgba(255,255,255,0.18)', ringDim: 'rgba(255,255,255,0.07)',
      tick: 'rgba(255,255,255,0.35)', needle: 'rgba(255,255,255,0.9)',
      jewel: '#d4a85a', jewel2: '#7a90d4', jewel3: '#c86b4a',
      orbit: 'rgba(255,255,255,0.10)', planet: 'rgba(255,255,255,0.55)',
      center: '#d4a85a', dustBase: '255 220 150', dustIsDark: true,
    }
  }

  const root  = document.documentElement
  const theme = root.getAttribute('data-theme') ?? 'dark'
  const dark  = theme === 'dark'

  // Lê valores CSS computados para reutilizar as variáveis reais do design
  const style = getComputedStyle(root)
  const accent      = style.getPropertyValue('--accent').trim()       || (dark ? 'oklch(0.78 0.10 84)' : 'oklch(0.58 0.10 72)')
  const accentBrite = style.getPropertyValue('--accent-bright').trim() || accent
  const celest      = style.getPropertyValue('--celest').trim()       || (dark ? 'oklch(0.66 0.10 258)' : 'oklch(0.55 0.10 250)')
  const rubric      = style.getPropertyValue('--rubric').trim()       || (dark ? 'oklch(0.58 0.16 32)'  : 'oklch(0.50 0.16 32)')

  if (dark) {
    return {
      ring:      'rgba(255, 230, 160, 0.16)',
      ringDim:   'rgba(255, 230, 160, 0.06)',
      tick:      'rgba(255, 215, 120, 0.32)',
      needle:    'rgba(255, 235, 180, 0.88)',
      jewel:     accentBrite,   // ouro âmbar
      jewel2:    celest,        // índigo
      jewel3:    rubric,        // rubric/coral
      orbit:     'rgba(255, 215, 120, 0.09)',
      planet:    'rgba(255, 220, 140, 0.50)',
      center:    accent,
      dustBase:  '255 210 130',
      dustIsDark: true,
    }
  } else {
    return {
      ring:      'rgba(100, 80, 20, 0.14)',
      ringDim:   'rgba(100, 80, 20, 0.05)',
      tick:      'rgba(90, 70, 10, 0.26)',
      needle:    'rgba(60, 45, 10, 0.82)',
      jewel:     accentBrite,
      jewel2:    celest,
      jewel3:    rubric,
      orbit:     'rgba(100, 80, 20, 0.08)',
      planet:    'rgba(80, 60, 15, 0.42)',
      center:    accent,
      dustBase:  '90 70 20',
      dustIsDark: false,
    }
  }
}

/* -----------------------------------------------------------------------
   Helpers de desenho
----------------------------------------------------------------------- */

function drawRing(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  ring: Ring,
  colors: Palette,
) {
  const { radius, lineWidth, majorTicks, subTicks, angle } = ring

  // Círculo
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = colors.ring
  ctx.lineWidth   = lineWidth
  ctx.stroke()

  // Ticks maiores
  ctx.strokeStyle = colors.tick
  for (let i = 0; i < majorTicks; i++) {
    const a = angle + (i / majorTicks) * Math.PI * 2
    const cos = Math.cos(a), sin = Math.sin(a)
    ctx.globalAlpha = 0.6
    ctx.lineWidth   = 0.8
    ctx.beginPath()
    ctx.moveTo(cx + cos * (radius - 7), cy + sin * (radius - 7))
    ctx.lineTo(cx + cos * radius, cy + sin * radius)
    ctx.stroke()

    // Sub-ticks entre dois ticks maiores
    if (subTicks > 0) {
      const step = (1 / majorTicks) * Math.PI * 2
      for (let s = 1; s <= subTicks; s++) {
        const sa  = a + (s / (subTicks + 1)) * step
        const cs  = Math.cos(sa), ss = Math.sin(sa)
        ctx.globalAlpha = 0.3
        ctx.lineWidth   = 0.5
        ctx.beginPath()
        ctx.moveTo(cx + cs * (radius - 3), cy + ss * (radius - 3))
        ctx.lineTo(cx + cs * radius, cy + ss * radius)
        ctx.stroke()
      }
    }
  }

  ctx.restore()
}

function drawOrbit(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  orbit: Orbit,
  colors: Palette,
) {
  const { radius, angle, jewelRadius, jewelColorKey, satellites } = orbit
  const jewelColor = colors[jewelColorKey] as string

  // Órbita tracejada
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = colors.orbit
  ctx.lineWidth   = 0.8
  ctx.setLineDash([3, 5])
  ctx.stroke()
  ctx.setLineDash([])

  // Posição da joia
  const jx = cx + Math.cos(angle) * radius
  const jy = cy + Math.sin(angle) * radius

  // Joia principal
  ctx.beginPath()
  ctx.arc(jx, jy, jewelRadius, 0, Math.PI * 2)
  ctx.fillStyle = jewelColor
  ctx.globalAlpha = 0.85
  ctx.fill()
  // Highlight interno
  ctx.beginPath()
  ctx.arc(jx - jewelRadius * 0.25, jy - jewelRadius * 0.25, jewelRadius * 0.45, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fill()

  // Satélites
  for (const sat of satellites) {
    const sx = jx + Math.cos(sat.angle) * sat.orbitRadius
    const sy = jy + Math.sin(sat.angle) * sat.orbitRadius
    ctx.beginPath()
    ctx.arc(sx, sy, 1.8, 0, Math.PI * 2)
    ctx.fillStyle = colors.planet
    ctx.globalAlpha = 0.7
    ctx.fill()
  }

  ctx.restore()
}

function drawNeedle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  needle: Needle,
  colors: Palette,
) {
  const { length, angle, lineWidth, alpha } = needle
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.globalAlpha  = alpha
  ctx.strokeStyle  = colors.needle
  ctx.lineWidth    = lineWidth

  // Haste principal
  ctx.beginPath()
  ctx.moveTo(-length * 0.2, 0)
  ctx.lineTo(length, 0)
  ctx.stroke()

  // Ponta traseira triangular
  ctx.beginPath()
  ctx.moveTo(-length * 0.6, 3)
  ctx.lineTo(-length * 0.9, 0)
  ctx.lineTo(-length * 0.6, -3)
  ctx.closePath()
  ctx.fillStyle = colors.needle
  ctx.fill()

  ctx.restore()
}

/* -----------------------------------------------------------------------
   Componente
----------------------------------------------------------------------- */

export function AstrolabeLoader({
  size     = 380,
  label    = 'Carregando',
  showProgress = true,
  duration = 3500,
  onComplete,
  className,
}: AstrolabeLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number | undefined>(undefined)

  // Estado mutável do loop — fora do React para zero re-renders por frame
  const stateRef = useRef<{
    particles: Particle[]
    rings:     Ring[]
    orbits:    Orbit[]
    needles:   Needle[]
    frame:     number
    startTime: number
    progress:  number
  } | null>(null)

  const [displayProgress, setDisplayProgress] = useState(0)
  const [dots, setDots]   = useState('')
  const [done, setDone]   = useState(false)

  // Inicializa o estado mutável uma única vez por montagem
  const initState = useCallback((s: number) => {
    const cx = s / 2

    const particles: Particle[] = Array.from({ length: 110 }, () => ({
      angle:       Math.random() * Math.PI * 2,
      dist:        30 + Math.random() * 155,
      baseOpacity: 0.08 + Math.random() * 0.45,
      size:        0.5 + Math.random() * 1.6,
      speed:       (Math.random() - 0.5) * 0.0024,
      drift:       Math.random() * Math.PI * 2,
      driftSpeed:  0.009 + Math.random() * 0.022,
    }))

    const rings: Ring[] = [
      { radius: 155, lineWidth: 1.2, majorTicks: 36, subTicks: 4, speed:  0.00045, angle: 0 },
      { radius: 138, lineWidth: 0.8, majorTicks: 24, subTicks: 0, speed: -0.0009,  angle: 0 },
      { radius: 118, lineWidth: 1.0, majorTicks: 48, subTicks: 2, speed:  0.0006,  angle: 0 },
      { radius:  48, lineWidth: 0.7, majorTicks: 16, subTicks: 0, speed: -0.0018,  angle: 0 },
    ]

    const orbits: Orbit[] = [
      {
        radius: 62, speed: 0.0055, angle: 0,
        jewelRadius: 4.5, jewelColorKey: 'jewel',
        satellites: [{ orbitRadius: 10, speed: 0.036, angle: 0 }],
      },
      {
        radius: 95, speed: -0.0033, angle: Math.PI * 0.7,
        jewelRadius: 3.5, jewelColorKey: 'jewel2',
        satellites: [
          { orbitRadius: 14, speed: -0.054, angle: 0 },
          { orbitRadius: 14, speed: -0.054, angle: Math.PI },
        ],
      },
      {
        radius: 130, speed: 0.0021, angle: Math.PI * 1.4,
        jewelRadius: 5.0, jewelColorKey: 'jewel3',
        satellites: [],
      },
    ]

    const needles: Needle[] = [
      { length: Math.round(cx * 0.58), speed:  0.0042, angle: 0,              lineWidth: 1.2, alpha: 0.75 },
      { length: Math.round(cx * 0.42), speed: -0.0027, angle: Math.PI * 0.55, lineWidth: 0.8, alpha: 0.45 },
    ]

    stateRef.current = { particles, rings, orbits, needles, frame: 0, startTime: performance.now(), progress: 0 }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // HiDPI
    const dpr = window.devicePixelRatio || 1
    canvas.width  = size * dpr
    canvas.height = size * dpr
    canvas.style.width  = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const framesTotal = duration / (1000 / 60)
    const increment   = 100 / framesTotal

    initState(size)

    function frame() {
      if (!stateRef.current) return
      const S = stateRef.current
      const colors = getColors()

      ctx!.clearRect(0, 0, size, size)

      // 1 — Poeira
      ctx!.save()
      for (const p of S.particles) {
        p.angle += p.speed
        p.drift += p.driftSpeed
        const x = cx + (p.dist + Math.sin(p.drift) * 3) * Math.cos(p.angle)
        const y = cx + (p.dist + Math.sin(p.drift) * 3) * Math.sin(p.angle)
        const op = p.baseOpacity * (0.5 + 0.5 * Math.sin(p.drift * 1.7 + p.angle * 3))
        ctx!.beginPath()
        ctx!.arc(x, y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${colors.dustBase} / ${op})`
        ctx!.fill()
      }
      ctx!.restore()

      // 2 — Anéis
      for (const ring of S.rings) {
        ring.angle += ring.speed
        drawRing(ctx!, cx, cx, ring, colors)
      }

      // 3 — Anel interno de referência
      ctx!.save()
      ctx!.beginPath()
      ctx!.arc(cx, cx, 30, 0, Math.PI * 2)
      ctx!.strokeStyle = colors.ringDim
      ctx!.lineWidth   = 0.5
      ctx!.stroke()
      ctx!.restore()

      // 4 — Órbitas + joias
      for (const orbit of S.orbits) {
        orbit.angle += orbit.speed
        for (const sat of orbit.satellites) sat.angle += sat.speed
        drawOrbit(ctx!, cx, cx, orbit, colors)
      }

      // 5 — Ponteiros
      for (const needle of S.needles) {
        needle.angle += needle.speed
        drawNeedle(ctx!, cx, cx, needle, colors)
      }

      // 6 — Centro
      ctx!.save()
      ctx!.beginPath()
      ctx!.arc(cx, cx, 7, 0, Math.PI * 2)
      ctx!.fillStyle = colors.center
      ctx!.globalAlpha = 0.9
      ctx!.fill()
      ctx!.beginPath()
      ctx!.arc(cx - 1.5, cx - 1.5, 3, 0, Math.PI * 2)
      ctx!.fillStyle = 'rgba(255,255,255,0.7)'
      ctx!.globalAlpha = 1
      ctx!.fill()
      ctx!.restore()

      // Progresso
      S.frame++
      if (S.progress < 100) {
        S.progress = Math.min(100, S.progress + increment)
        // Atualiza React state a cada 3 frames (≈20fps) — suficiente para a barra
        if (S.frame % 3 === 0) setDisplayProgress(Math.floor(S.progress))
        if (S.frame % 22 === 0) setDots(d => d.length >= 3 ? '' : d + '.')
        if (S.progress >= 100 && !done) setDone(true)
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [size, duration, done, initState])

  // Chama onComplete uma vez que done vira true
  useEffect(() => {
    if (done) onComplete?.()
  }, [done, onComplete])

  return (
    <div
      className={className}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ imageRendering: 'crisp-edges' }}
        aria-hidden="true"
      />

      {label && (
        <p
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      Math.max(10, Math.round(size * 0.034)) + 'px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color:         'var(--faint)',
            marginTop:     '1rem',
            marginBottom:  showProgress ? '0.5rem' : 0,
          }}
        >
          {label}{dots}
        </p>
      )}

      {showProgress && (
        <div
          style={{
            width:        Math.round(size * 0.47) + 'px',
            height:       '2px',
            background:   'var(--line-soft)',
            borderRadius: '2px',
            overflow:     'hidden',
          }}
          role="progressbar"
          aria-valuenow={displayProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{
              height:       '100%',
              width:        `${displayProgress}%`,
              background:   'var(--accent)',
              borderRadius: '2px',
              transition:   'width 0.1s linear',
              boxShadow:    '0 0 6px var(--accent-soft)',
            }}
          />
        </div>
      )}
    </div>
  )
}

/* -----------------------------------------------------------------------
   SplashGate — wrapper de primeira visita (usa sessionStorage)
----------------------------------------------------------------------- */

interface SplashGateProps {
  children: React.ReactNode
  /** Tamanho do loader. Default: 280 */
  loaderSize?: number
  /** Label do loader. Default: "Carregando" */
  loaderLabel?: string
}

const noopSubscribe = () => () => {}

export function SplashGate({ children, loaderSize = 280, loaderLabel = 'Carregando' }: SplashGateProps) {

  const seen = useSyncExternalStore(
    noopSubscribe,
    () => sessionStorage.getItem('splash-seen') !== null,
    () => null,
  )
  const [done, setDone] = useState(false)

  if (seen === null) return null   // evita o flash, igual antes
  if (seen || done) return <>{children}</>
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'var(--bg)' }}>
      <AstrolabeLoader
        size={loaderSize}
        label={loaderLabel}
        duration={2800}
        onComplete={() => {
          sessionStorage.setItem('splash-seen', '1')
          setDone(true)
        }}
      />
    </div>
  )

  return <>{children}</>
}
