"use client"

import { createContext, Fragment, useContext } from "react"
import type { Dictionary } from "@/app/[lang]/dictionaries"

/* ---------------------------------------------------------------
   Textos comuns do Caderno de Violino (abas, som) — fornecidos pelo
   layout de /violino para todos os modos.
--------------------------------------------------------------- */
export type ViolinoDict = Dictionary["violino"]

const ViolinoTextContext = createContext<ViolinoDict | null>(null)

export function ViolinoProvider({ t, children }: { t: ViolinoDict; children: React.ReactNode }) {
  return <ViolinoTextContext.Provider value={t}>{children}</ViolinoTextContext.Provider>
}

export function useViolinoText() {
  const ctx = useContext(ViolinoTextContext)
  if (!ctx) throw new Error("useViolinoText must be used inside ViolinoProvider")
  return ctx
}

/** Substitui {chave} pelos valores */
export function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`))
}

/** Renderiza **negrito** a partir das strings do dicionário */
export function Rich({ text, as: Tag = "b" }: { text: string; as?: "b" | "strong" }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 ? <Tag key={i}>{part}</Tag> : <Fragment key={i}>{part}</Fragment>
      )}
    </>
  )
}

export function Lozenge() {
  return <span className="lozenge" aria-hidden="true" />
}
