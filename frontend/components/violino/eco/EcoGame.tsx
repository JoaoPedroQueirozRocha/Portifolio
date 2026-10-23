"use client"

import { useEffect, useEffectEvent, useMemo, useReducer, useState } from "react"
import { LocateFixed, Mic, Music, RotateCcw, SlidersHorizontal } from "lucide-react"
import { makeNoteNames, tonic } from "@/lib/armaduras"
import { OPEN_MIDI } from "@/lib/leitura"
import { turnSoundOn } from "@/lib/violinSound"
import { ScoreBoard, Seg, SoundButton, useSoundStatus } from "../shared/Controls"
import { fmt, Lozenge, useViolinoText } from "../shared/text"
import type { EcoDict } from "./i18n"
import {
  KEYS, PRESETS, average, contextNotes, currentItem, initialState, makeRound, parseSaved, presetOf, reducer,
  tapOutcome, trainingRound, type Config, type PresetId,
} from "./logic"
import { createText } from "./text"
import { useSequencer } from "./useSequencer"
import EcoBoard from "./EcoBoard"
import Gate from "./Gate"
import MiniStaff from "./MiniStaff"
import Summary from "./Summary"

/* ---------------------------------------------------------------
   Estado salvo no navegador: ajustes + placar
--------------------------------------------------------------- */
const STORE_KEY = "eco:v1"

function loadSaved() {
  try {
    return parseSaved(JSON.parse(localStorage.getItem(STORE_KEY) ?? "null"))
  } catch {
    return undefined
  }
}

const init = () => initialState(loadSaved(), makeRound)

/** Grupos do painel de ajustes, na ordem em que aparecem */
type GroupId = keyof Config
const GROUPS: { id: GroupId; values: readonly (string | number)[] }[] = [
  { id: "dist", values: ["g2", "g5", "any"] },
  { id: "notes", values: ["escala", "crom"] },
  { id: "key", values: ["rand", ...KEYS] },
  { id: "ctx", values: ["tonica", "trecho", "nenhum"] },
  { id: "hint", values: [1, 0] },
  { id: "tries", values: [3, 0] },
  { id: "staff", values: [0, 1] },
]

export default function EcoGame({ t }: { t: EcoDict }) {
  const { letters } = useViolinoText()
  const nn = useMemo(() => makeNoteNames(letters), [letters])
  const tx = useMemo(() => createText(t, nn), [t, nn])
  const [st, dispatch] = useReducer(reducer, undefined, init)
  const [panelOpen, setPanelOpen] = useState(false)
  const { playing, flash, sequence, touch, later, stop } = useSequencer()
  const soundStatus = useSoundStatus()
  const soundOn = soundStatus === "on"

  const { cfg, phase } = st
  const key = st.round.key
  const it = currentItem(st)
  const total = st.round.items.length
  const isSum = phase === "summary"

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ cfg: st.cfg, tally: st.tally }))
    } catch { /* storage indisponível — segue sem persistir */ }
  }, [st.cfg, st.tally])

  // sem som, nada fica agendado
  useEffect(() => {
    if (!soundOn) stop()
  }, [soundOn, stop])

  /* ---- ações ---- */
  const playTarget = (to: number) => sequence("alvo", [to], 900)

  /** Contexto → (pausa) → procura, tocando o alvo */
  function begin() {
    const ctx = contextNotes(cfg, key)
    sequence("ctx", ctx, 420, () => {
      later(() => {
        dispatch({ type: "begin" })
        playTarget(it.to)
      }, ctx.length ? 350 : 0)
    })
  }

  function hearTarget() {
    if (!soundOn || isSum) return
    if (phase === "ready") begin()
    else playTarget(it.to)
  }

  /** A nota onde a mão está: serve de régua para comparar com o alvo */
  function hearHere() {
    if (!soundOn || isSum) return
    sequence("atual", [it.from], 900)
  }

  function hearContext() {
    if (!soundOn || isSum || cfg.ctx === "nenhum") return
    sequence("ctx", contextNotes(cfg, key), 420)
  }

  function tap(si: number, ci: number) {
    const outcome = tapOutcome(st, si, ci)
    if (outcome === "ignore") return
    touch(si, ci, OPEN_MIDI[si] + ci)
    dispatch({ type: "tap", si, ci })
    // depois da última tentativa, o jogo toca a resposta
    if (outcome === "reveal") later(() => playTarget(it.to), 800)
  }

  function next() {
    if (phase !== "hit" && phase !== "reveal") return
    const upcoming = st.round.items[st.idx + 1]
    stop()
    dispatch({ type: "next" })
    if (upcoming) later(() => playTarget(upcoming.to), 250)
  }

  function setConfig(next: Config) {
    stop()
    dispatch({ type: "config", cfg: next, round: makeRound(next) })
  }

  function setGroup(id: GroupId, v: string | number) {
    if (cfg[id] === v) return
    setConfig({ ...cfg, [id]: v } as Config)
  }

  function newRound() {
    stop()
    dispatch({ type: "round", round: makeRound(cfg) })
  }

  function train(hard: number[]) {
    if (!hard.length) return
    stop()
    dispatch({ type: "round", round: trainingRound(st, hard) })
  }

  // barra de espaço = ouvir o alvo (fora de botões e campos, que usam o espaço para si)
  const onSpace = useEffectEvent((e: KeyboardEvent) => {
    if ((e.target as Element | null)?.closest("button, a, input, select, textarea, [role='button']")) return
    e.preventDefault()
    hearTarget()
  })
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === "Space") onSpace(e) }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [])

  /* ---- textos ---- */
  const msg = tx.message(st)
  const live = tx.live(st, playing)
  const triesView = tx.triesView(st)
  const preset: PresetId = presetOf(cfg)
  const keyOpts = [t.groups.key.rand, ...KEYS.map((n) => nn.note(tonic(n).l, tonic(n).alt))]
  const groupLabels = (id: GroupId): string[] =>
    id === "key" ? keyOpts : ((t.groups[id] as { opts: string[] }).opts)
  const stageTitle = isSum ? t.stage.summary : phase === "ready" ? t.stage.ready : t.stage.search
  const primaryLabel = msg.primary === "listen" ? t.buttons.listen : msg.primary === "summary" ? t.buttons.summary : t.buttons.next
  const cantContext = isSum || cfg.ctx === "nenhum"

  return (
    <main className="vl-main ec">
      <header className="vl-head">
        <div>
          <span className="eyebrow"><Lozenge /> {t.eyebrow}</span>
          <h1 className="vl-title">{t.title}</h1>
          <p className="vl-sub">{t.subtitle}</p>
        </div>
        <ScoreBoard
          label={t.score.label}
          items={[
            { label: t.score.ok, value: st.tally.ok },
            { label: t.score.streak, value: st.tally.streak },
            { label: t.score.tries, value: tx.avg(average(st.tally.sum, st.tally.done)) },
          ]}
        />
      </header>

      <div className="vl-toolbar">
        <div className="vl-settings">
          <Seg<PresetId>
            label={t.presets.label}
            value={preset}
            onChange={(v) => v !== "custom" && setConfig({ ...PRESETS[v] })}
            options={[
              { v: "ini", l: t.presets.ini },
              { v: "med", l: t.presets.mid },
              { v: "adv", l: t.presets.adv },
              { v: "custom", l: t.presets.custom, disabled: true },
            ]}
          />
        </div>
        <div className="vl-tools">
          <button type="button" className="vl-btn vl-btn-ghost vl-nowrap ec-mic" disabled title={t.mic.title}>
            <Mic size={16} /> {t.mic.label} <span className="ec-soon">{t.mic.soon}</span>
          </button>
          <button
            type="button"
            className={"vl-btn vl-btn-ghost vl-nowrap" + (panelOpen ? " on" : "")}
            onClick={() => setPanelOpen(!panelOpen)}
            aria-expanded={panelOpen}
            aria-controls="ec-panel"
          >
            <SlidersHorizontal size={16} /> {panelOpen ? t.panel_close : t.panel_open}
          </button>
          <SoundButton />
        </div>
      </div>

      {panelOpen && (
        <div className="ec-panel" id="ec-panel">
          {GROUPS.map(({ id, values }) => {
            const g = t.groups[id]
            const labels = groupLabels(id)
            const at = Math.max(0, values.indexOf(cfg[id]))
            return (
              <div key={id} className="ec-group">
                <Seg
                  label={g.label}
                  value={cfg[id]}
                  onChange={(v) => setGroup(id, v)}
                  options={values.map((v, i) => ({ v, l: labels[i] }))}
                />
                <span className="ec-hint">{g.hints[Math.min(at, g.hints.length - 1)]}</span>
              </div>
            )
          })}
        </div>
      )}

      <section className="vl-folio ec-folio">
        <span className="vl-corner tl" /><span className="vl-corner tr" />
        <span className="vl-corner bl" /><span className="vl-corner br" />

        {!soundOn ? (
          <Gate t={t} status={soundStatus} onEnable={() => void turnSoundOn()} />
        ) : (
          <>
            <div className="ec-stagehead">
              <h2 className="vl-q">{stageTitle}</h2>
              <div className="ec-qmeta">
                <span className="ec-badge">{tx.keyBadge(key)}</span>
                <span className="ec-progress">{fmt(t.progress, { i: isSum ? total : st.idx + 1, n: total })}</span>
              </div>
            </div>

            <div className={"ec-live" + (playing ? " is-on" : "")} role="status" aria-live="polite">
              <div className="ec-live-main">
                <span className="ec-bars" aria-hidden="true"><i /><i /><i /><i /></span>
                <span className="ec-live-text">
                  <span className="ec-live-head">{live.head}</span>
                  <span className="ec-live-sub">{live.text}</span>
                </span>
              </div>
              <div className="ec-live-tools">
                {!isSum && phase !== "ready" && (
                  <span className="ec-tries" aria-label={triesView.aria}>
                    {triesView.marks.map((k, i) => <i key={i} className={"ec-diamond is-" + k} />)}
                    <span>{triesView.text}</span>
                  </span>
                )}
                <button type="button" className="vl-btn vl-btn-ghost" disabled={cantContext} onClick={hearContext}>
                  <RotateCcw size={15} /> {t.buttons.hear_context}
                </button>
                <button type="button" className="vl-btn vl-btn-ghost" disabled={isSum} onClick={hearHere}>
                  <LocateFixed size={15} /> {t.buttons.hear_here}
                </button>
                <button type="button" className="vl-btn vl-btn-ghost ec-target" disabled={isSum} onClick={hearTarget}>
                  <Music size={15} /> {t.buttons.hear_target} <kbd>{t.buttons.space}</kbd>
                </button>
              </div>
            </div>

            {isSum ? (
              <Summary t={t} tx={tx} st={st} onTrain={train} onNew={newRound} />
            ) : (
              <>
                <div className="ec-msgrow">
                  <div className="ec-msg">
                    <span className={"ec-msg-icon is-" + msg.tone} aria-hidden="true">{msg.icon}</span>
                    <div>
                      <p className={"ec-msg-text is-" + msg.tone} aria-live="polite">{msg.text}</p>
                      {msg.sub && <span className="ec-msg-sub">{msg.sub}</span>}
                    </div>
                  </div>
                  {msg.primary && (
                    <button type="button" className="vl-btn vl-btn-primary" onClick={msg.primary === "listen" ? hearTarget : next}>
                      {primaryLabel}
                    </button>
                  )}
                </div>

                {cfg.staff ? <MiniStaff t={t} tx={tx} st={st} /> : null}

                <EcoBoard t={t} tx={tx} st={st} flash={flash} onTap={tap} />

                <div className="ec-trail">
                  <span className="ec-eyebrow">{t.trail.title}</span>
                  <div className="ec-trail-row" role="list">
                    {tx.trail(st).map((c, i) => (
                      <div key={i} role="listitem" className={"ec-trail-cell is-" + c.state}>
                        <span className="ec-trail-cap">{c.cap}</span>
                        <b>{c.name}</b>
                        <span className="ec-trail-sub">{c.sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  )
}
