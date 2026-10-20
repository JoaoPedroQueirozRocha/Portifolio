/* ---------------------------------------------------------------
   Treino de Armaduras — lógica musical.
   Tudo é derivado do nº de acidentes `n` (n > 0 sustenidos, n < 0 bemóis).
   Notas são índices de letra (0 = Dó/C … 6 = Si/B); os nomes vêm do
   dicionário do idioma via `makeNoteNames`.
--------------------------------------------------------------- */

export type Alt = -1 | 0 | 1
export type Mode = "major" | "minor"
export type ShapeId = "F1" | "F2" | "F3" | "F4" | "other"

export interface ViolinString {
  l: number   // letra da corda solta
  oct: number // oitava da corda solta
}

export interface StringAnswer {
  alts: Alt[]       // alteração correta de cada dedo (1..4)
  frets: number[]   // [corda solta, dedo 1..4] em semitons a partir da corda solta
  letters: number[] // letra de cada dedo (1..4)
  shape: ShapeId
  halves: number[]  // k tal que entre k e k+1 há meio tom
  stretches: number[] // k tal que entre k e k+1 há 1 tom e meio
  openOut: boolean  // corda solta fora da escala
}

/** Semitons de cada letra natural a partir de Dó */
export const NAT = [0, 2, 4, 5, 7, 9, 11]
const SHARP_ORDER = [3, 0, 4, 1, 5, 2, 6]
const FLAT_ORDER = [6, 2, 5, 1, 4, 0, 3]

// passo diatônico a partir do Mi4 (1ª linha) para cada acidente na pauta
export const SHARP_STEPS = [8, 5, 9, 6, 3, 7, 4]
export const FLAT_STEPS = [4, 7, 3, 6, 2, 5, 1]

// Sol, Ré, Lá, Mi
export const STRINGS: ViolinString[] = [
  { l: 4, oct: 3 },
  { l: 1, oct: 4 },
  { l: 5, oct: 4 },
  { l: 2, oct: 5 },
]

export const SHAPE_IDS: ShapeId[] = ["F1", "F2", "F3", "F4", "other"]

/** 1 tonalidade + 4 dedos × 4 cordas */
export const TOTAL_ITEMS = 1 + STRINGS.length * 4

export const sym = (a: number) => (a > 0 ? "♯" : a < 0 ? "♭" : "")

export function keyAcc(n: number): Alt[] {
  const a: Alt[] = [0, 0, 0, 0, 0, 0, 0]
  if (n > 0) SHARP_ORDER.slice(0, n).forEach((l) => (a[l] = 1))
  if (n < 0) FLAT_ORDER.slice(0, -n).forEach((l) => (a[l] = -1))
  return a
}

/** Letras alteradas, na ordem em que aparecem na armadura */
export const accLetters = (n: number) =>
  n > 0 ? SHARP_ORDER.slice(0, n) : n < 0 ? FLAT_ORDER.slice(0, -n) : []

export function tonic(n: number) {
  const l = (((4 * n) % 7) + 7) % 7
  return { l, alt: keyAcc(n)[l] }
}

export function relMinor(n: number) {
  const l = (tonic(n).l + 5) % 7
  return { l, alt: keyAcc(n)[l] }
}

export const keyTonic = (n: number, mode: Mode) => (mode === "minor" ? relMinor(n) : tonic(n))

/** Classe de altura (0 = Dó … 11 = Si) de uma letra com alteração */
export const pitchClass = (l: number, alt: number) => (((NAT[l] + alt) % 12) + 12) % 12

/** Nomes da mesma altura com no máximo um acidente — Fá♯ e Sol♭ (enarmonia) */
export function spellings(pc: number) {
  const out: { l: number; alt: Alt }[] = []
  for (const alt of [0, 1, -1] as Alt[]) {
    for (let l = 0; l < 7; l++) if (pitchClass(l, alt) === pc) out.push({ l, alt })
  }
  return out
}

/** Armaduras (até 7 acidentes) cuja tônica maior soa nesta altura; a mais simples primeiro */
export function keysForPitch(pc: number) {
  const out: number[] = []
  for (let n = -7; n <= 7; n++) {
    const t = tonic(n)
    if (pitchClass(t.l, t.alt) === pc) out.push(n)
  }
  // menos acidentes primeiro; no empate (Fá♯/Sol♭), sustenidos antes
  return out.sort((a, b) => Math.abs(a) - Math.abs(b) || b - a)
}

export function scale(n: number) {
  const t = tonic(n)
  const a = keyAcc(n)
  return Array.from({ length: 7 }, (_, i) => {
    const l = (t.l + i) % 7
    return { l, alt: a[l], altered: a[l] !== 0 }
  })
}

const semi = (l: number, oct: number, alt: number) => oct * 12 + NAT[l] + alt

function degree(s: ViolinString, d: number) {
  const t = s.l + d
  return { l: t % 7, oct: s.oct + Math.floor(t / 7) }
}

export const fingerLetter = (s: ViolinString, p: number, k: number) => degree(s, p - 1 + k).l

/** Casa (semitons a partir da corda solta) do dedo k com alteração `alt` */
export function fret(s: ViolinString, p: number, k: number, alt: number) {
  const t = degree(s, p - 1 + k)
  return semi(t.l, t.oct, alt) - semi(s.l, s.oct, 0)
}

/** Altura MIDI do dedo k (corda Sol solta = G3 = 55) */
export const midiOf = (s: ViolinString, p: number, k: number, alt: number) =>
  (s.oct + 1) * 12 + NAT[s.l] + fret(s, p, k, alt)

/** Primeira casa exibida no braço para a posição p */
export function base(s: ViolinString, p: number) {
  if (p === 1) return 0
  const t = degree(s, p - 1)
  return semi(t.l, t.oct, 0) - semi(s.l, s.oct, 0)
}

/** frets[0] = corda solta (0); frets[1..4] = dedos */
export const fretsFor = (s: ViolinString, p: number, alts: number[]) => [
  0,
  ...[1, 2, 3, 4].map((k) => fret(s, p, k, alts[k - 1])),
]

function pairsWithGap(frets: number[], p: number, gap: number) {
  const out: number[] = []
  for (let k = p === 1 ? 0 : 1; k < 4; k++) if (frets[k + 1] - frets[k] === gap) out.push(k)
  return out
}
export const halfPairs = (frets: number[], p: number) => pairsWithGap(frets, p, 1)
export const stretchPairs = (frets: number[], p: number) => pairsWithGap(frets, p, 3)

const SHAPE_BY_PAIR: Record<number, ShapeId> = { 0: "F4", 1: "F2", 2: "F1", 3: "F3" }

export function shapeOf(frets: number[], p: number): ShapeId {
  const pr = halfPairs(frets, p)
  return pr.length === 1 ? SHAPE_BY_PAIR[pr[0]] : "other"
}

export function stringAnswer(s: ViolinString, p: number, n: number): StringAnswer {
  const acc = keyAcc(n)
  const letters = [1, 2, 3, 4].map((k) => fingerLetter(s, p, k))
  const alts = letters.map((l) => acc[l])
  const frets = fretsFor(s, p, alts)
  return {
    alts,
    frets,
    letters,
    shape: shapeOf(frets, p),
    halves: halfPairs(frets, p),
    stretches: stretchPairs(frets, p),
    openOut: acc[s.l] !== 0,
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickKey(range: number, prev: number | null) {
  const pool: number[] = []
  for (let n = -range; n <= range; n++) if (n !== prev) pool.push(n)
  return pool[Math.floor(Math.random() * pool.length)]
}

/** A resposta certa + 3 distratores dentro do mesmo intervalo */
export function options(n: number, range: number) {
  const pool: number[] = []
  for (let m = -range; m <= range; m++) if (m !== n) pool.push(m)
  return shuffle([n, ...shuffle(pool).slice(0, 3)])
}

/* ---------------------------------------------------------------
   Nomes de notas — dependem do idioma (Dó, Ré… / C, D…)
--------------------------------------------------------------- */
export function makeNoteNames(letters: readonly string[]) {
  const L = letters
  const sharps = [L[0], L[0] + "♯", L[1], L[1] + "♯", L[2], L[3], L[3] + "♯", L[4], L[4] + "♯", L[5], L[5] + "♯", L[6]]
  const flats = [L[0], L[1] + "♭", L[1], L[2] + "♭", L[2], L[3], L[4] + "♭", L[4], L[5] + "♭", L[5], L[6] + "♭", L[6]]
  // sem armadura: grafia mais comum de cada tecla preta
  const plain = [L[0], L[0] + "♯", L[1], L[2] + "♭", L[2], L[3], L[3] + "♯", L[4], L[4] + "♯", L[5], L[6] + "♭", L[6]]
  return {
    note: (l: number, a: number = 0) => L[l] + sym(a),
    /** Nome cromático de uma casa, com a grafia (♯/♭) da armadura */
    casa: (s: ViolinString, f: number, n: number) => (n < 0 ? flats : sharps)[(NAT[s.l] + f) % 12],
    /** Nome de uma altura MIDI qualquer, grafada conforme a armadura */
    pitch: (midi: number, n: number) => (n > 0 ? sharps : n < 0 ? flats : plain)[((midi % 12) + 12) % 12],
  }
}

export type NoteNames = ReturnType<typeof makeNoteNames>
