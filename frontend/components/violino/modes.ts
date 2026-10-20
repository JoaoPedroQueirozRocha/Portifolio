/* ---------------------------------------------------------------
   Modos do Caderno de Violino — a ordem aqui é a ordem das abas.
   `enabled: false` mantém o modo registrado (textos no dicionário,
   slug reservado) mas fora das abas até ser implementado.
--------------------------------------------------------------- */
export const VIOLINO_MODES = [
  { id: "armaduras",  slug: "armaduras",    numeral: "I",   enabled: true },
  { id: "onde_tocar", slug: "onde-tocar",   numeral: "II",  enabled: true },
  // Planejados (design pronto no Claude Design) — ocultos por enquanto:
  { id: "nomear",     slug: "nomear-notas", numeral: "III", enabled: false },
  { id: "corrida",    slug: "corrida",      numeral: "IV",  enabled: false },
] as const

export type ViolinoModeId = (typeof VIOLINO_MODES)[number]["id"]

export const DEFAULT_MODE = VIOLINO_MODES[0]
