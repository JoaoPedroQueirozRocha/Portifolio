"use client"

import { useEffect, useMemo, useReducer } from "react"
import { RotateCcw } from "lucide-react"
import { makeNoteNames } from "@/lib/armaduras"
import { playMidi } from "@/lib/violinSound"
import { ScoreBoard, Seg, SoundButton } from "../shared/Controls"
import { fmt, Lozenge, useViolinoText } from "../shared/text"
import type { RodaDict } from "./i18n"
import {
  MODES, PCS, TOTAL, currentEq, currentMsg, initialState, isFinished, makeFresh, midiOfPc, mod, nextPc,
  others, parseSaved, pcOf, primary, progress, reducer, slots,
  type Dir, type Name, type RodaMode, type Slot, type StartMode, type Var,
} from "./logic"
import Wheel, { type CenterView } from "./Wheel"
import Bank from "./Bank"
import Ladder from "./Ladder"

/* ---------------------------------------------------------------
   Estado salvo no navegador: ajustes + placar
--------------------------------------------------------------- */
const STORE_KEY = "roda:v1"

function loadSaved() {
  try {
    return parseSaved(JSON.parse(localStorage.getItem(STORE_KEY) ?? "null"))
  } catch {
    return undefined
  }
}

function init() {
  const saved = loadSaved()
  return initialState(saved, makeFresh(saved?.startMode ?? "do"))
}

export default function RodaGame({ t }: { t: RodaDict }) {
  const { letters } = useViolinoText()
  const nn = useMemo(() => makeNoteNames(letters), [letters])
  const [st, dispatch] = useReducer(reducer, undefined, init)
  const { mode, dir } = st

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ mode: st.mode, dir: st.dir, startMode: st.startMode, tally: st.tally }))
    } catch { /* storage indisponível — segue sem persistir */ }
  }, [st.mode, st.dir, st.startMode, st.tally])

  /* ---- textos ---- */
  const nm = (n: Name) => nn.note(n.l, n.alt)
  const semis = (n: number) => (n === 1 ? t.semis_one : fmt(t.semis_many, { n }))
  const show = (v: Var): string | number => (typeof v === "object" ? ("semis" in v ? semis(v.semis) : nm(v)) : v)
  const say = (tpl: string | undefined, vars: Record<string, Var>) =>
    fmt(tpl ?? "", Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, show(v)])))

  const m = currentMsg(st)
  const msgHead = say((t.heads as Record<string, string>)[m.head], m.vars)
  const msgText = say((t.msg as Record<string, string>)[m.text], m.vars)

  const cur = currentEq(st)
  const next = nextPc(st)
  const finished = isFinished(st)
  const prog = progress(st)
  const c = t.center

  const center: CenterView = (() => {
    const dirText = mode === "eq" ? "" : dir > 0 ? c.dir_up : c.dir_down
    if (mode === "ordem") {
      if (next === null) return { eyebrow: c.ordem_done, big: "✓", sub: c.ordem_done_sub, dir: dirText, ok: true }
      const prev = st.filled[mod(next - dir, TOTAL)]
      const sub = st.k === 0 || !prev
        ? fmt(c.ordem_start, { start: nm(PCS[st.start][0]) })
        : fmt(dir > 0 ? c.ordem_next_up : c.ordem_next_down, { prev: nm(prev) })
      return { eyebrow: fmt(c.ordem_eyebrow, { i: st.k + 1, n: TOTAL }), big: "?", sub, dir: dirText, ok: false }
    }
    if (mode === "eq") {
      return cur
        ? { eyebrow: c.eq_eyebrow, big: nm(cur.shown), sub: c.eq_sub, dir: dirText, ok: false }
        : { eyebrow: c.eq_done, big: "✓", sub: c.eq_done_sub, dir: dirText, ok: true }
    }
    if (st.sel === null) return { eyebrow: c.exp_eyebrow, big: "♪", sub: c.exp_sub, dir: dirText, ok: false }
    const main = primary(st.sel, dir)
    const alias = others(st.sel, main)
    return {
      eyebrow: alias.length ? c.exp_two : c.exp_one,
      big: nm(main),
      sub: alias.length ? fmt(c.exp_alias, { names: alias.map(nm).join(c.sep) }) : c.exp_none,
      dir: dirText,
      ok: false,
    }
  })()

  const panel = t.panel[mode]
  const panelText = mode === "ordem" ? (dir > 0 ? t.panel.ordem.text_up : t.panel.ordem.text_down) : (panel as { text: string }).text
  const showNone = mode === "eq" && !!cur

  /* ---- ações ---- */
  const play = (pc: number) => playMidi(midiOfPc(pc))
  const fresh = (startMode: StartMode = st.startMode) => makeFresh(startMode)

  function pick(name: Name) {
    dispatch({ type: "pick", name })
    play(pcOf(name))
  }
  function none() {
    dispatch({ type: "none" })
    if (cur) play(cur.pc)
  }
  function slot(s: Slot) {
    if (mode === "explorar") dispatch({ type: "select", pc: s.pc })
    play(s.pc)
  }

  const modeOptions = MODES.map((v) => ({ v, l: t.groups.mode[v] }))
  const dirOptions: { v: Dir; l: string }[] = [{ v: 1, l: t.groups.dir.up }, { v: -1, l: t.groups.dir.down }]
  const startOptions: { v: StartMode; l: string }[] = [{ v: "do", l: nn.note(0) }, { v: "rand", l: t.groups.start.rand }]

  return (
    <main className="vl-main rd">
      <header className="vl-head">
        <div>
          <span className="eyebrow"><Lozenge /> {mode === "explorar" ? t.eyebrow_explore : t.eyebrow}</span>
          <h1 className="vl-title">{t.title}</h1>
          <p className="vl-sub">{t.subtitle}</p>
        </div>
        {mode !== "explorar" && (
          <ScoreBoard
            label={t.score.label}
            items={[
              { label: t.score.ok, value: st.tally.ok },
              { label: t.score.bad, value: st.tally.bad },
              { label: t.score.streak, value: st.tally.streak },
            ]}
          />
        )}
      </header>

      <div className="vl-toolbar">
        <div className="vl-settings">
          <Seg<RodaMode>
            label={t.groups.mode.label}
            value={mode}
            options={modeOptions}
            onChange={(v) => dispatch({ type: "mode", mode: v, fresh: fresh() })}
          />
          <Seg<Dir>
            label={t.groups.dir.label}
            value={dir}
            options={dirOptions}
            onChange={(v) => dispatch({ type: "dir", dir: v, fresh: fresh() })}
          />
          {mode === "ordem" && (
            <Seg<StartMode>
              label={t.groups.start.label}
              value={st.startMode}
              options={startOptions}
              onChange={(v) => dispatch({ type: "start", startMode: v, fresh: fresh(v) })}
            />
          )}
        </div>
        <div className="vl-tools">
          <button type="button" className="vl-btn vl-btn-ghost vl-nowrap" onClick={() => dispatch({ type: "restart", fresh: fresh() })}>
            <RotateCcw size={16} /> {t.restart}
          </button>
          <SoundButton />
        </div>
      </div>

      <section className="vl-folio rd-folio">
        <span className="vl-corner tl" /><span className="vl-corner tr" />
        <span className="vl-corner bl" /><span className="vl-corner br" />

        <Wheel t={t} slots={slots(st)} center={center} mode={mode} name={nm} onSlot={slot} />

        <div className="rd-side">
          <div className="rd-intro">
            <span className="rd-eyebrow">{panel.eyebrow}</span>
            <h2 className="rd-panel-title">{panel.title}</h2>
            <p>{panelText}</p>
          </div>

          <div className="rd-progress">
            <div><span>{panel.progress}</span><span>{prog.done}/{prog.total}</span></div>
            <div className="rd-bar"><div style={{ width: `${(prog.done / prog.total) * 100}%` }} /></div>
          </div>

          <div className={"rd-msg is-" + m.tone} role="status" aria-live="polite">
            <span className="rd-msg-head">{msgHead}</span>
            <span className="rd-msg-text">{msgText}</span>
          </div>

          <Bank t={t} st={st} name={nm} onPick={pick} />

          {showNone && (
            <button type="button" className="vl-btn vl-btn-ghost rd-none" onClick={none}>
              {t.none_btn} <i>{t.none_hint}</i>
            </button>
          )}
          {finished && (
            <button type="button" className="vl-btn vl-btn-primary rd-next" onClick={() => dispatch({ type: "next", fresh: fresh() })}>
              {mode === "ordem" ? t.next_ordem : t.next_eq}
            </button>
          )}
        </div>
      </section>

      <section className="rd-ladder-wrap">
        <div className="rd-ladder-head">
          <h2 className="rd-ladder-title">{t.ladder.title}</h2>
          <span>{t.ladder.subtitle}</span>
        </div>
        <Ladder t={t} st={st} name={nm} />
      </section>

      <div className="rd-cards">
        {t.cards.map((card, i) => (
          <article key={card.tag} className={"rd-card" + (i === 2 ? " is-special" : "")}>
            <span className="rd-eyebrow">{card.tag}</span>
            <b>{card.title}</b>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
    </main>
  )
}
