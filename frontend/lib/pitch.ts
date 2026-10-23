/* ---------------------------------------------------------------
   Altura ouvida → nota. Só matemática: nada de DOM nem de áudio, então
   dá para conferir alimentando frequências na mão.

   Um semitom tem 100 cents. O violino afina em Lá 440 (orquestra
   costuma usar 442), e a corda solta do instrumento do usuário é a
   referência de verdade — por isso `a4` é parâmetro em tudo.
--------------------------------------------------------------- */

export const A4_DEFAULT = 440

/** Frequência de uma altura MIDI (69 = Lá⁴) */
export const midiToHz = (midi: number, a4 = A4_DEFAULT) => a4 * 2 ** ((midi - 69) / 12)

/** Altura MIDI fracionária de uma frequência (60.5 = meio caminho entre duas notas) */
export const hzToMidi = (hz: number, a4 = A4_DEFAULT) => 69 + 12 * Math.log2(hz / a4)

/** Desvio em cents de `hz` em relação a `target` (negativo = baixo) */
export const centsBetween = (hz: number, target: number) => 1200 * Math.log2(hz / target)

/** ok = dentro da tolerância · flat/sharp = a nota certa, desafinada ·
 *  octave = certa, mas noutra oitava (típico de tocar na corda errada) ·
 *  wrong = outra nota */
export type VerdictState = "ok" | "flat" | "sharp" | "octave" | "wrong"

export interface Verdict {
  state: VerdictState
  /** desvio em relação ao alvo, em cents */
  cents: number
  hz: number
  /** a altura MIDI que foi tocada, arredondada */
  midi: number
}

export interface JudgeOptions {
  /** altura MIDI pedida */
  targetMidi: number
  /** Lá de referência (440, 442…) */
  a4?: number
  /** até quantos cents de desvio ainda conta como acerto */
  tolerance?: number
  /** leituras seguidas e estáveis necessárias para decidir */
  frames?: number
  /** o quanto as leituras podem variar entre si, em cents, e ainda assim
   *  serem consideradas a mesma nota (o vibrato cabe aqui) */
  spread?: number
}

/** Quase a nota certa, só desafinada: até aqui dizemos "baixo"/"alto" em
 *  vez de "outra nota". Acima disso o nome da nota ouvida ensina mais. */
const DETUNE_LIMIT = 60

export const DEFAULTS = { a4: A4_DEFAULT, tolerance: 35, frames: 6, spread: 80 } as const

/** Veredito de uma leitura isolada, já estabilizada */
export function judge(hz: number, targetMidi: number, a4 = A4_DEFAULT, tolerance: number = DEFAULTS.tolerance): Verdict {
  const cents = centsBetween(hz, midiToHz(targetMidi, a4))
  const midi = Math.round(hzToMidi(hz, a4))
  // o que sobra depois de descontar oitavas inteiras
  const inOctave = cents - 1200 * Math.round(cents / 1200)
  let state: VerdictState = "wrong"
  if (Math.abs(cents) <= tolerance) state = "ok"
  else if (Math.abs(cents) <= DETUNE_LIMIT) state = cents < 0 ? "flat" : "sharp"
  else if (Math.abs(cents) > 600 && Math.abs(inOctave) <= DETUNE_LIMIT) state = "octave"
  return { state, cents, hz, midi }
}

function median(values: number[]) {
  const a = [...values].sort((x, y) => x - y)
  const m = a.length >> 1
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2
}

export interface Judge {
  /** Alimenta uma leitura (hz = 0 quando não há nota). Devolve o veredito
   *  quando a altura se mantém estável por `frames` leituras. */
  push(hz: number): Verdict | null
  /** Começa a contar de novo — depois de um veredito ou ao trocar de nota */
  reset(): void
  /** Quantas leituras estáveis já acumulou, de 0 a `frames` (para a UI) */
  progress(): number
}

/**
 * Junta leituras até a nota parar de escorregar e só então julga.
 * Isso descarta o ataque do arco e o dedo procurando o lugar, e a mediana
 * no fim deixa o vibrato (±20 a 50 cents) de fora da conta.
 */
export function createJudge(opts: JudgeOptions): Judge {
  const { targetMidi } = opts
  const a4 = opts.a4 ?? DEFAULTS.a4
  const tolerance = opts.tolerance ?? DEFAULTS.tolerance
  const frames = opts.frames ?? DEFAULTS.frames
  const spread = opts.spread ?? DEFAULTS.spread

  let window: number[] = [] // alturas MIDI fracionárias

  return {
    push(hz) {
      if (!(hz > 0)) { window = []; return null }
      const m = hzToMidi(hz, a4)
      // longe da última leitura? a nota mudou: recomeça a janela nela
      if (window.length && Math.abs(m - window[window.length - 1]) * 100 > spread) window = []
      window.push(m)
      if (window.length < frames) return null
      const stable = median(window)
      return judge(midiToHz(stable, a4), targetMidi, a4, tolerance)
    },
    reset() { window = [] },
    progress() { return Math.min(window.length, frames) },
  }
}
