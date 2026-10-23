/* ---------------------------------------------------------------
   Roda cromática — regras e estado do modo (puro, sem React).
   Um "som" é uma classe de altura `pc` (0 = Dó … 11 = Si); cada som
   tem de 1 a 2 nomes com no máximo um acidente (`spellings`), p. ex.
   Dó♯ = Ré♭ e Mi♯ = Fá. Os textos não ficam aqui: as mensagens guardam
   chaves do dicionário do modo e os nomes (Name), traduzidos na tela.
--------------------------------------------------------------- */
import { NAT, pitchClass, spellings, type Alt } from "@/lib/armaduras"

export type RodaMode = "ordem" | "eq" | "explorar"
export type Dir = 1 | -1
export type StartMode = "do" | "rand"

export interface Name { l: number; alt: Alt }
export interface Eq { pc: number; shown: Name }
export interface Tally { ok: number; bad: number; streak: number }

export const TOTAL = 12
export const MODES: readonly RodaMode[] = ["ordem", "eq", "explorar"]

export const mod = (a: number, n: number) => ((a % n) + n) % n

/** Os 12 sons com os seus nomes: [natural | ♯, ♭ | caso especial] */
export const PCS: readonly (readonly Name[])[] = Array.from({ length: TOTAL }, (_, pc) => spellings(pc))

export const isBlack = (pc: number) => !NAT.includes(pc)
export const pcOf = (n: Name) => pitchClass(n.l, n.alt)
export const sameName = (a: Name, b: Name) => a.l === b.l && a.alt === b.alt
export const nameKey = (n: Name) => `${n.l}:${n.alt}`
/** Si♯, Fá♭, Mi♯ e Dó♭: nome com acidente de uma nota natural */
export const isSpecial = (n: Name) => n.alt !== 0 && !isBlack(pcOf(n))

/** Nome de costume: sobe com ♯, desce com ♭ (as naturais têm sempre o seu) */
export const primary = (pc: number, dir: Dir) => (isBlack(pc) ? PCS[pc][dir > 0 ? 0 : 1] : PCS[pc][0])
export const others = (pc: number, n: Name) => PCS[pc].filter((x) => !sameName(x, n))

/** Violino: Sol³ = 55; a roda toca sempre a oitava de Dó⁴ (60–71) */
export const midiOfPc = (pc: number) => 60 + pc

export const BANK_ROWS = ["natural", "sharp", "flat"] as const
export type BankRow = (typeof BANK_ROWS)[number]
const ROW_ALT: Record<BankRow, Alt> = { natural: 0, sharp: 1, flat: -1 }

export interface BankRowView { row: BankRow; tiles: Name[] }

/** O banco de nomes em ordem: uma linha por tipo de acidente, de Dó a Si */
export const BANK: BankRowView[] = BANK_ROWS.map((row) => ({
  row,
  tiles: Array.from({ length: 7 }, (_, l) => ({ l, alt: ROW_ALT[row] })),
}))

/* ---------------------------------------------------------------
   Geometria da roda (caixa de 560 × 560)
--------------------------------------------------------------- */
export const BOX = 560
export const CENTER = 280
export const RADIUS = 212
/** Posições (em casas) dos selos ½: entre Mi–Fá e entre Si–Dó */
export const HALF_TAGS = [4.5, 11.5] as const

export function polar(i: number, r: number) {
  const a = (i * Math.PI) / 6
  return { x: CENTER + r * Math.sin(a), y: CENTER - r * Math.cos(a) }
}

/* ---------------------------------------------------------------
   Estado
--------------------------------------------------------------- */
export type Var = Name | { semis: number } | string | number

/** Mensagem do painel: chaves do dicionário (`heads` / `msg`) + valores */
export interface Msg {
  tone: "ok" | "bad" | "info"
  head: string
  text: string
  vars: Record<string, Var>
}

export interface State {
  mode: RodaMode
  dir: Dir
  startMode: StartMode
  start: number                    // som onde a volta começa
  k: number                        // modo Ordem: casas já preenchidas
  filled: Partial<Record<number, Name>>
  eqQ: Eq[]                        // modo Equivalentes: uma pergunta por casa
  bank: BankRowView[]              // banco embaralhado da rodada (Ordem e Equivalentes)
  eqI: number
  eqDone: Partial<Record<number, true>>
  sel: number | null               // modo Explorar: som selecionado
  wrong: Name | null
  last: Name | null
  msg: Msg | null
  tally: Tally
}

/** Parte sorteada de uma rodada — chega pronta nas ações, para o reducer ser puro */
export interface Fresh { start: number; eqQ: Eq[]; bank: BankRowView[] }

const shuffle = <T,>(a: readonly T[]) => {
  const out = a.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function makeFresh(startMode: StartMode): Fresh {
  const start = startMode === "rand" ? NAT[Math.floor(Math.random() * NAT.length)] : 0
  const eqQ = shuffle(Array.from({ length: TOTAL }, (_, pc) => pc)).map((pc) => {
    const names = PCS[pc]
    return { pc, shown: names.length > 1 && Math.random() < 0.5 ? names[1] : names[0] }
  })
  // nas linhas do banco os nomes saem da ordem, senão bastaria seguir Dó, Ré, Mi…
  const bank = BANK.map(({ row, tiles }) => ({ row, tiles: shuffle(tiles) }))
  return { start, eqQ, bank }
}

export const EMPTY_TALLY: Tally = { ok: 0, bad: 0, streak: 0 }

export interface Saved { mode: RodaMode; dir: Dir; startMode: StartMode; tally: Tally }

const isCount = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0

/** Valida o que veio do localStorage; undefined se não serve */
export function parseSaved(raw: unknown): Saved | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const x = raw as Record<string, unknown>
  const t = x.tally as Record<string, unknown> | undefined
  if (!MODES.includes(x.mode as RodaMode) || (x.dir !== 1 && x.dir !== -1)) return undefined
  if (x.startMode !== "do" && x.startMode !== "rand") return undefined
  if (!t || !isCount(t.ok) || !isCount(t.bad) || !isCount(t.streak)) return undefined
  return { mode: x.mode as RodaMode, dir: x.dir, startMode: x.startMode, tally: { ok: t.ok, bad: t.bad, streak: t.streak } }
}

export function initialState(saved: Saved | undefined, fresh: Fresh): State {
  return {
    mode: saved?.mode ?? "ordem",
    dir: saved?.dir ?? 1,
    startMode: saved?.startMode ?? "do",
    start: fresh.start, k: 0, filled: {},
    eqQ: fresh.eqQ, bank: fresh.bank, eqI: 0, eqDone: {},
    sel: null, wrong: null, last: null, msg: null,
    tally: saved?.tally ?? EMPTY_TALLY,
  }
}

/** Começa uma rodada nova; `extra` troca ajustes junto */
function restartRound(st: State, fresh: Fresh, extra: Partial<State> = {}): State {
  return {
    ...st, start: fresh.start, k: 0, filled: {}, eqQ: fresh.eqQ, bank: fresh.bank, eqI: 0, eqDone: {},
    sel: null, wrong: null, last: null, msg: null, ...extra,
  }
}

/* ---------------------------------------------------------------
   Consultas sobre o estado
--------------------------------------------------------------- */
/** Modo Ordem: som que vem agora (null fora do modo ou com a volta completa) */
export function nextPc(st: State) {
  return st.mode === "ordem" && st.k < TOTAL ? mod(st.start + st.dir * st.k, TOTAL) : null
}

/** O banco a mostrar: embaralhado nos modos de treino, em ordem no Explorar */
export const bankFor = (st: State) => (st.mode === "explorar" ? BANK : st.bank)

export const currentEq = (st: State) => (st.mode === "eq" ? st.eqQ[st.eqI] ?? null : null)

export function isFinished(st: State) {
  return (st.mode === "ordem" && st.k >= TOTAL) || (st.mode === "eq" && st.eqI >= TOTAL)
}

export function progress(st: State) {
  if (st.mode === "ordem") return { done: st.k, total: TOTAL }
  if (st.mode === "eq") return { done: st.eqI, total: TOTAL }
  return { done: TOTAL, total: TOTAL }
}

const msg = (tone: Msg["tone"], head: string, text: string, vars: Msg["vars"] = {}): Msg => ({ tone, head, text, vars })

/** Mensagem a mostrar: a da última jogada ou a dica do momento */
export function currentMsg(st: State): Msg {
  if (st.mode === "explorar") {
    if (st.sel === null) return msg("info", "explore", "explore_idle")
    const s = st.sel
    const text = PCS[s].length === 1 ? "explore_one" : isBlack(s) ? "explore_black" : "explore_special"
    return msg("info", "explore_near", text, {
      below: primary(mod(s - 1, TOTAL), st.dir),
      above: primary(mod(s + 1, TOTAL), st.dir),
      a: PCS[s][0],
      b: PCS[s][1] ?? PCS[s][0],
      lo: PCS[mod(s - 1, TOTAL)][0],
      hi: PCS[mod(s + 1, TOTAL)][0],
    })
  }
  if (st.msg) return st.msg
  if (st.mode === "ordem") return msg("info", "start", "ordem_start", { start: PCS[st.start][0] })
  return msg("info", "tip", "eq_tip")
}

/* ---------------------------------------------------------------
   Jogadas
--------------------------------------------------------------- */
/** O nome escolhido é o som certo para a próxima casa (Ordem) ou para a pergunta (Equivalentes)? */
export function judge(st: State, name: Name): { ok: boolean; pc: number } | null {
  const pc = pcOf(name)
  if (st.mode === "ordem") {
    const next = nextPc(st)
    return next === null ? null : { ok: pc === next, pc }
  }
  if (st.mode === "eq") {
    const cur = currentEq(st)
    if (!cur) return null
    return { ok: !sameName(name, cur.shown) && PCS[cur.pc].some((n) => sameName(n, name)), pc }
  }
  return null
}

const miss = (st: State, name: Name, m: Msg, wrong: Name | null = name): State => ({
  ...st, wrong, last: null, msg: m, tally: { ...st.tally, bad: st.tally.bad + 1, streak: 0 },
})

const hit = (st: State, m: Msg, patch: Partial<State>): State => ({
  ...st, ...patch, wrong: null, msg: m,
  tally: { ok: st.tally.ok + 1, bad: st.tally.bad, streak: st.tally.streak + 1 },
})

function pickOrdem(st: State, name: Name): State {
  const next = nextPc(st)
  if (next === null) return st
  const pc = pcOf(name)
  const { dir } = st
  if (pc === next) {
    const k = st.k + 1
    const pref = primary(pc, dir)
    const other = others(pc, name)[0]
    let text: string
    let vars: Msg["vars"] = { label: name }
    if (k === TOTAL) { text = dir > 0 ? "ordem_done_up" : "ordem_done_down"; vars = { start: PCS[st.start][0] } }
    else if (isSpecial(name)) { text = "ordem_special"; vars = { label: name, base: PCS[pc][0] } }
    else if (isBlack(pc) && !sameName(name, pref)) { text = dir > 0 ? "ordem_alias_up" : "ordem_alias_down"; vars = { label: name, other, pref } }
    else if (isBlack(pc)) { text = "ordem_black"; vars = { label: name, other } }
    else if (other) { text = "ordem_natural_alias"; vars = { label: name, other } }
    else text = "ordem_natural"
    return hit(st, msg("ok", k === TOTAL ? "ordem_done" : "ok", text, vars), {
      filled: { ...st.filled, [next]: name }, k, last: name,
    })
  }
  const prev = mod(next - dir, TOTAL)
  const prevName = st.filled[prev]
  if (st.k === 0) return miss(st, name, msg("bad", "bad", "ordem_bad_first", { label: name, start: PCS[st.start][0] }))
  if (pc === prev && prevName) return miss(st, name, msg("bad", "bad", "ordem_bad_same", { label: name, prev: prevName }))
  const semis = mod((pc - prev) * dir, TOTAL)
  return miss(st, name, msg("bad", "bad", dir > 0 ? "ordem_bad_up" : "ordem_bad_down", { label: name, prev: prevName ?? name, d: { semis } }))
}

function pickEq(st: State, name: Name): State {
  const cur = currentEq(st)
  if (!cur) return st
  if (judge(st, name)?.ok) {
    const last = st.eqI + 1 === TOTAL
    const text = isBlack(cur.pc) ? "eq_ok_black" : "eq_ok_natural"
    const vars = { shown: cur.shown, label: name, lo: PCS[mod(cur.pc - 1, TOTAL)][0], hi: PCS[mod(cur.pc + 1, TOTAL)][0] }
    return hit(st, msg("ok", last ? "eq_done" : "ok", text, vars), {
      eqDone: { ...st.eqDone, [cur.pc]: true }, eqI: st.eqI + 1, last: name,
    })
  }
  if (sameName(name, cur.shown)) return miss(st, name, msg("bad", "bad", "eq_bad_self", {}))
  const diff = mod(pcOf(name) - cur.pc, TOTAL)
  const up = diff <= 6
  return miss(st, name, msg("bad", "bad", up ? "eq_bad_up" : "eq_bad_down", { label: name, shown: cur.shown, d: { semis: up ? diff : TOTAL - diff } }))
}

function answerNone(st: State): State {
  const cur = currentEq(st)
  if (!cur) return st
  if (PCS[cur.pc].length === 1) {
    const last = st.eqI + 1 === TOTAL
    return hit(st, msg("ok", last ? "eq_done" : "ok", "eq_ok_none", { shown: cur.shown }), {
      eqDone: { ...st.eqDone, [cur.pc]: true }, eqI: st.eqI + 1, last: null,
    })
  }
  return miss(st, cur.shown, msg("bad", "eq_none_bad", isBlack(cur.pc) ? "eq_none_black" : "eq_none_natural"), null)
}

export type Action =
  | { type: "mode"; mode: RodaMode; fresh: Fresh }
  | { type: "dir"; dir: Dir; fresh: Fresh }
  | { type: "start"; startMode: StartMode; fresh: Fresh }
  | { type: "restart"; fresh: Fresh }
  | { type: "next"; fresh: Fresh }
  | { type: "pick"; name: Name }
  | { type: "none" }
  | { type: "select"; pc: number }

export function reducer(st: State, a: Action): State {
  switch (a.type) {
    case "mode":
      return a.mode === st.mode ? st : restartRound(st, a.fresh, { mode: a.mode })
    case "dir":
      if (a.dir === st.dir) return st
      return st.mode === "ordem" ? restartRound(st, a.fresh, { dir: a.dir }) : { ...st, dir: a.dir }
    case "start":
      return a.startMode === st.startMode ? st : restartRound(st, a.fresh, { startMode: a.startMode })
    case "restart":
      return restartRound(st, a.fresh, { tally: EMPTY_TALLY })
    case "next":
      return restartRound(st, a.fresh)
    case "pick":
      if (st.mode === "ordem") return pickOrdem(st, a.name)
      if (st.mode === "eq") return pickEq(st, a.name)
      return { ...st, sel: pcOf(a.name) }
    case "none":
      return answerNone(st)
    case "select":
      return st.mode === "explorar" ? { ...st, sel: a.pc } : st
  }
}

/* ---------------------------------------------------------------
   O que desenhar
--------------------------------------------------------------- */
export interface Slot {
  pc: number
  black: boolean
  name: Name | null     // null = casa ainda vazia
  sub: Name[]           // outros nomes do mesmo som (aparecem quando conhecidos)
  ask: boolean          // Ordem: é a próxima · Equivalentes: é a perguntada
  sel: boolean          // Explorar: selecionada
  done: boolean         // Equivalentes: já conferida
  flash: boolean        // acabou de ser preenchida
}

export function slots(st: State): Slot[] {
  const next = nextPc(st)
  const cur = currentEq(st)
  return Array.from({ length: TOTAL }, (_, pc): Slot => {
    const base = { pc, black: isBlack(pc), ask: false, sel: false, done: false, flash: false }
    if (st.mode === "ordem") {
      const f = st.filled[pc]
      if (f) return { ...base, name: f, sub: others(pc, f), flash: !!st.last && sameName(st.last, f) }
      return { ...base, name: null, sub: [], ask: pc === next }
    }
    if (st.mode === "eq") {
      const shown = st.eqQ.find((q) => q.pc === pc)!.shown
      const done = !!st.eqDone[pc]
      return { ...base, name: shown, sub: done ? others(pc, shown) : [], ask: cur?.pc === pc, done }
    }
    const n = primary(pc, st.dir)
    return { ...base, name: n, sub: others(pc, n), sel: st.sel === pc }
  })
}

export type TileMark = "" | "used" | "alias" | "done" | "same" | "no" | "ok"
export interface TileView { dim: boolean; mark: TileMark; alias?: Name; hot: boolean }

export function tileView(st: State, name: Name): TileView {
  const pc = pcOf(name)
  let v: TileView = { dim: false, mark: "", hot: false }
  const f = st.filled[pc]
  if (st.mode === "ordem" && f) {
    const used = Object.values(st.filled).some((n) => n && sameName(n, name))
    v = used ? { dim: true, mark: "used", hot: false } : { dim: true, mark: "alias", alias: f, hot: false }
  }
  if (st.mode === "eq" && st.eqDone[pc]) v = { dim: true, mark: "done", hot: false }
  if (st.mode === "explorar" && st.sel === pc) v = { dim: false, mark: "same", hot: true }
  if (st.wrong && sameName(st.wrong, name)) v = { dim: false, mark: "no", hot: true }
  if (st.last && sameName(st.last, name) && st.mode !== "explorar") v = { dim: false, mark: "ok", hot: true }
  return v
}

export type LadderCell =
  | { kind: "half" }
  | { kind: "note"; pc: number; black: boolean; top: Name | null; sub: Name[] | null; known: boolean; hot: boolean }

/** A escada de Dó a Dó: 13 casas e um "½ sem nota" depois de Mi e de Si */
export function ladder(st: State): LadderCell[] {
  const next = nextPc(st)
  const cur = currentEq(st)
  const out: LadderCell[] = []
  for (let i = 0; i <= TOTAL; i++) {
    const pc = i % TOTAL
    let top: Name | null
    let sub: Name[] | null
    let known: boolean
    if (st.mode === "ordem") {
      const f = st.filled[pc]
      top = f ?? null; known = !!f; sub = f ? others(pc, f) : null
    } else if (st.mode === "eq") {
      top = st.eqQ.find((q) => q.pc === pc)!.shown; known = !!st.eqDone[pc]
      sub = known ? others(pc, top) : null
    } else {
      top = primary(pc, st.dir); known = true; sub = others(pc, top)
    }
    const hot = (st.mode === "ordem" && pc === next) || (st.mode === "eq" && cur?.pc === pc) || (st.mode === "explorar" && st.sel === pc)
    out.push({ kind: "note", pc, black: isBlack(pc), top, sub, known, hot })
    if (pc === 4 || pc === 11) out.push({ kind: "half" })
  }
  return out
}
