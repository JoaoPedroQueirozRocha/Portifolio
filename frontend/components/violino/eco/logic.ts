/* ---------------------------------------------------------------
   Eco — regras e estado do modo (puro, sem React nem áudio).
   A pessoa ouve uma nota e a procura no braço (1ª posição) partindo
   de onde a mão está. Só a altura conta. Textos não ficam aqui: o
   componente monta as mensagens a partir do estado e do dicionário.
--------------------------------------------------------------- */
import { STRINGS, fingerFor, inScale, pitchClass, spellPitch, tonic } from "@/lib/armaduras"
import { OPEN_MIDI, places } from "@/lib/leitura"

export const mod = (a: number, n: number) => ((a % n) + n) % n
const rnd = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]

/* ---------------------------------------------------------------
   Ajustes e níveis
--------------------------------------------------------------- */
/** Tonalidades maiores do exercício, em nº de acidentes (+ sustenidos, − bemóis) */
export const KEYS = [0, 1, 2, 3, -1, -2, -3] as const

export type Dist = "g2" | "g5" | "any"
export type Ctx = "tonica" | "trecho" | "nenhum"

export interface Config {
  dist: Dist                 // distância da nota atual: até 2 graus · até uma 5ª · qualquer
  notes: "escala" | "crom"   // só da escala · com cromáticas
  key: "rand" | number       // tonalidade sorteada ou fixa
  ctx: Ctx                   // o que toca antes: tônica · trecho da escala · nada
  hint: 0 | 1                // dica de direção depois de um erro
  tries: 0 | 3               // tentativas por nota (0 = ilimitadas)
  staff: 0 | 1               // mostrar a pauta
}

export const PRESETS = {
  ini: { dist: "g2", notes: "escala", key: "rand", ctx: "trecho", hint: 1, tries: 3, staff: 0 },
  med: { dist: "g5", notes: "escala", key: "rand", ctx: "trecho", hint: 1, tries: 3, staff: 0 },
  adv: { dist: "any", notes: "crom", key: "rand", ctx: "trecho", hint: 1, tries: 3, staff: 0 },
} satisfies Record<string, Config>

export type PresetId = keyof typeof PRESETS | "custom"

const sameConfig = (a: Config, b: Config) => (Object.keys(a) as (keyof Config)[]).every((k) => a[k] === b[k])

export function presetOf(c: Config): PresetId {
  return (Object.keys(PRESETS) as (keyof typeof PRESETS)[]).find((k) => sameConfig(PRESETS[k], c)) ?? "custom"
}

export function parseConfig(raw: unknown): Config | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const c = raw as Record<string, unknown>
  const ok =
    ["g2", "g5", "any"].includes(c.dist as string) &&
    ["escala", "crom"].includes(c.notes as string) &&
    (c.key === "rand" || (KEYS as readonly unknown[]).includes(c.key)) &&
    ["tonica", "trecho", "nenhum"].includes(c.ctx as string) &&
    (c.hint === 0 || c.hint === 1) && (c.tries === 0 || c.tries === 3) && (c.staff === 0 || c.staff === 1)
  return ok ? (c as unknown as Config) : undefined
}

/* ---------------------------------------------------------------
   Música: tonalidade, graus, grafia e lugar no braço
--------------------------------------------------------------- */
/** Alcance da 1ª posição: Sol³ (55) até Mi⁶ (84) */
export const LO = 55
export const HI = 84
const SCALE = [0, 2, 4, 5, 7, 9, 11]

export const tonicPc = (n: number) => {
  const t = tonic(n)
  return pitchClass(t.l, t.alt)
}
/** A tônica da rodada: a do Dó⁴ (60) para cima */
export const tonicMidi = (n: number) => 60 + tonicPc(n)

export type Degree = { kind: "in"; n: number } | { kind: "out"; lo: number; hi: number }

/** Grau da escala maior da tonalidade; fora dela, entre quais graus a nota cai */
export function degreeOf(m: number, n: number): Degree {
  const r = mod(m - tonicPc(n), 12)
  const i = SCALE.indexOf(r)
  if (i >= 0) return { kind: "in", n: i + 1 }
  let lo = 0
  for (let j = 0; j < 7; j++) if (SCALE[j] < r) lo = j
  return { kind: "out", lo: lo + 1, hi: lo + 2 > 7 ? 1 : lo + 2 }
}

export interface Place { si: number; ci: number }

const ALL_STRINGS = [true, true, true, true]
/** Lugar preferido de uma nota: a casa mais baixa (a corda solta, quando dá) */
export function prefPlace(m: number): Place {
  const p = places(m, ALL_STRINGS).sort((a, b) => a.ci - b.ci)
  return p[0] ?? { si: 0, ci: 0 }
}

export const midiAt = (p: Place) => OPEN_MIDI[p.si] + p.ci

/** Dedo no braço (0 = corda solta); a letra da grafia na tonalidade decide o dedo */
export function fingerAt(p: Place, n: number) {
  return p.ci === 0 ? 0 : fingerFor(STRINGS[p.si], 1, midiAt(p), n)
}

export { inScale, spellPitch }

/* ---------------------------------------------------------------
   Rodada: 8 notas encadeadas a partir da tônica
--------------------------------------------------------------- */
export interface Item { from: number; to: number }
export interface Round { key: number; items: Item[]; chain: boolean }

export const ROUND_LENGTH = 8

const scaleNotes = (key: number) => {
  const out: number[] = []
  for (let m = LO; m <= HI; m++) if (inScale(m, key)) out.push(m)
  return out
}

/** Próxima nota-alvo a partir de `cur`, respeitando distância e cromáticas */
export function nextNote(cur: number, cfg: Config, key: number): number {
  const S = scaleNotes(key)
  if (cfg.dist === "any") {
    const c: number[] = []
    for (let m = Math.max(LO, cur - 12); m <= Math.min(HI, cur + 12); m++) {
      if (m === cur) continue
      if (cfg.notes === "escala" && !inScale(m, key)) continue
      c.push(m)
    }
    const inKey = c.filter((x) => inScale(x, key))
    const crom = c.filter((x) => !inScale(x, key))
    return cfg.notes === "crom" && crom.length && Math.random() < 0.3 ? rnd(crom) : rnd(inKey.length ? inKey : c)
  }
  let idx = S.indexOf(cur)
  if (idx < 0) {
    idx = 0
    for (let i = 0; i < S.length; i++) if (S[i] < cur) idx = i
  }
  const max = cfg.dist === "g2" ? 2 : 4
  const steps: number[] = []
  for (let s = -max; s <= max; s++) if (s && S[idx + s] !== undefined && S[idx + s] !== cur) steps.push(s)
  let t = S[idx + rnd(steps)]
  if (cfg.notes === "crom" && Math.random() < 0.3) {
    const sh = t + rnd([-1, 1])
    if (sh >= LO && sh <= HI && sh !== cur && !inScale(sh, key)) t = sh
  }
  return t
}

export function pickKey(cfg: Config): number {
  if (cfg.key !== "rand") return cfg.key
  // no nível mais simples, até 2 acidentes
  return rnd(cfg.dist === "g2" ? KEYS.filter((k) => Math.abs(k) <= 2) : KEYS)
}

export function makeRound(cfg: Config): Round {
  const key = pickKey(cfg)
  const items: Item[] = []
  let cur = tonicMidi(key)
  for (let i = 0; i < ROUND_LENGTH; i++) {
    const to = nextNote(cur, cfg, key)
    items.push({ from: cur, to })
    cur = to
  }
  return { key, items, chain: true }
}

/** O contexto que toca antes: a tônica, ou 1-2-3-4-5-3-1 da escala */
export function contextNotes(cfg: Config, key: number): number[] {
  const t = tonicMidi(key)
  if (cfg.ctx === "tonica") return [t, t]
  if (cfg.ctx === "trecho") return [0, 2, 4, 5, 7, 4, 0].map((d) => t + d)
  return []
}

/* ---------------------------------------------------------------
   Estado
--------------------------------------------------------------- */
export type Phase = "ready" | "search" | "hit" | "reveal" | "summary"

export interface Try { si: number; ci: number; m: number }
export interface Result { n: number; ok: boolean }
export interface Tally { ok: number; streak: number; sum: number; done: number }

export const EMPTY_TALLY: Tally = { ok: 0, streak: 0, sum: 0, done: 0 }

export interface State {
  cfg: Config
  round: Round
  idx: number
  phase: Phase
  here: Place              // onde a mão está
  nextHere: Place | null   // onde a mão fica na próxima nota
  tries: Try[]
  hit: Place | null
  results: Result[]
  tally: Tally
}

export interface Saved { cfg: Config; tally: Tally }

const isCount = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0

export function parseSaved(raw: unknown): Saved | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const x = raw as Record<string, unknown>
  const cfg = parseConfig(x.cfg)
  const t = x.tally as Record<string, unknown> | undefined
  if (!cfg || !t || ![t.ok, t.streak, t.sum, t.done].every(isCount)) return undefined
  return { cfg, tally: { ok: t.ok as number, streak: t.streak as number, sum: t.sum as number, done: t.done as number } }
}

const begin = (cfg: Config, round: Round, tally: Tally): State => ({
  cfg, round, idx: 0, phase: "ready", here: prefPlace(round.items[0].from), nextHere: null,
  tries: [], hit: null, results: [], tally,
})

export function initialState(saved: Saved | undefined, round: (cfg: Config) => Round): State {
  const cfg = saved?.cfg ?? { ...PRESETS.med }
  return begin(cfg, round(cfg), saved?.tally ?? EMPTY_TALLY)
}

export const currentItem = (st: State) => st.round.items[Math.min(st.idx, st.round.items.length - 1)]

export type Action =
  | { type: "begin" }                           // do contexto para a procura
  | { type: "tap"; si: number; ci: number }
  | { type: "next" }
  | { type: "round"; round: Round }             // nova rodada, mesmo placar
  | { type: "config"; cfg: Config; round: Round } // novos ajustes: placar zerado

/** O que um toque no braço vai causar (para o componente agendar o som) */
export function tapOutcome(st: State, si: number, ci: number): "ignore" | "wrong" | "hit" | "reveal" {
  if (st.phase !== "search") return "ignore"
  if (OPEN_MIDI[si] + ci === currentItem(st).to) return "hit"
  return st.cfg.tries && st.tries.length + 1 >= st.cfg.tries ? "reveal" : "wrong"
}

export function reducer(st: State, a: Action): State {
  switch (a.type) {
    case "begin":
      return st.phase === "ready" ? { ...st, phase: "search" } : st
    case "tap": {
      const outcome = tapOutcome(st, a.si, a.ci)
      if (outcome === "ignore") return st
      const it = currentItem(st)
      const t = st.tally
      if (outcome === "hit") {
        const n = st.tries.length + 1
        return {
          ...st, phase: "hit", hit: { si: a.si, ci: a.ci }, nextHere: { si: a.si, ci: a.ci },
          results: [...st.results, { n, ok: true }],
          tally: { ok: t.ok + 1, streak: n === 1 ? t.streak + 1 : 0, sum: t.sum + n, done: t.done + 1 },
        }
      }
      const tries = [...st.tries, { si: a.si, ci: a.ci, m: OPEN_MIDI[a.si] + a.ci }]
      if (outcome === "wrong") return { ...st, tries }
      return {
        ...st, tries, phase: "reveal", nextHere: prefPlace(it.to),
        results: [...st.results, { n: tries.length, ok: false }],
        tally: { ...t, streak: 0, sum: t.sum + tries.length, done: t.done + 1 },
      }
    }
    case "next": {
      if (st.phase !== "hit" && st.phase !== "reveal") return st
      const len = st.round.items.length
      if (st.idx + 1 >= len) return { ...st, phase: "summary", idx: len }
      const ni = st.round.items[st.idx + 1]
      return {
        ...st, idx: st.idx + 1, phase: "search", tries: [], hit: null,
        here: st.round.chain && st.nextHere ? st.nextHere : prefPlace(ni.from), nextHere: null,
      }
    }
    case "round":
      return begin(st.cfg, a.round, st.tally)
    case "config":
      return begin(a.cfg, a.round, EMPTY_TALLY)
  }
}

/* ---------------------------------------------------------------
   Resumo da rodada
--------------------------------------------------------------- */
export interface Rollup {
  firsts: number
  revealed: number
  sum: number
  hard: number[]                                   // índices das notas que deram trabalho
  jumps: { interval: number; avg: number }[]       // saltos mais difíceis (até 3)
}

export function rollup(results: Result[], items: Item[]): Rollup {
  const hard: number[] = []
  results.forEach((r, i) => { if (!r.ok || r.n > 1) hard.push(i) })
  const by: Record<number, { n: number; sum: number }> = {}
  results.forEach((r, i) => {
    const iv = Math.min(12, Math.abs(items[i].to - items[i].from))
    const j = (by[iv] ??= { n: 0, sum: 0 })
    j.n++
    j.sum += r.ok ? r.n : r.n + 1 // revelada pesa como uma tentativa a mais
  })
  const jumps = Object.entries(by)
    .map(([iv, j]) => ({ interval: Number(iv), avg: j.sum / j.n }))
    .filter((j) => j.avg > 1)
    .sort((x, y) => y.avg - x.avg)
    .slice(0, 3)
  return {
    firsts: results.filter((r) => r.ok && r.n === 1).length,
    revealed: results.filter((r) => !r.ok).length,
    sum: results.reduce((s, r) => s + r.n, 0),
    hard, jumps,
  }
}

/** Rodada só com as notas que deram trabalho, cada uma partindo do seu próprio ponto */
export const trainingRound = (st: State, hard: number[]): Round => ({
  key: st.round.key, chain: false, items: hard.map((i) => ({ ...st.round.items[i] })),
})

/** Média com uma casa decimal (null sem dados) */
export const average = (sum: number, n: number) => (n ? Math.round((sum / n) * 10) / 10 : null)
