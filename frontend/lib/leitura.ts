/* ---------------------------------------------------------------
   Leitura de partitura — gerador e regras compartilhados pelos modos
   que leem notas na pauta (II Onde tocar; III Nomear e IV Corrida
   quando forem implementados).

   Uma nota é guardada pelo seu passo na pauta `s`
   (0 = Mi⁴, 1ª linha; 2 = Sol⁴, 2ª linha…; negativos abaixo da pauta).
--------------------------------------------------------------- */
import { NAT, STRINGS, keyAcc, type Alt } from "./armaduras"

export const NOTES_PER_MEASURE = 4
/** Cada linha (sistema) da partitura tem 2 compassos */
export const NOTES_PER_LINE = 8
/** Tamanhos da partitura: pequena (1 linha), média (2), grande (4) */
export const LENGTHS = [8, 16, 32] as const
export type ScoreLength = (typeof LENGTHS)[number]
/** Casas do braço: corda solta + 8 semitons (1ª posição, até o 4º dedo alto) */
export const FINGER_COLS = 9

/** MIDI de cada corda solta: Sol³ 55, Ré⁴ 62, Lá⁴ 69, Mi⁵ 76 */
export const OPEN_MIDI = STRINGS.map((s) => (s.oct + 1) * 12 + NAT[s.l])

export type Why = "" | "written" | "inherit" | "reset"

export interface ReadNote {
  s: number          // passo na pauta
  l: number          // letra 0..6 (Dó..Si)
  keyA: Alt          // alteração dada pela armadura
  alt: Alt           // alteração que soa de fato
  midi: number
  written: Alt | null // acidente desenhado ao lado da nota
  why: Why           // de onde veio a alteração (para o feedback)
  prevA?: Alt        // acidente que valia no compasso anterior (why = "reset")
}

export interface Score { key: number; notes: ReadNote[] }

export interface Config {
  acc: 0 | 1 | 2               // só escala · com ♯♭♮ · + regra do compasso
  keys: 0 | 2 | 4              // nº máximo de acidentes na armadura
  range: 0 | 1                 // dentro da pauta · 1ª posição toda
  strings: [boolean, boolean, boolean, boolean]
  leaps: 0 | 1 | 2             // vizinhos · médios · grandes
  time: 0 | 3 | 6              // segundos por nota (0 = livre)
  digits: "names" | "digits" | "none" // ajuda no braço
  length: ScoreLength          // nº de notas da partitura
}

/* O tamanho da partitura não faz parte dos perfis: trocar de perfil mantém o tamanho escolhido */
export const PRESETS = {
  ini: { acc: 0, keys: 2, range: 0, strings: [true, true, true, true], leaps: 0, time: 0, digits: "names", length: 8 },
  mid: { acc: 1, keys: 2, range: 1, strings: [true, true, true, true], leaps: 1, time: 0, digits: "digits", length: 8 },
  adv: { acc: 2, keys: 4, range: 1, strings: [true, true, true, true], leaps: 2, time: 6, digits: "none", length: 8 },
} satisfies Record<string, Config>

export type PresetId = keyof typeof PRESETS | "custom"

export const cloneConfig = (c: Config): Config => ({ ...c, strings: [...c.strings] as Config["strings"] })

export function presetOf(c: Config): PresetId {
  // o tamanho fica de fora: qualquer perfil vale para qualquer tamanho
  const same = (p: Config) =>
    p.acc === c.acc && p.keys === c.keys && p.range === c.range && p.leaps === c.leaps &&
    p.time === c.time && p.digits === c.digits && p.strings.join() === c.strings.join()
  return (Object.keys(PRESETS) as (keyof typeof PRESETS)[]).find((k) => same(PRESETS[k])) ?? "custom"
}

const STEP_POOLS = [
  [-2, -1, -1, -1, 1, 1, 1, 2],
  [-4, -3, -2, -2, -1, -1, -1, 1, 1, 1, 2, 2, 3, 4],
  [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6],
]

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)]

export const letterOf = (s: number) => (((s + 2) % 7) + 7) % 7

export function midiOfStep(s: number, alt: number) {
  const d = s + 30 // 30 passos diatônicos de Dó⁰ até Mi⁴
  const oct = Math.floor(d / 7)
  return 12 * (oct + 1) + NAT[d - oct * 7] + alt
}

export interface Place { si: number; ci: number }

/** Onde a altura `m` pode ser tocada (1ª posição, só nas cordas ligadas) */
export function places(m: number, on: readonly boolean[]): Place[] {
  const out: Place[] = []
  OPEN_MIDI.forEach((open, si) => {
    const ci = m - open
    if (on[si] && ci >= 0 && ci < FINGER_COLS) out.push({ si, ci })
  })
  return out
}

/** Lugar preferido: a corda mais aguda (dedo mais baixo) */
export function bestPlace(m: number, on: readonly boolean[]) {
  const p = places(m, on)
  return p.length ? p[p.length - 1] : null
}

export { inScale } from "./armaduras"

/** Passos da pauta que soam tocáveis nas cordas ligadas, já com a alteração da armadura */
function playableSteps(cfg: Config, key: number) {
  const acc = keyAcc(key)
  const lo = cfg.range ? -5 : -1
  const hi = cfg.range ? 11 : 9
  const ok: number[] = []
  for (let s = lo; s <= hi; s++) {
    if (places(midiOfStep(s, acc[letterOf(s)]), cfg.strings).length) ok.push(s)
  }
  return ok
}

/** Passeio melódico: cada nota sai da anterior; nunca 3 iguais seguidas. null se não há notas tocáveis */
function walk(cfg: Config, key: number) {
  const ok = playableSteps(cfg, key)
  if (!ok.length) return null
  const allowed = new Set(ok)
  const lo = ok[0]
  const hi = ok[ok.length - 1]
  // passo fora da lista (buraco raro na extensão): vai para o tocável mais próximo
  const nearest = (x: number) => ok.reduce((b, v) => (Math.abs(v - x) < Math.abs(b - x) ? v : b), ok[0])
  const pool = STEP_POOLS[cfg.leaps]
  let s = pick(ok)
  const out: number[] = []
  for (let i = 0; i < cfg.length; i++) {
    out.push(s)
    const st = pick(pool)
    let ns = s + st
    if (ns < lo || ns > hi) ns = s - st
    ns = Math.min(hi, Math.max(lo, ns))
    if (out.length >= 2 && ns === out[out.length - 1] && ns === out[out.length - 2]) ns = ns > lo ? ns - 1 : ns + 1
    s = allowed.has(ns) ? ns : nearest(ns)
  }
  return out
}

/** Acidentes que fazem sentido escrever numa nota (e que ainda dá para tocar) */
function alterOptions(s: number, n: number, on: readonly boolean[]): Alt[] {
  const l = letterOf(s)
  const opts: Alt[] = []
  if (keyAcc(n)[l] !== 0) opts.push(0) // bequadro cancela a armadura
  else {
    if ([0, 1, 3, 4, 5].includes(l)) opts.push(1)
    if ([6, 2, 5, 1, 4].includes(l)) opts.push(-1)
  }
  return opts.filter((a) => places(midiOfStep(s, a), on).length > 0)
}

const measureOf = (i: number) => Math.floor(i / NOTES_PER_MEASURE)

/** Acidentes escritos de uma linha (2 compassos a partir de `start`); false se não coube */
function writeAccidentals(cfg: Config, key: number, steps: number[], written: (Alt | null)[], start: number) {
  const end = start + NOTES_PER_LINE
  if (cfg.acc === 1) {
    // 1 ou 2 notas com acidente escrito; repetições no mesmo compasso são desviadas
    const count = rnd(1, 2)
    let used = 0
    for (let t = 0; t < 20 && used < count; t++) {
      const i = start + rnd(1, NOTES_PER_LINE - 1)
      if (written[i] !== null) continue
      const o = alterOptions(steps[i], key, cfg.strings)
      if (!o.length) continue
      written[i] = pick(o)
      used++
      for (let j = i + 1; j < end && measureOf(j) === measureOf(i); j++) {
        if (steps[j] === steps[i]) steps[j] = steps[i] < 11 ? steps[i] + 1 : steps[i] - 1
      }
    }
    return used > 0
  }
  if (cfg.acc === 2) {
    // um acidente no 1º compasso, repetido sem sinal (ainda vale) e no 2º (barra cancela)
    const i = start + rnd(0, 2)
    const o = alterOptions(steps[i], key, cfg.strings)
    if (!o.length) return false
    written[i] = pick(o)
    steps[start + rnd(i - start + 1, NOTES_PER_MEASURE - 1)] = steps[i]
    steps[start + rnd(NOTES_PER_MEASURE, NOTES_PER_LINE - 2)] = steps[i]
  }
  return true
}

export function generate(cfg: Config, depth = 0): Score {
  const keys: number[] = []
  for (let n = -cfg.keys; n <= cfg.keys; n++) keys.push(n)

  // partituras maiores têm mais notas que podem falhar: mais tentativas
  const maxTries = 120 * (cfg.length / NOTES_PER_LINE)
  for (let tries = 0; tries < maxTries; tries++) {
    const key = pick(keys)
    const acc = keyAcc(key)
    const steps = walk(cfg, key)
    if (!steps) continue
    const written: (Alt | null)[] = Array(cfg.length).fill(null)
    let ok = true
    for (let start = 0; start < cfg.length && ok; start += NOTES_PER_LINE) {
      ok = writeAccidentals(cfg, key, steps, written, start)
    }
    if (!ok) continue

    const notes: ReadNote[] = []
    let override: Record<number, Alt> = {}
    let prevOverride: Record<number, Alt> = {}
    for (let k = 0; k < cfg.length && ok; k++) {
      // barra de compasso: os acidentes do compasso anterior deixam de valer
      if (k > 0 && k % NOTES_PER_MEASURE === 0) { prevOverride = override; override = {} }
      const s = steps[k]
      const l = letterOf(s)
      const keyA = acc[l]
      let alt: Alt = keyA
      let why: Why = ""
      const w = written[k]
      if (w !== null) { override[s] = w; alt = w; why = "written" }
      else if (override[s] !== undefined) { alt = override[s]; why = "inherit" }
      else if (prevOverride[s] !== undefined && prevOverride[s] !== keyA) why = "reset"
      const midi = midiOfStep(s, alt)
      if (!places(midi, cfg.strings).length) { ok = false; break }
      notes.push({ s, l, keyA, alt, midi, written: w, why, prevA: prevOverride[s] })
    }
    if (ok) return { key, notes }
  }

  // configuração apertada demais (ex.: só a corda Sol dentro da pauta):
  // primeiro amplia a extensão mantendo as cordas; depois relaxa o resto
  if (depth === 0 && cfg.range === 0) return generate({ ...cfg, range: 1 }, 1)
  if (depth <= 1) return generate({ ...cfg, acc: 0, strings: [true, true, true, true] }, 2)
  throw new Error("leitura: não foi possível gerar uma partitura")
}
