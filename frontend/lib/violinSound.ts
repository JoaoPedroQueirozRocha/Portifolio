/* ---------------------------------------------------------------
   Som de violino — amostras do soundfont "violin" (MusyngKite) via smplr.
   Nada é baixado para o projeto: as amostras vêm da CDN da smplr na
   primeira vez que o som é habilitado. O AudioContext só é criado dentro
   de um gesto do usuário (clique no botão), como os navegadores exigem.

   O estado (desligado/carregando/ligado/erro) é global ao Caderno de
   Violino: ligar o som num modo vale para os outros. Sempre começa
   desligado a cada carregamento da página.
--------------------------------------------------------------- */
import type { NoteEvent, Smplr } from "smplr"

export type SoundStatus = "off" | "loading" | "on" | "error"

let ctx: AudioContext | null = null
let loading: Promise<Smplr> | null = null
let violin: Smplr | null = null
let stopLast: (() => void) | null = null
let status: SoundStatus = "off"
const listeners = new Set<() => void>()

function setStatus(next: SoundStatus) {
  status = next
  listeners.forEach((l) => l())
}

export function subscribeSound(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export const getSoundStatus = () => status

/** Liga o som (carrega o violino na 1ª vez). Chamar a partir de um clique. */
export async function turnSoundOn(): Promise<boolean> {
  if (status === "on") return true
  setStatus("loading")
  try {
    ctx ??= new AudioContext()
    if (ctx.state === "suspended") await ctx.resume()
    loading ??= import("smplr").then(async ({ Soundfont }) => {
      const inst = Soundfont(ctx as AudioContext, { instrument: "violin", kit: "MusyngKite" })
      await inst.ready
      return inst
    })
    violin = await loading
    setStatus("on")
    return true
  } catch {
    loading = null // permite tentar de novo
    setStatus("error")
    return false
  }
}

export function turnSoundOff() {
  stopLast?.()
  stopLast = null
  setStatus("off")
}

/** Toca uma nota MIDI curta, interrompendo a anterior. Ignorado com o som desligado. */
export function playMidi(midi: number) {
  if (status !== "on" || !violin) return
  stopLast?.()
  const event: NoteEvent = { note: midi, velocity: 90, duration: 0.9 }
  stopLast = violin.start(event)
}
