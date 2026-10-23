import type ptBR from "./pt-BR.json"

/* Dicionário do modo — fica junto dele para o modo poder sair do repositório.
   O tipo é o do pt-BR; o en.json tem de ter as mesmas chaves. */
export type EcoDict = typeof ptBR
export type EcoLocale = "pt-BR" | "en"

const dictionaries: Record<EcoLocale, () => Promise<EcoDict>> = {
  "pt-BR": () => import("./pt-BR.json").then((m) => m.default),
  en: () => import("./en.json").then((m) => m.default),
}

export const loadEcoDict = (locale: EcoLocale) => dictionaries[locale]()
