"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { AudioLines, Mic, X } from "lucide-react"
import { STRINGS, makeNoteNames, openMidi } from "@/lib/armaduras"
import { centsBetween, hzToMidi, midiToHz } from "@/lib/pitch"
import {
  getListenStatus, onFrame, startListening, stopListening, subscribeListen,
} from "@/lib/violinListen"
import { fmt, useViolinoText } from "./text"

/* ---------------------------------------------------------------
   Afinador do caderno — botão na barra dos modos e um painel solto
   com a leitura ao vivo. Usa o mesmo microfone da prática
   (violinListen.ts), que só é solto quando ninguém mais precisa dele.

   O painel vai num portal para o body: a barra dos modos rola na
   horizontal e cortaria qualquer coisa posicionada dentro dela.
--------------------------------------------------------------- */

const A4_OPTIONS = [440, 442] as const
/** Cadência da leitura na tela (a análise roda bem mais rápido) */
const UI_MS = 70
/** Leituras guardadas para a mediana — tira o tremor sem atrasar */
const SMOOTH = 5
/** Dentro disso a corda está afinada */
const IN_TUNE_CENTS = 5
/** Distância máxima, em semitons, para apontar uma corda do violino */
const NEAR_STRING = 1.5

const PANEL_W = 300

function median(values: number[]) {
  const a = [...values].sort((x, y) => x - y)
  const m = a.length >> 1
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2
}

export default function Tuner() {
  const t = useViolinoText()
  const tu = t.tuner
  const owner = useMemo(() => Symbol("afinador"), [])
  const nn = useMemo(() => makeNoteNames(t.letters), [t.letters])
  const status = useSyncExternalStore(subscribeListen, getListenStatus, () => "off" as const)

  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [at, setAt] = useState({ top: 0, left: 0 })
  const [a4, setA4] = useState<number>(A4_OPTIONS[0])
  const [hz, setHz] = useState(0)

  const close = useCallback(() => {
    setOpen(false)
    setHz(0)
    stopListening(owner)
  }, [owner])

  const place = useCallback(() => {
    const r = btn.current?.getBoundingClientRect()
    if (!r) return
    setAt({
      top: r.bottom + 8,
      left: Math.max(12, Math.min(r.left, window.innerWidth - PANEL_W - 12)),
    })
  }, [])

  function toggle() {
    if (open) return close()
    place()
    setOpen(true)
  }

  // soltar o microfone ao sair da página
  useEffect(() => () => stopListening(owner), [owner])

  /* Esc e clique fora fecham; o painel é fixo, então acompanha o botão
     quando a página rola ou muda de tamanho. */
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    const down = (e: MouseEvent) => {
      const target = e.target as Node
      if (!panel.current?.contains(target) && !btn.current?.contains(target)) close()
    }
    document.addEventListener("keydown", key)
    document.addEventListener("mousedown", down)
    window.addEventListener("scroll", place, true)
    window.addEventListener("resize", place)
    return () => {
      document.removeEventListener("keydown", key)
      document.removeEventListener("mousedown", down)
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
    }
  }, [open, close, place])

  // leitura ao vivo, suavizada pela mediana das últimas
  useEffect(() => {
    if (!open || status !== "on") return
    const buf: number[] = []
    let last = 0
    return onFrame((r) => {
      if (r.hz > 0) {
        buf.push(r.hz)
        if (buf.length > SMOOTH) buf.shift()
      } else {
        buf.length = 0
      }
      const now = performance.now()
      if (now - last < UI_MS) return
      last = now
      setHz(buf.length >= 3 ? median(buf) : 0)
    })
  }, [open, status])

  const reading = hz > 0 ? read(hz, a4) : null
  const live = status === "on"

  return (
    <>
      <button
        type="button"
        ref={btn}
        className={"vl-tun-btn" + (open ? " on" : "")}
        onClick={toggle}
        aria-expanded={open}
        aria-label={tu.title}
        title={tu.title}
      >
        <AudioLines size={17} />
      </button>

      {open && createPortal(
        <div ref={panel} className="vl-tun-panel" style={{ top: at.top, left: at.left }} role="dialog" aria-label={tu.title}>
          <header className="vl-tun-head">
            <span className="eyebrow">{tu.title}</span>
            <button type="button" className="vl-x" onClick={close} aria-label={tu.close}>
              <X size={16} />
            </button>
          </header>

          {!live ? (
            <div className="vl-tun-off">
              <p>{tu.lead}</p>
              {status !== "off" && status !== "asking" && <p className="vl-tun-err">{tu.err[status]}</p>}
              <button
                type="button"
                className="vl-btn vl-btn-primary"
                onClick={() => void startListening(owner)}
                disabled={status === "asking"}
                aria-busy={status === "asking"}
              >
                <Mic size={15} /> {status === "asking" ? tu.asking : status === "off" ? tu.start : tu.retry}
              </button>
            </div>
          ) : (
            <div className="vl-tun-live" aria-live="off">
              <div className={"vl-tun-note" + (reading && Math.abs(reading.cents) <= IN_TUNE_CENTS ? " is-ok" : "")}>
                <strong>{reading ? nn.pitch(reading.midi, 1) : "—"}</strong>
                <span>{reading ? fmt(tu.hz, { hz: reading.hz.toFixed(1) }) : tu.silent}</span>
              </div>

              <div className="vl-tun-bar">
                <span className="vl-tun-band" />
                <span className="vl-tun-mid" />
                {reading && (
                  <span
                    className="vl-tun-needle"
                    style={{ left: `${50 + Math.max(-50, Math.min(50, reading.cents))}%` }}
                  />
                )}
              </div>
              <div className="vl-tun-scale">
                <span>{tu.flat}</span>
                <b>{reading ? `${reading.cents > 0 ? "+" : ""}${Math.round(reading.cents)}` : "—"}</b>
                <span>{tu.sharp}</span>
              </div>

              <div className="vl-tun-strings">
                {STRINGS.map((s) => {
                  const m = openMidi(s)
                  const near = reading ? Math.abs(hzToMidi(reading.hz, a4) - m) <= NEAR_STRING : false
                  const tuned = near && reading && Math.abs(centsBetween(reading.hz, midiToHz(m, a4))) <= IN_TUNE_CENTS
                  return (
                    <span key={s.l} className={"vl-tun-s" + (near ? " is-near" : "") + (tuned ? " is-ok" : "")}>
                      {nn.note(s.l)}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <footer className="vl-tun-foot">
            <span className="vl-tun-a4">{tu.a4}</span>
            {A4_OPTIONS.map((v) => (
              <button
                key={v}
                type="button"
                className={"vl-tab" + (a4 === v ? " active" : "")}
                aria-pressed={a4 === v}
                onClick={() => setA4(v)}
              >
                {v}
              </button>
            ))}
          </footer>
        </div>,
        document.body,
      )}
    </>
  )
}

/** Nota mais próxima da frequência ouvida e o quanto ela está desviada */
function read(hz: number, a4: number) {
  const midi = Math.round(hzToMidi(hz, a4))
  return { hz, midi, cents: centsBetween(hz, midiToHz(midi, a4)) }
}
