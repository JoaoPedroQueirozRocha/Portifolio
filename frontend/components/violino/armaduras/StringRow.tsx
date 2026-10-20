"use client"

import { useState, type PointerEvent } from "react"
import {
  base, fret, fingerLetter, fretsFor, halfPairs, inScale, openMidi,
  type Alt, type StringAnswer, type ViolinString,
} from "@/lib/armaduras"
import { BoardCell, BoardCells, BoardRow, BoardWire } from "../shared/Board"
import { FretCell } from "../shared/Fret"
import { fmt, useArmText } from "./text"

const ALT_GLYPH: Record<Alt, string> = { [-1]: "♭", 0: "♮", 1: "♯" }
const CYCLE: Alt[] = [0, 1, -1]
const COLS = 9

interface Drag {
  k: number
  x: number
  x0: number
  moved: boolean
  boardLeft: number   // capturados no pointerdown — evita ler ref durante o render
  boardWidth: number
}

interface StringRowProps {
  s: ViolinString
  p: number
  n: number
  alts: Alt[]
  onSetAlt: (k: number, a: Alt) => void
  checked: boolean
  ans: StringAnswer
  showHalves: boolean
}

export default function StringRow({ s, p, n, alts, onSetAlt, checked, ans, showHalves }: StringRowProps) {
  const { t, nn } = useArmText()
  const [drag, setDrag] = useState<Drag | null>(null)

  const b = base(s, p)
  const frets = fretsFor(s, p, alts)
  const cols = Array.from({ length: COLS }, (_, i) => b + i)
  const colOf = (f: number) => Math.max(0, Math.min(COLS - 1, f - b))
  const left = (c: number) => `${((c + 0.5) / COLS) * 100}%`
  const halves = showHalves ? halfPairs(frets, p) : []
  const stringName = nn.note(s.l)

  // casas ocupadas por outros dedos (e pela corda solta na 1ª posição) — nunca sobrepor
  const taken = (k: number) => frets.filter((_, i) => i !== k && (i > 0 || p === 1))
  const fretFor = (k: number, a: Alt) => fret(s, p, k, a)
  const free = (k: number, a: Alt) => !taken(k).includes(fretFor(k, a))

  function cycle(k: number) {
    let i = CYCLE.indexOf(alts[k - 1])
    for (let tries = 0; tries < 3; tries++) {
      i = (i + 1) % 3
      if (free(k, CYCLE[i])) return onSetAlt(k - 1, CYCLE[i])
    }
  }

  function snapAlt(k: number, col: number): Alt {
    const target = b + col
    const opts = ([-1, 0, 1] as Alt[]).filter((a) => free(k, a) || a === alts[k - 1])
    opts.sort((a, c) => Math.abs(fretFor(k, a) - target) - Math.abs(fretFor(k, c) - target))
    return opts[0]
  }

  const colAt = (d: Drag, x: number) =>
    Math.max(0, Math.min(COLS - 1, Math.floor(((x - d.boardLeft) / d.boardWidth) * COLS)))

  function down(e: PointerEvent<HTMLButtonElement>, k: number) {
    if (checked || e.button > 0) return
    const board = e.currentTarget.parentElement
    if (!board) return
    const r = board.getBoundingClientRect()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ k, x: e.clientX, x0: e.clientX, moved: false, boardLeft: r.left, boardWidth: r.width })
  }
  function move(e: PointerEvent<HTMLButtonElement>) {
    if (!drag) return
    const moved = drag.moved || Math.abs(e.clientX - drag.x0) > 5
    setDrag({ ...drag, x: e.clientX, moved })
  }
  function up(e: PointerEvent<HTMLButtonElement>) {
    if (!drag) return
    const d = drag
    setDrag(null)
    if (!d.moved) return cycle(d.k)
    const a = snapAlt(d.k, colAt(d, e.clientX))
    if (a !== alts[d.k - 1]) onSetAlt(d.k - 1, a)
  }

  const dragging = drag?.moved ? drag : null
  const dragLeft = dragging
    ? Math.max(0, Math.min(dragging.boardWidth, dragging.x - dragging.boardLeft)) + "px"
    : null
  const snapCol = dragging ? colOf(fretFor(dragging.k, snapAlt(dragging.k, colAt(dragging, dragging.x)))) : null

  const nOk = alts.filter((a, i) => a === ans.alts[i]).length
  const shape = t.shapes[ans.shape]

  const sfix = (
    <div className="arm-sfix" aria-live="polite">
      {checked && (
        <>
          <span className="arm-sfix-l">{t.shape}</span>
          <span className="arm-sfix-row">
            <span className="arm-shape-badge">{shape.label}</span>
            <span className="arm-sfix-d">{shape.desc}</span>
          </span>
          <span className={"arm-sfix-n" + (nOk === 4 ? " is-ok" : " is-bad")}>{fmt(t.fingers_ok, { n: nOk })}</span>
        </>
      )}
    </div>
  )

  return (
    <BoardRow name={stringName} cap={t.string} after={sfix}>
      <BoardWire />
      <BoardCells>
        {cols.map((f, i) => {
          const open = p === 1 && i === 0
          const m = openMidi(s) + f
          // antes de conferir as casas ficam neutras — destacar a escala entregaria a resposta
          const tone = !checked ? "neutral" : inScale(m, n) ? "scale" : "out"
          return (
            <BoardCell
              key={f}
              open={open}
              className={(p !== 1 && i === 0 ? "is-ref" : "") + (snapCol === i ? " is-target" : "")}
            >
              {/* círculo só na corda solta; nas outras casas o dedo arrastável é o círculo */}
              <FretCell
                name={open ? stringName : nn.casa(s, f, n)}
                tone={tone}
                number={f}
                open={open}
                dot={open}
                struck={open && checked && ans.openOut}
                title={open ? (checked && ans.openOut ? t.open_out : t.open_string) : undefined}
              />
            </BoardCell>
          )
        })}
      </BoardCells>

      {halves.map((k) => {
        if (dragging && (dragging.k === k || dragging.k === k + 1)) return null
        const mid = (colOf(frets[k]) + colOf(frets[k + 1])) / 2
        return <span key={"h" + k} className="arm-half" style={{ left: left(mid) }}>½</span>
      })}

      {[1, 2, 3, 4].map((k) => {
        const ok = checked ? alts[k - 1] === ans.alts[k - 1] : null
        const name = nn.note(fingerLetter(s, p, k), alts[k - 1])
        const isDragging = dragging?.k === k
        return (
          <button
            key={k}
            type="button"
            className={
              "arm-finger" +
              (ok === true ? " is-ok" : ok === false ? " is-bad" : "") +
              (isDragging ? " is-dragging" : "")
            }
            style={{ left: isDragging && dragLeft ? dragLeft : left(colOf(frets[k])) }}
            disabled={checked}
            onPointerDown={(e) => down(e, k)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => setDrag(null)}
            // teclado (Enter/Espaço) dispara click com detail 0
            onClick={(e) => { if (e.detail === 0) cycle(k) }}
            aria-label={fmt(t.finger_aria, { k, name, alt: ALT_GLYPH[alts[k - 1]] })}
          >
            <i>{k}</i><b>{name}</b>
            {ok === false && <em className="arm-fix">{nn.note(ans.letters[k - 1], ans.alts[k - 1])}</em>}
          </button>
        )
      })}
    </BoardRow>
  )
}
