/* ---------------------------------------------------------------
   Som de violino — amostras do soundfont "violin" (MusyngKite) via smplr.
   Nada é baixado para o projeto: as amostras vêm da CDN da smplr na
   primeira vez que o som é habilitado. O AudioContext só é criado dentro
   de um gesto do usuário (clique no botão), como os navegadores exigem.
--------------------------------------------------------------- */
import type { NoteEvent, Smplr } from "smplr"

let ctx: AudioContext | null = null
let loading: Promise<Smplr> | null = null
let violin: Smplr | null = null
let stopLast: (() => void) | null = null

/** Cria o contexto de áudio e carrega o violino. Chamar a partir de um clique. */
export async function enableViolinSound(): Promise<void> {
  ctx ??= new AudioContext()
  if (ctx.state === "suspended") await ctx.resume()

  loading ??= import("smplr").then(async ({ Soundfont }) => {
    const inst = Soundfont(ctx as AudioContext, { instrument: "violin", kit: "MusyngKite" })
    await inst.ready
    return inst
  })

  try {
    violin = await loading
  } catch (err) {
    loading = null // permite tentar de novo
    throw err
  }
}

/** Toca uma nota MIDI curta, interrompendo a anterior */
export function playMidi(midi: number) {
  if (!violin) return
  stopLast?.()
  const event: NoteEvent = { note: midi, velocity: 90, duration: 0.9 }
  stopLast = violin.start(event)
}
