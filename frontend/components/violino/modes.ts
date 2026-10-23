/* ---------------------------------------------------------------
   Modos do Caderno de Violino — a ordem aqui é a ordem das abas, e o
   numeral romano de cada aba vem da posição entre os modos ativos.
   `enabled: false` mantém o modo registrado (textos no dicionário,
   slug reservado) mas fora das abas até ser implementado.
--------------------------------------------------------------- */
export const VIOLINO_MODES = [
  { id: "armaduras",  slug: "armaduras",    enabled: true },
  { id: "onde_tocar", slug: "onde-tocar",   enabled: true },
  // Planejados (design pronto no Claude Design) — ocultos por enquanto:
  { id: "nomear",     slug: "nomear-notas", enabled: false },
  { id: "corrida",    slug: "corrida",      enabled: false },
  { id: "roda",       slug: "roda",         enabled: true },
  { id: "eco",        slug: "eco",          enabled: true },
] as const

export type ViolinoModeId = (typeof VIOLINO_MODES)[number]["id"]

export const DEFAULT_MODE = VIOLINO_MODES[0]

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]

/** Abas visíveis, já com o numeral romano da posição */
export const enabledModes = () =>
  VIOLINO_MODES.filter((m) => m.enabled).map((m, i) => ({ ...m, numeral: ROMAN[i] ?? String(i + 1) }))
