/* ---------------------------------------------------------------
   Eco — textos derivados do estado (mensagem, indicador, tentativas,
   trilha e resumo). Sem React: recebem o dicionário do modo e os nomes
   de nota do idioma e devolvem strings prontas para a tela.
--------------------------------------------------------------- */
import { STRINGS, tonic, type NoteNames } from "@/lib/armaduras"
import { fmt } from "../shared/text"
import type { EcoDict } from "./i18n"
import {
  average, currentItem, degreeOf, fingerAt, mod, prefPlace, rollup, spellPitch,
  type Place, type State,
} from "./logic"

export type Tone = "muted" | "bad" | "ok"

export interface Message {
  text: string
  sub: string
  icon: string
  tone: Tone
  primary: "listen" | "next" | "summary" | null
}

/** O que está soando agora (indicador "tocando") */
export type Playing = { kind: "ctx" | "alvo" | "atual" | "toque"; step: number; total: number } | null

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function createText(t: EcoDict, nn: NoteNames) {
  /** Nome da nota grafado conforme a tonalidade (Fá♯ em Ré maior, Sol♭ em Mi♭ maior…) */
  const name = (m: number, key: number) => {
    const g = spellPitch(m, key)
    return nn.note(g.l, g.alt)
  }
  const keyName = (key: number) => {
    const tn = tonic(key)
    return fmt(t.key_name, { note: nn.note(tn.l, tn.alt) })
  }
  const keyBadge = (key: number) =>
    key ? fmt(t.key_badge, { key: keyName(key), n: Math.abs(key), acc: key > 0 ? "♯" : "♭" }) : keyName(key)
  const stringName = (si: number) => nn.note(STRINGS[si].l)
  const pos = (p: Place, key: number) => {
    const f = fingerAt(p, key)
    return p.ci === 0 ? t.place.open : f ? fmt(t.place.finger, { n: f }) : fmt(t.place.fret, { n: p.ci })
  }
  const place = (p: Place, key: number) => fmt(t.place.text, { string: stringName(p.si), pos: pos(p, key) })

  const degree = (m: number, key: number) => {
    const d = degreeOf(m, key)
    return d.kind === "in"
      ? fmt(t.degree.in, { n: d.n, key: keyName(key) })
      : fmt(t.degree.out, { key: keyName(key), lo: d.lo, hi: d.hi })
  }
  const degreeShort = (m: number, key: number) => {
    const d = degreeOf(m, key)
    return d.kind === "in" ? fmt(t.degree.short_in, { n: d.n, name: t.degree.names[d.n - 1] }) : t.degree.short_out
  }

  const semis = (d: number) => {
    const a = Math.abs(d)
    return capital(a === 1 ? t.semis.one : fmt(t.semis.many, { n: t.semis.nums[a] ?? a }))
  }
  const interval = (i: number) => t.intervals[Math.min(12, i)]
  const avg = (v: number | null) => (v === null ? t.none : v.toFixed(1).replace(".", t.decimal))

  /* ---- mensagem da rodada ---- */
  function message(st: State): Message {
    const key = st.round.key
    const it = currentItem(st)
    const { cfg, tries } = st
    const target = it.to
    const m = t.msg
    const last = st.round.items.length <= st.idx + 1

    if (st.phase === "ready") {
      return {
        text: m.ready, icon: "♪", tone: "muted", primary: "listen",
        sub: fmt(m.ready_sub, { note: name(it.from, key), place: place(st.here, key) }),
      }
    }
    if (st.phase === "search") {
      const prev = tries[tries.length - 1]
      if (!prev) return { text: m.search, icon: "♪", tone: "muted", primary: null, sub: fmt(m.search_sub, { note: name(it.from, key) }) }
      const up = target > prev.m
      const left = cfg.tries ? cfg.tries - tries.length : 0
      const rest = cfg.tries ? fmt(left === 1 ? m.rest_one : m.rest_many, { n: left }) : ""
      const sub = fmt(m.wrong_sub, { n: tries.length })
      if (!cfg.hint) return { text: m.nohint + rest, icon: "✕", tone: "bad", primary: null, sub }
      const same = mod(target - prev.m, 12) === 0 ? m.same_pc : ""
      return { text: same + (up ? m.hint_up : m.hint_down) + "." + rest, icon: up ? "▲" : "▼", tone: "bad", primary: null, sub }
    }
    const primary = last ? "summary" : "next"
    if (st.phase === "hit") {
      const d = target - it.from
      const move = d === 0 ? m.hit_same : fmt(d > 0 ? m.move_up : m.move_down, { amount: semis(d), from: name(it.from, key) })
      const when = tries.length ? fmt(m.nth_try, { n: tries.length + 1 }) : m.first_try
      return {
        text: fmt(m.hit, { note: name(target, key), degree: degree(target, key), move }),
        sub: fmt(m.hit_sub, { place: place(st.hit ?? prefPlace(target), key), when }),
        icon: "✓", tone: "ok", primary,
      }
    }
    if (st.phase === "reveal") {
      return {
        text: fmt(m.reveal, { note: name(target, key), place: place(prefPlace(target), key) }),
        sub: fmt(m.reveal_sub, { degree: degree(target, key) }),
        icon: "↺", tone: "muted", primary,
      }
    }
    return { text: "", sub: "", icon: "♪", tone: "muted", primary: null }
  }

  /* ---- indicador de som ---- */
  function live(st: State, playing: Playing) {
    const key = st.round.key
    const it = currentItem(st)
    const l = t.live
    if (playing?.kind === "ctx") return { head: fmt(l.ctx_head, { i: playing.step, n: playing.total }), text: fmt(l.ctx_text, { key: keyName(key) }) }
    if (playing?.kind === "atual") return { head: l.here_head, text: fmt(l.here_text, { from: name(it.from, key) }) }
    if (playing?.kind === "alvo") return { head: l.target_head, text: fmt(l.target_text, { from: name(it.from, key) }) }
    if (playing?.kind === "toque") return { head: l.touch_head, text: l.touch_text }
    if (st.phase === "ready") return { head: l.ready_head, text: l.ready_text }
    if (st.phase === "search") return { head: l.search_head, text: l.search_text }
    if (st.phase === "summary") return { head: l.sum_head, text: fmt(l.sum_text, { key: keyName(key) }) }
    return { head: l.idle_head, text: l.idle_text }
  }

  /* ---- tentativas ---- */
  function triesView(st: State) {
    const max = st.cfg.tries
    const used = st.tries.length
    if (!max) {
      return {
        marks: st.tries.map(() => "bad" as const),
        text: fmt(t.tries.unlimited, { n: used + 1 }),
        aria: t.tries.aria_unlimited,
      }
    }
    const marks = Array.from({ length: max }, (_, q) =>
      q < used ? ("bad" as const) : st.phase === "hit" && q === used ? ("ok" as const) : ("idle" as const))
    const left = Math.max(0, max - used)
    const text = st.phase === "hit" ? fmt(t.tries.hit, { n: used + 1 })
      : st.phase === "reveal" ? t.tries.none
        : fmt(left === 1 ? t.tries.left_one : t.tries.left_many, { n: left })
    return { marks, text, aria: fmt(t.tries.aria_limited, { used, max }) }
  }

  /* ---- "a melodia até aqui" ---- */
  type TrailState = "idle" | "now" | "first" | "tries" | "revealed"
  function trail(st: State) {
    const key = st.round.key
    const items = st.round.items
    const cells: { cap: string; name: string; sub: string; state: TrailState; start?: boolean }[] = [
      { cap: t.trail.start, name: name(items[0].from, key), sub: t.trail.tonic, state: "idle", start: true },
    ]
    items.forEach((x, i) => {
      const r = st.results[i]
      const cap = fmt(t.trail.nth, { n: i + 1 })
      if (r) {
        const state: TrailState = !r.ok ? "revealed" : r.n === 1 ? "first" : "tries"
        const sub = !r.ok ? t.trail.revealed : r.n === 1 ? t.trail.first : fmt(t.trail.tries, { n: r.n })
        cells.push({ cap, name: name(x.to, key), sub, state })
      } else if (i === st.idx && st.phase !== "summary") {
        cells.push({ cap, name: "?", sub: t.trail.listening, state: "now" })
      } else cells.push({ cap, name: "", sub: "", state: "idle" })
    })
    return cells
  }

  /* ---- resumo da rodada ---- */
  function summary(st: State) {
    const key = st.round.key
    const items = st.round.items
    const res = st.results
    const r = rollup(res, items)
    const s = t.summary
    const stats = [
      { label: s.firsts.label, value: `${r.firsts}/${items.length}`, sub: s.firsts.sub },
      { label: s.avg.label, value: avg(average(r.sum, res.length)), sub: s.avg.sub },
      { label: s.revealed.label, value: String(r.revealed), sub: r.revealed === 1 ? s.revealed.sub_one : s.revealed.sub_many },
    ]
    const notes = items.map((x, i) => {
      const res_ = res[i] ?? { n: 0, ok: true }
      const dd = x.to - x.from
      const iv = interval(Math.abs(dd))
      const jump = fmt(dd > 0 ? s.jump_up : dd < 0 ? s.jump_down : s.jump_same, { interval: iv })
      const status = !res_.ok ? t.trail.revealed : res_.n === 1 ? t.trail.first : fmt(t.trail.tries, { n: res_.n })
      const tone: "bad" | "ok" | "gold" = !res_.ok ? "bad" : res_.n === 1 ? "ok" : "gold"
      // uma marca por tentativa: as erradas e, se acertou, a certa
      const marks = Array.from({ length: Math.max(1, res_.n) }, (_, z) => !res_.ok || z < res_.n - 1)
      return { jump, name: name(x.to, key), status, tone, marks }
    })
    const hard = r.hard.length
      ? r.hard.map((i) => fmt(s.hard_item, {
          note: name(items[i].to, key), degree: degreeShort(items[i].to, key),
          status: res[i].ok ? fmt(t.trail.tries, { n: res[i].n }) : t.trail.revealed,
        })).join(" · ")
      : s.hard_none
    const jumps = r.jumps.length
      ? r.jumps.map((j) => fmt(s.jump_item, { interval: interval(j.interval), avg: avg(j.avg) })).join(" · ")
      : s.jumps_none
    return { stats, notes, hard, jumps, hardIdx: r.hard }
  }

  return { name, keyName, keyBadge, stringName, pos, place, degree, semis, interval, avg, message, live, triesView, trail, summary }
}

export type EcoText = ReturnType<typeof createText>
