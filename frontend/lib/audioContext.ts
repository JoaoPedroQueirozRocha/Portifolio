/* ---------------------------------------------------------------
   AudioContext único do Caderno de Violino — o som das notas (smplr)
   e a escuta pelo microfone (pitchy) compartilham o mesmo contexto.
   Navegadores limitam quantos contextos uma página pode abrir, e
   dois contextos disputando a placa de som dão travadas no mobile.

   Criar e retomar só dentro de um gesto do usuário, como os
   navegadores exigem.
--------------------------------------------------------------- */

let ctx: AudioContext | null = null

export function getAudioContext(): AudioContext {
  ctx ??= new AudioContext()
  return ctx
}

/** Contexto pronto para tocar/escutar. Chamar a partir de um clique. */
export async function resumeAudioContext(): Promise<AudioContext> {
  const c = getAudioContext()
  if (c.state === "suspended") await c.resume()
  return c
}
