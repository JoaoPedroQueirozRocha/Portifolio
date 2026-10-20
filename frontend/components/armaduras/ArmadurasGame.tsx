"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, Volume2, VolumeX } from "lucide-react"
import {
  STRINGS, TOTAL_ITEMS, makeNoteNames, midiOf, options, pickKey, scale, stringAnswer,
  type Alt, type Mode,
} from "@/lib/armaduras"
import { enableViolinSound, playMidi } from "@/lib/violinSound"
import KeyStaff from "./KeyStaff"
import StringRow from "./StringRow"
import Explanation from "./Explanation"
import HelpBalloon, { HalfRuler } from "./HelpBalloon"
import { ArmTextContext, buildKeyName, fmt, Lozenge, type ArmDict } from "./text"

/* ---------------------------------------------------------------
   Estado persistido (por navegador)
--------------------------------------------------------------- */
const STORE_KEY = "armaduras:v1"

interface Settings {
  range: 2 | 3 | 4
  pos: 1 | 2 | 3
  mode: "major" | "both"
}
interface Score { hits: number; streak: number; rounds: number }
interface Saved { settings?: Settings; halves?: boolean; score?: Score }

const DEFAULT_SETTINGS: Settings = { range: 2, pos: 1, mode: "major" }
const EMPTY_SCORE: Score = { hits: 0, streak: 0, rounds: 0 }

function loadSaved(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as Saved
    const s = raw.settings
    const validSettings = s && [2, 3, 4].includes(s.range) && [1, 2, 3].includes(s.pos) && ["major", "both"].includes(s.mode)
    return { ...raw, settings: validSettings ? s : undefined }
  } catch {
    return {}
  }
}

/* ---------------------------------------------------------------
   Rodada
--------------------------------------------------------------- */
interface Round { n: number; mode: Mode; opts: number[] }

function newRound(settings: Settings, prevN: number | null): Round {
  const n = pickKey(settings.range, prevN)
  const mode: Mode = settings.mode === "both" && Math.random() < 0.5 ? "minor" : "major"
  return { n, mode, opts: options(n, settings.range) }
}

const emptyAlts = (): Alt[][] => STRINGS.map(() => [0, 0, 0, 0])

function scrollToEl(el: HTMLElement | null) {
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" })
}

/* ---------------------------------------------------------------
   Seletor segmentado
--------------------------------------------------------------- */
function Seg<T extends string | number>({ label, value, options, onChange }: {
  label: string
  value: T
  options: { v: T; l: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="arm-seg" role="group" aria-label={label}>
      <span className="arm-seg-l">{label}</span>
      <div className="arm-seg-o">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            className={"arm-tab" + (value === o.v ? " active" : "")}
            aria-pressed={value === o.v}
            onClick={() => value !== o.v && onChange(o.v)}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------
   Página do jogo
--------------------------------------------------------------- */
export default function ArmadurasGame({ t }: { t: ArmDict }) {
  const text = useMemo(() => {
    const nn = makeNoteNames(t.letters)
    return { t, nn, keyName: buildKeyName(t, nn) }
  }, [t])
  const { keyName, nn } = text

  const [saved] = useState(loadSaved)
  const [settings, setSettings] = useState<Settings>(saved.settings ?? DEFAULT_SETTINGS)
  const [halves, setHalves] = useState(!!saved.halves)
  const [score, setScore] = useState<Score>(saved.score ?? EMPTY_SCORE)
  const [round, setRound] = useState(() => newRound(saved.settings ?? DEFAULT_SETTINGS, null))
  const [pick, setPick] = useState<number | null>(null)
  const [alts, setAlts] = useState(emptyAlts)
  const [result, setResult] = useState<{ ok: number; perfect: boolean } | null>(null)
  const [explainUsed, setExplainUsed] = useState(false)
  const [explainOpen, setExplainOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  // som começa sempre desligado (não persiste entre visitas)
  const [sound, setSound] = useState<"off" | "loading" | "on" | "error">("off")
  const topRef = useRef<HTMLDivElement>(null)
  const explainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ settings, halves, score }))
    } catch { /* storage indisponível — segue sem persistir */ }
  }, [settings, halves, score])

  const p = settings.pos
  const checked = !!result
  const answers = useMemo(() => STRINGS.map((s) => stringAnswer(s, p, round.n)), [round, p])

  function reset(nextSettings: Settings, prevN: number | null) {
    setRound(newRound(nextSettings, prevN))
    setPick(null)
    setAlts(emptyAlts())
    setResult(null)
    setExplainUsed(false)
    setExplainOpen(false)
  }

  function changeSetting<K extends keyof Settings>(k: K, v: Settings[K]) {
    const next = { ...settings, [k]: v }
    setSettings(next)
    reset(next, round.n)
  }

  function setAlt(si: number, k: number, v: Alt) {
    setAlts((st) => st.map((row, i) => (i === si ? row.map((a, j) => (j === k ? v : a)) : row)))
    if (sound === "on") playMidi(midiOf(STRINGS[si], p, k + 1, v))
  }

  async function toggleSound() {
    if (sound === "on") return setSound("off")
    if (sound === "loading") return
    setSound("loading")
    try {
      await enableViolinSound()
      setSound("on")
    } catch {
      setSound("error")
    }
  }

  function check() {
    let ok = pick === round.n ? 1 : 0
    answers.forEach((ans, si) => alts[si].forEach((a, k) => { if (a === ans.alts[k]) ok++ }))
    const perfect = ok === TOTAL_ITEMS
    const scored = perfect && !explainUsed
    setResult({ ok, perfect })
    setScore((sc) => ({ hits: sc.hits + (scored ? 1 : 0), streak: scored ? sc.streak + 1 : 0, rounds: sc.rounds + 1 }))
    if (!perfect) setExplainOpen(true)
  }

  function openExplain() {
    if (!checked) setExplainUsed(true)
    setExplainOpen(true)
    setTimeout(() => scrollToEl(explainRef.current), 60)
  }

  function next() {
    reset(settings, round.n)
    scrollToEl(topRef.current)
  }

  const closeHelp = useCallback(() => setHelpOpen(false), [])

  const total = TOTAL_ITEMS
  const msg = !result
    ? null
    : result.perfect
      ? fmt(explainUsed ? t.msg.perfect_help : t.msg.perfect, { total })
      : fmt(t.msg.partial, { ok: result.ok, total })
  const msgKind = !result ? "" : result.perfect ? (explainUsed ? "is-help" : "is-perfect") : "is-partial"
  const skipLabel = checked ? t.actions.next : t.actions.skip

  return (
    <ArmTextContext.Provider value={text}>
      <main className="content-container arm">
        <header className="arm-head">
          <div>
            <span className="eyebrow"><Lozenge /> {t.eyebrow}</span>
            <h1 className="arm-title">{t.title}</h1>
            <p className="arm-sub">{t.subtitle}</p>
          </div>
          <dl className="arm-score" aria-label={t.score.label}>
            <div><dt>{t.score.hits}</dt><dd>{score.hits}</dd></div>
            <div><dt>{t.score.streak}</dt><dd>{score.streak}</dd></div>
            <div><dt>{t.score.rounds}</dt><dd>{score.rounds}</dd></div>
          </dl>
        </header>

        <div className="arm-toolbar" ref={topRef}>
          <div className="arm-settings">
            <Seg
              label={t.settings.range}
              value={settings.range}
              onChange={(v) => changeSetting("range", v)}
              options={([2, 3, 4] as const).map((v) => ({ v, l: fmt(t.settings.range_opt, { n: v }) }))}
            />
            <Seg
              label={t.settings.pos}
              value={settings.pos}
              onChange={(v) => changeSetting("pos", v)}
              options={([1, 2, 3] as const).map((v) => ({ v, l: fmt(t.settings.pos_opt, { n: v }) }))}
            />
            <Seg
              label={t.settings.mode}
              value={settings.mode}
              onChange={(v) => changeSetting("mode", v)}
              options={[
                { v: "major" as const, l: t.settings.mode_major },
                { v: "both" as const, l: t.settings.mode_both },
              ]}
            />
          </div>
          <div className="arm-tools">
            <button type="button" className="arm-btn arm-btn-ghost arm-nowrap" onClick={next} title={checked ? undefined : t.actions.skip_title}>
              {skipLabel} <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className={"arm-btn arm-btn-ghost arm-nowrap arm-half-btn" + (halves ? " on" : "")}
              onClick={() => setHalves(!halves)}
              aria-pressed={halves}
            >
              {halves ? t.actions.hide_halves : t.actions.show_halves}
            </button>
            <button
              type="button"
              className={"arm-btn arm-btn-ghost arm-nowrap arm-sound-btn" + (sound === "on" ? " on" : "")}
              onClick={toggleSound}
              aria-pressed={sound === "on"}
              aria-busy={sound === "loading"}
              title={sound === "error" ? t.sound.error : undefined}
            >
              {sound === "on" ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {t.sound[sound]}
            </button>
            <div className="arm-help-wrap">
              <button
                type="button"
                className={"arm-help-btn" + (helpOpen ? " on" : "")}
                onClick={() => setHelpOpen(!helpOpen)}
                aria-label={t.actions.help}
                aria-expanded={helpOpen}
              >
                ?
              </button>
              {helpOpen && <HelpBalloon onClose={closeHelp} />}
            </div>
          </div>
        </div>

        <section className="arm-folio">
          <span className="arm-corner tl" /><span className="arm-corner tr" />
          <span className="arm-corner bl" /><span className="arm-corner br" />

          <div className="arm-q1">
            <div className="arm-plate"><KeyStaff n={round.n} /></div>
            <div className="arm-q1-body">
              <h2 className="arm-q">{fmt(t.q1, { mode: t.modes[round.mode] })}</h2>
              <div className="arm-opts">
                {round.opts.map((o) => {
                  let st = ""
                  if (checked) {
                    if (o === round.n) st = pick === o ? " is-ok" : " is-fix"
                    else if (o === pick) st = " is-bad"
                  }
                  return (
                    <button
                      key={o}
                      type="button"
                      className={"arm-opt" + (pick === o ? " active" : "") + st}
                      disabled={checked}
                      aria-pressed={pick === o}
                      onClick={() => setPick(o)}
                    >
                      {keyName(o, round.mode)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="arm-q2">
            <div className="arm-q2-head">
              <h2 className="arm-q">{t.q2}</h2>
              <p className="arm-instr">{t.instructions}</p>
              {halves && <HalfRuler />}
              {checked && (
                <div className="arm-scale-fix">
                  <span className="arm-sfix-l">{fmt(t.scale_of, { key: keyName(round.n, "major") })}</span>
                  <div className="arm-scale">
                    {scale(round.n).map((x, i) => (
                      <span key={i} className={"arm-scale-n" + (x.altered ? " is-alt" : "")}>
                        <i>{i + 1}</i>{nn.note(x.l, x.alt)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="arm-strings">
              {STRINGS.map((s, si) => (
                <StringRow
                  key={`${s.l}-${round.n}-${p}`}
                  s={s}
                  p={p}
                  n={round.n}
                  alts={alts[si]}
                  onSetAlt={(k, v) => setAlt(si, k, v)}
                  checked={checked}
                  ans={answers[si]}
                  showHalves={halves}
                />
              ))}
            </div>
          </div>

          <div className={"arm-actions" + (checked ? " is-checked" : "")}>
            {msg && <p className={"arm-msg " + msgKind}>{msg}</p>}
            {explainUsed && !checked && <p className="arm-msg is-help">{t.msg.help_used}</p>}
            <div className="arm-actions-btns">
              {!checked ? (
                <button
                  type="button"
                  className="arm-btn arm-btn-primary"
                  onClick={check}
                  disabled={pick === null}
                  title={pick === null ? t.actions.check_title : undefined}
                >
                  {t.actions.check}
                </button>
              ) : (
                <button type="button" className="arm-btn arm-btn-primary" onClick={next}>
                  {t.actions.next} <ArrowRight size={15} />
                </button>
              )}
              {!explainOpen && (
                <button type="button" className="arm-btn arm-btn-ghost" onClick={openExplain}>{t.actions.explain}</button>
              )}
              {!checked && (
                <button type="button" className="arm-btn arm-btn-ghost" onClick={next} title={t.actions.skip_title}>
                  {t.actions.skip} <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </section>

        <div ref={explainRef}>
          {explainOpen && <Explanation n={round.n} mode={round.mode} p={p} onClose={() => setExplainOpen(false)} />}
        </div>
      </main>
    </ArmTextContext.Provider>
  )
}
