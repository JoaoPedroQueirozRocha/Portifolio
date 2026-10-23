"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { Mic, Volume2, X } from "lucide-react"
import { STRINGS, practiceTargets } from "@/lib/armaduras"
import { centsBetween, createJudge, hzToMidi, midiToHz, type Verdict } from "@/lib/pitch"
import {
  getListenStatus, onFrame, setListenMuted, startListening, stopListening, subscribeListen,
} from "@/lib/violinListen"
import { playMidi, turnSoundOn } from "@/lib/violinSound"
import { Seg, useSoundStatus } from "../shared/Controls"
import PracticeBoard from "./PracticeBoard"
import { fmt, useArmText } from "./text"

/* ---------------------------------------------------------------
   Prática no violino — popup que pede nota a nota e escuta pelo
   microfone. O espelho inteiro fica à vista o tempo todo, com a nota
   pedida acesa, para a pessoa ver onde ela cai no braço.
--------------------------------------------------------------- */

const A4_OPTIONS = [440, 442] as const
const TOLERANCES = [20, 35, 50] as const

/** Cadência da leitura na tela — a análise roda bem mais rápido que isso */
const UI_MS = 70
/** Pausa depois de acertar, antes de pedir a próxima */
const NEXT_MS = 700
/** Quanto tempo o erro fica na tela antes de liberar nova tentativa */
const RETRY_MS = 1600
/** Janela em que a escuta fica pausada enquanto a referência toca */
const HEAR_MS = 1300

interface Live { hz: number; cents: number; midi: number }

export default function PracticeDialog({ n, p, onClose }: { n: number; p: number; onClose: () => void }) {
  const { t, nn, keyName } = useArmText()
  const pt = t.practice
  const ref = useRef<HTMLDialogElement>(null)
  const status = useSyncExternalStore(subscribeListen, getListenStatus, () => "off" as const)
  const soundStatus = useSoundStatus()

  const targets = useMemo(() => practiceTargets(p, n), [p, n])
  const [phase, setPhase] = useState<"intro" | "run" | "done">("intro")
  const [idx, setIdx] = useState(0)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [live, setLive] = useState<Live | null>(null)
  const [clean, setClean] = useState(0) // acertos de primeira
  const [a4, setA4] = useState<number>(A4_OPTIONS[0])
  const [tolerance, setTolerance] = useState<number>(TOLERANCES[1])
  const missed = useRef(false)

  const target = targets[Math.min(idx, targets.length - 1)]
  const total = targets.length
  /* Sem microfone não há prática: a tela de permissão volta sozinha se ele
     for perdido no meio (revogado, desconectado, aba sem permissão). */
  const intro = phase === "intro" || (status !== "on" && status !== "asking")

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  // soltar o microfone ao sair, sempre
  useEffect(() => () => stopListening(), [])

  const close = useCallback(() => {
    stopListening()
    ref.current?.close()
  }, [])

  async function askMic() {
    const st = await startListening()
    if (st === "on") {
      setPhase("run")
      setIdx(0)
      setClean(0)
      setVerdict(null)
      missed.current = false
    }
  }

  function restart() {
    setPhase("run")
    setIdx(0)
    setClean(0)
    setVerdict(null)
    setLive(null)
    missed.current = false
  }

  function skip() {
    setVerdict(null)
    setLive(null)
    missed.current = false
    if (idx + 1 >= total) setPhase("done")
    else setIdx(idx + 1)
  }

  /* A análise entrega leituras fora do React; aqui elas viram veredito.
     Um juiz por nota: ele só decide quando a altura se estabiliza. */
  useEffect(() => {
    if (phase !== "run" || status !== "on" || !target) return
    const judge = createJudge({ targetMidi: target.midi, a4, tolerance })
    const targetHz = midiToHz(target.midi, a4)
    let settled = false
    let lastUi = 0
    let timer = 0

    const off = onFrame(({ hz }) => {
      const now = performance.now()
      if (now - lastUi > UI_MS) {
        lastUi = now
        setLive(hz > 0 ? { hz, cents: centsBetween(hz, targetHz), midi: Math.round(hzToMidi(hz, a4)) } : null)
      }
      if (settled) return
      const v = judge.push(hz)
      if (!v) return
      settled = true
      setVerdict(v)
      if (v.state === "ok") {
        if (!missed.current) setClean((c) => c + 1)
        timer = window.setTimeout(() => {
          setVerdict(null)
          setLive(null)
          missed.current = false
          if (idx + 1 >= total) setPhase("done")
          else setIdx(idx + 1)
        }, NEXT_MS)
      } else {
        missed.current = true
        timer = window.setTimeout(() => {
          setVerdict(null)
          judge.reset()
          settled = false
        }, RETRY_MS)
      }
    })

    return () => {
      off()
      clearTimeout(timer)
    }
  }, [phase, status, idx, total, target, a4, tolerance])

  /** Toca a nota pedida, com a escuta pausada para o app não ouvir a si mesmo */
  async function hear() {
    if (!target) return
    if (soundStatus !== "on") await turnSoundOn()
    setListenMuted(true)
    playMidi(target.midi)
    window.setTimeout(() => setListenMuted(false), HEAR_MS)
  }

  const sName = target ? nn.note(STRINGS[target.si].l) : ""
  const noteName = target ? nn.note(target.l, target.alt) : ""
  const where = target
    ? target.k === 0
      ? fmt(pt.on_open, { string: sName })
      : fmt(pt.on_finger, { string: sName, k: target.k })
    : ""

  return (
    <dialog ref={ref} className="prt-dialog" onClose={onClose} aria-label={pt.title}>
      <header className="prt-head">
        <div>
          <span className="eyebrow">{pt.eyebrow}</span>
          <h2 className="prt-title">{keyName(n, "major")}</h2>
        </div>
        <button type="button" className="vl-x" onClick={close} aria-label={t.actions.close}>
          <X size={18} />
        </button>
      </header>

      {intro && (
        <div className="prt-intro">
          <p className="prt-lead">{pt.lead}</p>
          <ul className="prt-notes">
            <li>{pt.limits}</li>
            <li>{pt.privacy}</li>
            <li>{pt.headphones}</li>
          </ul>
          {status !== "off" && status !== "asking" && status !== "on" && (
            <p className="prt-err">{pt.err[status]}</p>
          )}
          <button
            type="button"
            className="vl-btn vl-btn-primary"
            onClick={askMic}
            disabled={status === "asking"}
            aria-busy={status === "asking"}
          >
            <Mic size={15} /> {status === "asking" ? pt.asking : status === "off" ? pt.start : pt.retry}
          </button>
        </div>
      )}

      {!intro && phase === "run" && target && (
        <div className="prt-run">
          <div className="prt-ask">
            <div className="prt-ask-note" aria-live="polite">
              <span className="prt-ask-l">{pt.ask}</span>
              <strong>{noteName}</strong>
              <span className="prt-ask-where">{where}</span>
            </div>
            <div className="prt-ask-side">
              <span className="prt-count">{fmt(pt.progress, { i: idx + 1, total })}</span>
              <button type="button" className="vl-btn vl-btn-ghost vl-nowrap" onClick={hear}>
                <Volume2 size={15} /> {pt.hear}
              </button>
            </div>
          </div>

          <Tuner live={live} tolerance={tolerance} pt={pt} />

          <PracticeBoard n={n} p={p} targets={targets} idx={idx} state={verdict?.state ?? null} />

          <p className={"prt-msg" + (verdict ? " is-" + verdict.state : "")} aria-live="polite">
            {verdict ? verdictText(verdict, pt, nn.pitch(verdict.midi, n)) : pt.listening}
          </p>

          <div className="prt-tools">
            <Seg
              label={pt.tuning}
              value={a4}
              onChange={setA4}
              options={A4_OPTIONS.map((v) => ({ v: v as number, l: String(v) }))}
            />
            <Seg
              label={pt.tolerance}
              value={tolerance}
              onChange={setTolerance}
              options={[
                { v: TOLERANCES[0] as number, l: pt.tol_strict },
                { v: TOLERANCES[1] as number, l: pt.tol_normal },
                { v: TOLERANCES[2] as number, l: pt.tol_easy },
              ]}
            />
            <button type="button" className="vl-btn vl-btn-ghost vl-nowrap" onClick={skip}>{pt.skip}</button>
          </div>
        </div>
      )}

      {!intro && phase === "done" && (
        <div className="prt-done">
          <p className="prt-done-n">{fmt(pt.done_line, { ok: clean, total })}</p>
          <div className="prt-done-btns">
            <button type="button" className="vl-btn vl-btn-primary" onClick={restart}>{pt.again}</button>
            <button type="button" className="vl-btn vl-btn-ghost" onClick={close}>{t.actions.close}</button>
          </div>
        </div>
      )}
    </dialog>
  )
}

type PracticeDict = ReturnType<typeof useArmText>["t"]["practice"]

function verdictText(v: Verdict, pt: PracticeDict, heard: string) {
  const cents = Math.round(Math.abs(v.cents))
  if (v.state === "ok") return pt.ok
  if (v.state === "flat") return fmt(pt.flat, { cents })
  if (v.state === "sharp") return fmt(pt.sharp, { cents })
  if (v.state === "octave") return pt.octave
  return fmt(pt.wrong, { note: heard })
}

/** Ponteiro de afinação: −50 cents à esquerda, +50 à direita */
function Tuner({ live, tolerance, pt }: { live: Live | null; tolerance: number; pt: PracticeDict }) {
  const cents = live ? Math.max(-50, Math.min(50, live.cents)) : 0
  // a barra cobre ±50 cents em 100%, então 1 cent = 1% e a faixa verde é a própria tolerância

  return (
    <div className="prt-tuner" aria-hidden="true">
      <span className="prt-tuner-l">{pt.flat_short}</span>
      <div className="prt-bar">
        <span className="prt-band" style={{ left: `${50 - tolerance}%`, right: `${50 - tolerance}%` }} />
        <span className="prt-mid" />
        {live && <span className="prt-needle" style={{ left: `${50 + cents}%` }} />}
      </div>
      <span className="prt-tuner-r">{pt.sharp_short}</span>
      <span className="prt-cents">{live ? `${live.cents > 0 ? "+" : ""}${Math.round(live.cents)}` : "—"}</span>
    </div>
  )
}
