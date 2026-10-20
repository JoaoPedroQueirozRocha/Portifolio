"use client"

import { createContext, Fragment, useContext } from "react"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import { keyTonic, type Mode, type NoteNames } from "@/lib/armaduras"

export type ArmDict = Dictionary["armaduras"]

interface ArmText {
  t: ArmDict
  nn: NoteNames
  keyName: (n: number, mode: Mode) => string
}

export const ArmTextContext = createContext<ArmText | null>(null)

export function useArmText() {
  const ctx = useContext(ArmTextContext)
  if (!ctx) throw new Error("useArmText must be used inside ArmTextContext")
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

export function buildKeyName(t: ArmDict, nn: NoteNames) {
  return (n: number, mode: Mode) => {
    const k = keyTonic(n, mode)
    return fmt(t.key_name, { note: nn.note(k.l, k.alt), mode: t.modes[mode] })
  }
}
