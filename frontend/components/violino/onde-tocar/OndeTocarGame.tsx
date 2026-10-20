"use client"

import { useEffect, useMemo, useReducer, useState } from "react"
import { Music, RotateCcw, SlidersHorizontal } from "lucide-react"
import type { Dictionary } from "@/app/[lang]/dictionaries"
import { STRINGS, accLetters, makeNoteNames, tonic, type Alt } from "@/lib/armaduras"
import {
  LENGTHS, NOTES_PER_LINE, OPEN_MIDI, PRESETS, bestPlace, cloneConfig, generate, midiOfStep, presetOf,
  type Config, type PresetId, type ReadNote, type Score as ReadScore,
} from "@/lib/leitura"
import { getSoundStatus, playMidi, turnSoundOn } from "@/lib/violinSound"
import { ScoreBoard, Seg, SoundButton } from "../shared/Controls"
import { fmt, Lozenge, useViolinoText } from "../shared/text"
import { HelpButton } from "../armaduras/HelpBalloon"
import NoteStaff, { type StaffNote } from "./NoteStaff"
import Fingerboard, { type Feedback } from "./Fingerboard"

type OTDict = Dictionary["onde_tocar"]

const ACC: Record<Alt, string> = { 1: "♯", [-1]: "♭", 0: "♮" }
const AUTO_ADVANCE_MS = 1100
const TICK_MS = 100

/* ---------------------------------------------------------------
   Estado persistido (por navegador)
--------------------------------------------------------------- */
const STORE_KEY = "onde-tocar:v1"

interface Tally { hits: number; streak: number; seen: number }
interface Saved { cfg?: Config; score?: Tally }

const EMPTY_TALLY: Tally = { hits: 0, streak: 0, seen: 0 }

function isConfig(c: unknown): c is Config {
  if (!c || typeof c !== "object") return false
  const x = c as Config
  return [0, 1, 2].includes(x.acc) && [0, 2, 4].includes(x.keys) && [0, 1].includes(x.range) &&
    [0, 1, 2].includes(x.leaps) && [0, 3, 6].includes(x.time) && ["names", "digits", "none"].includes(x.digits) &&
    Array.isArray(x.strings) && x.strings.length === 4 && x.strings.some(Boolean) &&
    (LENGTHS as readonly number[]).includes(x.length)
}

function loadSaved(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as Saved
    // ajustes salvos antes de existir o tamanho da partitura: assume a pequena
    const cfg = raw.cfg && typeof raw.cfg === "object" ? { length: 8, ...(raw.cfg as Partial<Config>) } : undefined
    return { cfg: isConfig(cfg) ? cfg : undefined, score: raw.score }
  } catch {
    return {}
  }
}

/* ---------------------------------------------------------------
   Rodada — reducer puro; o sorteio (aleatório) chega pronto na ação
--------------------------------------------------------------- */
interface State {
  cfg: Config
  round: ReadScore
  idx: number
  fb: Feedback | null
  answers: (Feedback | undefined)[]
  tally: Tally
  heard: boolean   // ouviu a nota antes de responder → não pontua
  left: number     // ms restantes (modo cronometrado)
}

type Action =
  | { type: "config"; cfg: Config; round: ReadScore }
  | { type: "newRound"; round: ReadScore }
  | { type: "next" }
  | { type: "tap"; si: number; ci: number }
  | { type: "tick" }
  | { type: "heard" }

const fresh = (cfg: Config) => ({ idx: 0, fb: null, answers: [], heard: false, left: cfg.time * 1000 })

function reducer(st: State, a: Action): State {
  const done = st.idx >= st.round.notes.length
  switch (a.type) {
    case "config":
      return { ...st, ...fresh(a.cfg), cfg: a.cfg, round: a.round }
    case "newRound":
      return { ...st, ...fresh(st.cfg), round: a.round }
    case "next":
      return { ...st, idx: st.idx + 1, fb: null, heard: false, left: st.cfg.time * 1000 }
    case "heard":
      return st.fb || done ? st : { ...st, heard: true }
    case "tap": {
      if (st.fb || done || !st.cfg.strings[a.si]) return st
      const m = OPEN_MIDI[a.si] + a.ci
      const ok = m === st.round.notes[st.idx].midi
      const scored = ok && !st.heard
      const fb: Feedback = { ok, si: a.si, ci: a.ci, m }
      const answers = st.answers.slice()
      answers[st.idx] = fb
      const t = st.tally
      return {
        ...st, fb, answers,
        tally: { hits: t.hits + (scored ? 1 : 0), streak: scored ? t.streak + 1 : 0, seen: t.seen + 1 },
      }
    }
    case "tick": {
      if (!st.cfg.time || st.fb || done) return st
      const left = st.left - TICK_MS
      if (left > 0) return { ...st, left }
      const fb: Feedback = { ok: false, si: -1, ci: -1, m: null, timeout: true }
      const answers = st.answers.slice()
      answers[st.idx] = fb
      return { ...st, left: 0, fb, answers, tally: { ...st.tally, streak: 0, seen: st.tally.seen + 1 } }
    }
  }
}

function init(saved: Saved): State {
  const cfg = saved.cfg ?? cloneConfig(PRESETS.ini)
  return { cfg, round: generate(cfg), tally: saved.score ?? EMPTY_TALLY, ...fresh(cfg) }
}

/* ---------------------------------------------------------------
   Grupos do painel de ajustes
--------------------------------------------------------------- */
type SingleKey = "length" | "acc" | "keys" | "range" | "leaps" | "time" | "digits"
const SINGLE_GROUPS: { id: SingleKey; values: Config[SingleKey][] }[] = [
  { id: "length", values: [...LENGTHS] },
  { id: "acc", values: [0, 1, 2] },
  { id: "keys", values: [0, 2, 4] },
  { id: "range", values: [0, 1] },
  { id: "leaps", values: [0, 1, 2] },
  { id: "time", values: [0, 6, 3] },
  { id: "digits", values: ["names", "digits", "none"] },
]

/* ---------------------------------------------------------------
   Página do modo
--------------------------------------------------------------- */
export default function OndeTocarGame({ t, help }: { t: OTDict; help: Dictionary["armaduras"] }) {
  const { letters } = useViolinoText()
  const nn = useMemo(() => makeNoteNames(letters), [letters])
  const [st, dispatch] = useReducer(reducer, undefined, () => init(loadSaved()))
  const [panelOpen, setPanelOpen] = useState(false)
  const { cfg, round, idx, fb } = st
  const total = round.notes.length
  const done = idx >= total
  const cur: ReadNote | null = done ? null : round.notes[idx]
  const on = cfg.strings
  const preset: PresetId = presetOf(cfg)

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ cfg, score: st.tally }))
    } catch { /* storage indisponível — segue sem persistir */ }
  }, [cfg, st.tally])

  // acertou: avança sozinho
  useEffect(() => {
    if (!fb?.ok) return
    const id = setTimeout(() => dispatch({ type: "next" }), AUTO_ADVANCE_MS)
    return () => clearTimeout(id)
  }, [fb])

  // cronômetro por nota
  const timed = cfg.time > 0 && !done
  const running = timed && !fb
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => dispatch({ type: "tick" }), TICK_MS)
    return () => clearInterval(id)
  }, [running, idx])

  /* ---- textos derivados ---- */
  const stringName = (si: number) => nn.note(STRINGS[si].l)
  const noteName = (n: ReadNote, alt: Alt = n.alt) => nn.note(n.l, alt)
  function placeText(m: number) {
    const p = bestPlace(m, on)
    return p ? fmt(t.place, { string: stringName(p.si), pos: t.cols_long[p.ci] }) : t.place_none
  }
  function shortPlace(m: number) {
    const p = bestPlace(m, on)
    return p ? fmt(t.short_place, { string: stringName(p.si), col: t.cols[p.ci] }) : ""
  }
  const tn = tonic(round.key)
  const keyLabel = fmt(t.key_name, { note: nn.note(tn.l, tn.alt) })
  const keyList = accLetters(round.key).map((l) => nn.note(l, round.key > 0 ? 1 : -1)).join(" ")
  const keyBadge = fmt(t.key_badge, { key: keyLabel, list: keyList || t.no_accidentals })

  function tagOf(n: ReadNote) {
    if (n.why === "written" && n.written !== null) return fmt(t.tags.written, { acc: ACC[n.written] })
    if (n.why === "inherit") return fmt(t.tags.inherit, { acc: ACC[n.alt] })
    if (n.why === "reset") return t.tags.reset
    return ""
  }

  function feedbackText(n: ReadNote, f: Feedback) {
    const m = t.msg
    const note = noteName(n)
    const place = placeText(n.midi)
    if (f.timeout) return fmt(m.timeout, { note, place })
    if (f.ok) {
      const extra = n.why === "written" && n.written !== null ? fmt(m.ok_written, { acc: ACC[n.written] })
        : n.why === "inherit" ? m.ok_inherit
          : n.why === "reset" ? m.ok_reset : ""
      return [fmt(m.ok, { note, place }), extra, st.heard ? m.heard : ""].filter(Boolean).join(" ")
    }
    const keyM = midiOfStep(n.s, n.keyA)
    if (n.why === "written" && n.written !== null && f.m === keyM)
      return fmt(m.bad_written, { acc: ACC[n.written], note, keyNote: noteName(n, n.keyA) })
    if (n.why === "inherit" && f.m === keyM) return fmt(m.bad_inherit, { acc: ACC[n.alt], note })
    if (n.why === "reset" && n.prevA !== undefined && f.m === midiOfStep(n.s, n.prevA)) return fmt(m.bad_reset, { note })
    if (!n.why && n.keyA !== 0 && f.m === midiOfStep(n.s, 0)) return fmt(m.bad_key, { note, place })
    return fmt(m.bad, { played: nn.pitch(f.m ?? n.midi, round.key), note, place })
  }

  /* ---- ações ---- */
  function setConfig(next: Config) {
    dispatch({ type: "config", cfg: next, round: generate(next) })
  }
  function setGroup(id: SingleKey, v: Config[SingleKey]) {
    if (cfg[id] === v) return
    setConfig({ ...cloneConfig(cfg), [id]: v } as Config)
  }
  function toggleString(si: number) {
    const strings = [...cfg.strings] as Config["strings"]
    strings[si] = !strings[si]
    if (!strings.some(Boolean)) return // pelo menos uma corda
    setConfig({ ...cloneConfig(cfg), strings })
  }
  function tap(si: number, ci: number) {
    playMidi(OPEN_MIDI[si] + ci)
    dispatch({ type: "tap", si, ci })
  }
  async function hear() {
    if (!cur) return
    if (!fb) dispatch({ type: "heard" })
    if (getSoundStatus() !== "on" && !(await turnSoundOn())) return
    playMidi(cur.midi)
  }
  const newRound = () => dispatch({ type: "newRound", round: generate(cfg) })
  const primary = () => (done ? newRound() : dispatch({ type: "next" }))

  /* ---- render ---- */
  const staffNotes: StaffNote[] = round.notes.map((n, i) => {
    const a = st.answers[i]
    return {
      note: n,
      state: a ? (a.ok ? "ok" : "bad") : i === idx ? "current" : "idle",
      name: a ? noteName(n) : undefined,
      label: a ? shortPlace(n.midi) : undefined,
      tag: a ? tagOf(n) : undefined,
    }
  })

  const hitsRound = st.answers.filter((a) => a?.ok).length
  let msg = t.msg.prompt
  let msgKind = "is-help"
  if (done) {
    msg = fmt(t.msg.done, { n: hitsRound, total })
    msgKind = hitsRound === total ? "is-perfect" : "is-partial"
  } else if (fb && cur) {
    msg = feedbackText(cur, fb)
    msgKind = fb.ok ? "is-perfect" : "is-bad"
  }

  const showRule = !!(fb && !fb.ok && cur?.why)
  const ruleWhy = cur?.why === "written" ? t.rule.why_written
    : cur?.why === "inherit" ? t.rule.why_inherit
      : cur?.why === "reset" ? t.rule.why_reset : ""
  const primaryLabel = done ? t.new_round : fb && !fb.ok ? t.next_note : t.skip_note
  const lineCount = Math.ceil(total / NOTES_PER_LINE)
  const lineNo = Math.min(Math.floor(idx / NOTES_PER_LINE), lineCount - 1) + 1
  const timePct = cfg.time ? Math.round((st.left / (cfg.time * 1000)) * 100) : 0

  return (
    <main className="vl-main ot">
      <header className="vl-head">
        <div>
          <span className="eyebrow"><Lozenge /> {t.eyebrow}</span>
          <h1 className="vl-title">{t.title}</h1>
          <p className="vl-sub">{t.subtitle}</p>
        </div>
        <ScoreBoard
          label={t.score.label}
          items={[
            { label: t.score.hits, value: st.tally.hits },
            { label: t.score.streak, value: st.tally.streak },
            { label: t.score.seen, value: st.tally.seen },
          ]}
        />
      </header>

      <div className="vl-toolbar">
        <div className="vl-settings">
          <Seg<PresetId>
            label={t.presets.label}
            value={preset}
            // o perfil não mexe no tamanho da partitura
            onChange={(v) => v !== "custom" && setConfig({ ...cloneConfig(PRESETS[v]), length: cfg.length })}
            options={[
              { v: "ini", l: t.presets.ini },
              { v: "mid", l: t.presets.mid },
              { v: "adv", l: t.presets.adv },
              { v: "custom", l: t.presets.custom, disabled: true },
            ]}
          />
        </div>
        <div className="vl-tools">
          <button
            type="button"
            className={"vl-btn vl-btn-ghost vl-nowrap" + (panelOpen ? " on" : "")}
            onClick={() => setPanelOpen(!panelOpen)}
            aria-expanded={panelOpen}
            aria-controls="ot-panel"
          >
            <SlidersHorizontal size={16} /> {panelOpen ? t.panel_close : t.panel_open}
          </button>
          <SoundButton />
          <HelpButton t={help} />
        </div>
      </div>

      {panelOpen && (
        <div className="ot-panel" id="ot-panel">
          {SINGLE_GROUPS.map(({ id, values }) => {
            const g = t.groups[id]
            const at = Math.max(0, values.indexOf(cfg[id]))
            return (
              <div key={id} className="ot-group">
                <Seg
                  label={g.label}
                  value={cfg[id]}
                  onChange={(v) => setGroup(id, v)}
                  options={values.map((v, i) => ({ v, l: g.opts[i] }))}
                />
                <span className="ot-hint">{g.hints[Math.min(at, g.hints.length - 1)]}</span>
              </div>
            )
          })}
          <div className="ot-group">
            <div className="vl-seg" role="group" aria-label={t.groups.strings.label}>
              <span className="vl-seg-l">{t.groups.strings.label}</span>
              <div className="vl-seg-o">
                {STRINGS.map((s, si) => (
                  <button
                    key={si}
                    type="button"
                    className={"vl-tab" + (cfg.strings[si] ? " active" : "")}
                    aria-pressed={cfg.strings[si]}
                    onClick={() => toggleString(si)}
                  >
                    {nn.note(s.l)}
                  </button>
                ))}
              </div>
            </div>
            <span className="ot-hint">{t.groups.strings.hints[0]}</span>
          </div>
        </div>
      )}

      <section className="vl-folio ot-folio">
        <span className="vl-corner tl" /><span className="vl-corner tr" />
        <span className="vl-corner bl" /><span className="vl-corner br" />

        <div className="ot-qhead">
          <h2 className="vl-q">{t.question}</h2>
          <div className="ot-qmeta">
            <span className="ot-badge">{keyBadge}</span>
            <span className="ot-progress">{fmt(t.progress, { i: done ? total : idx + 1, total })}</span>
            {lineCount > 1 && <span className="ot-line">{fmt(t.line_of, { i: lineNo, n: lineCount })}</span>}
            <button type="button" className="ot-mini-btn" onClick={newRound} title={t.new_score_title}>
              <RotateCcw size={14} /> {t.new_score}
            </button>
          </div>
        </div>

        <NoteStaff
          keyN={round.key}
          notes={staffNotes}
          cursor={done ? null : idx}
          cursorState={fb ? (fb.ok ? "ok" : "bad") : "idle"}
          ariaLabel={fmt(t.staff_aria, { key: keyLabel, i: Math.min(idx + 1, total), total })}
        />

        {timed && (
          <div className="ot-timer">
            <span>{fb ? "—" : `${(st.left / 1000).toFixed(1)} s`}</span>
            <div className="ot-timer-bar">
              <div className={timePct < 30 ? "is-low" : ""} style={{ width: `${fb ? 0 : timePct}%` }} />
            </div>
          </div>
        )}

        <div className="vl-actions ot-actions">
          <p className={"vl-msg " + msgKind} aria-live="polite">{msg}</p>
          <div className="vl-actions-btns">
            <button type="button" className="vl-btn vl-btn-ghost" onClick={hear} disabled={done} title={t.hear_title}>
              <Music size={15} /> {t.hear}
            </button>
            <button type="button" className="vl-btn vl-btn-primary" onClick={primary}>{primaryLabel}</button>
          </div>
        </div>

        <Fingerboard t={t} nn={nn} cfg={cfg} keyN={round.key} cur={cur} fb={fb} onTap={tap} />

        {showRule && cur && (
          <div className="ot-rule">
            <div>
              <span>{t.rule.by_key}</span>
              <p>{noteName(cur, cur.keyA)} → {placeText(midiOfStep(cur.s, cur.keyA))}</p>
            </div>
            <div>
              <span>{t.rule.this_note}</span>
              <p>{noteName(cur)} → {placeText(cur.midi)}</p>
            </div>
            <div>
              <span>{t.rule.why}</span>
              <p className="is-muted">{ruleWhy}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
