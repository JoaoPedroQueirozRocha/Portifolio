"use client"

import { createContext, useContext } from "react"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import { keyTonic, type Mode, type NoteNames } from "@/lib/armaduras"
import { fmt } from "../shared/text"

export { fmt, Lozenge, Rich } from "../shared/text"

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

export function buildKeyName(t: ArmDict, nn: NoteNames) {
  return (n: number, mode: Mode) => {
    const k = keyTonic(n, mode)
    return fmt(t.key_name, { note: nn.note(k.l, k.alt), mode: t.modes[mode] })
  }
}
