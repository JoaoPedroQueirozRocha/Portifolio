"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { playMidi, stopMidi } from "@/lib/violinSound"
import type { Playing } from "./text"

export interface Flash { si: number; ci: number }

/* ---------------------------------------------------------------
   Toca notas em sequência (contexto e alvo) e o toque da pessoa no
   braço, com o indicador "tocando". Tudo que está agendado é cancelado
   quando outra coisa começa ou quando o modo sai da tela.
--------------------------------------------------------------- */
const CTX_NOTE = 0.5      // s
const TARGET_NOTE = 1.1   // s
const TOUCH_NOTE = 0.9    // s
const FLASH_MS = 650

export function useSequencer() {
  const timers = useRef<number[]>([])
  const [playing, setPlaying] = useState<Playing>(null)
  const [flash, setFlash] = useState<Flash | null>(null)

  const clear = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  /** Agenda algo; é cancelado junto com o resto por `stop` e `sequence` */
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  /** Para tudo: o que estava agendado, a nota que soa e os indicadores */
  const stop = useCallback(() => {
    clear()
    stopMidi()
    setPlaying(null)
    setFlash(null)
  }, [clear])

  // ao sair do modo: sem timers pendentes e sem nota soando
  useEffect(() => () => { clear(); stopMidi() }, [clear])

  /** Toca as notas, uma a cada `gap` ms; `done` roda quando a última termina */
  const sequence = useCallback((kind: "ctx" | "alvo" | "atual", notes: number[], gap: number, done?: () => void) => {
    clear()
    setFlash(null)
    if (!notes.length) {
      setPlaying(null)
      done?.()
      return
    }
    const dur = kind === "ctx" ? CTX_NOTE : TARGET_NOTE
    notes.forEach((m, i) => later(() => {
      setPlaying({ kind, step: i + 1, total: notes.length })
      playMidi(m, dur)
    }, i * gap))
    later(() => {
      setPlaying(null)
      done?.()
    }, (notes.length - 1) * gap + (kind === "ctx" ? 700 : 1100))
  }, [clear, later])

  /** O toque da pessoa numa casa: soa e a casa acende por um instante */
  const touch = useCallback((si: number, ci: number, midi: number) => {
    clear()
    playMidi(midi, TOUCH_NOTE)
    setFlash({ si, ci })
    setPlaying({ kind: "toque", step: 1, total: 1 })
    later(() => {
      setFlash(null)
      setPlaying(null)
    }, FLASH_MS)
  }, [clear, later])

  return { playing, flash, sequence, touch, later, stop }
}
