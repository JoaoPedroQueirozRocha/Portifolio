import { describe, expect, it } from "vitest"
import { makeNoteNames } from "@/lib/armaduras"
import ptBR from "../i18n/pt-BR.json"
import en from "../i18n/en.json"
import {
  HI, KEYS, LO, PRESETS, average, contextNotes, currentItem, degreeOf, fingerAt, initialState, inScale,
  makeRound, nextNote, parseConfig, parseSaved, pickKey, prefPlace, presetOf, reducer, rollup, tapOutcome,
  tonicMidi, tonicPc, trainingRound,
  type Action, type Config, type Round, type State,
} from "../logic"
import { createText } from "../text"

/** Rodada fixa em Ré maior, partindo do Ré solto: Fá♯ · Mi · Lá · Si… */
const round = (chain = true): Round => ({
  key: 2, chain,
  items: [
    { from: 62, to: 66 }, { from: 66, to: 64 }, { from: 64, to: 69 }, { from: 69, to: 71 },
    { from: 71, to: 74 }, { from: 74, to: 73 }, { from: 73, to: 69 }, { from: 69, to: 62 },
  ],
})
const start = (cfg: Partial<Config> = {}, chain = true): State => {
  const st = initialState(undefined, () => round(chain))
  return { ...st, cfg: { ...st.cfg, ...cfg } }
}
const run = (st: State, ...as: Action[]) => as.reduce(reducer, st)
const tap = (si: number, ci: number): Action => ({ type: "tap", si, ci })
// Ré maior: Fá♯ (66) está na corda Ré, casa 4; Mi (64) na casa 2; Sol (67) na casa 5
const FS = tap(1, 4)

describe("música", () => {
  it("a tônica de cada tonalidade", () => {
    expect(KEYS.map(tonicPc)).toEqual([0, 7, 2, 9, 5, 10, 3])
    expect(tonicMidi(2)).toBe(62)
  })

  it("graus da escala e notas fora dela", () => {
    expect(degreeOf(66, 2)).toEqual({ kind: "in", n: 3 }) // Fá♯ em Ré maior
    expect(degreeOf(65, 2)).toEqual({ kind: "out", lo: 2, hi: 3 }) // Fá natural: entre o 2º e o 3º
    expect(degreeOf(62, 2)).toEqual({ kind: "in", n: 1 })
  })

  it("o lugar preferido é a casa mais baixa (corda solta quando dá)", () => {
    expect(prefPlace(55)).toEqual({ si: 0, ci: 0 })
    expect(prefPlace(62)).toEqual({ si: 1, ci: 0 }) // Ré solto, não o 4º dedo da corda Sol
    expect(prefPlace(69)).toEqual({ si: 2, ci: 0 })
    expect(prefPlace(66)).toEqual({ si: 1, ci: 4 })
    expect(prefPlace(84)).toEqual({ si: 3, ci: 8 })
  })

  it("o dedo vem da letra da grafia na tonalidade", () => {
    expect(fingerAt({ si: 1, ci: 0 }, 2)).toBe(0)
    expect(fingerAt({ si: 1, ci: 2 }, 2)).toBe(1) // Mi
    expect(fingerAt({ si: 1, ci: 4 }, 2)).toBe(2) // Fá♯
  })

  it("o contexto: tônica, trecho 1-2-3-4-5-3-1 ou nada", () => {
    const base = { ...PRESETS.med }
    expect(contextNotes({ ...base, ctx: "tonica" }, 2)).toEqual([62, 62])
    expect(contextNotes({ ...base, ctx: "trecho" }, 2)).toEqual([62, 64, 66, 67, 69, 66, 62])
    expect(contextNotes({ ...base, ctx: "nenhum" }, 2)).toEqual([])
  })
})

describe("sorteio da rodada", () => {
  it("8 notas encadeadas a partir da tônica, dentro da 1ª posição", () => {
    for (const preset of Object.values(PRESETS)) {
      for (let i = 0; i < 60; i++) {
        const r = makeRound(preset)
        expect(r.items).toHaveLength(8)
        expect(r.items[0].from).toBe(tonicMidi(r.key))
        r.items.forEach((x, j) => {
          expect(x.to).toBeGreaterThanOrEqual(LO)
          expect(x.to).toBeLessThanOrEqual(HI)
          expect(x.to).not.toBe(x.from)
          if (j) expect(x.from).toBe(r.items[j - 1].to)
        })
      }
    }
  })

  it("só notas da escala, a menos que as cromáticas estejam ligadas", () => {
    for (let i = 0; i < 80; i++) {
      const r = makeRound(PRESETS.med)
      r.items.forEach((x) => expect(inScale(x.to, r.key)).toBe(true))
    }
    const outside = Array.from({ length: 200 }, () => makeRound(PRESETS.adv))
      .some((r) => r.items.some((x) => !inScale(x.to, r.key)))
    expect(outside).toBe(true)
  })

  it("no nível Iniciante, a próxima nota fica a até 2 graus e a tonalidade tem até 2 acidentes", () => {
    for (let i = 0; i < 100; i++) {
      const r = makeRound(PRESETS.ini)
      expect(Math.abs(r.key)).toBeLessThanOrEqual(2)
      const scale: number[] = []
      for (let m = LO; m <= HI; m++) if (inScale(m, r.key)) scale.push(m)
      r.items.forEach((x) => {
        expect(Math.abs(scale.indexOf(x.to) - scale.indexOf(x.from))).toBeLessThanOrEqual(2)
      })
    }
  })

  it("tonalidade fixa vale; sorteada fica no conjunto do exercício", () => {
    expect(pickKey({ ...PRESETS.med, key: -3 })).toBe(-3)
    for (let i = 0; i < 40; i++) expect(KEYS).toContain(pickKey(PRESETS.med))
  })

  it("nextNote nunca repete a nota atual", () => {
    for (let i = 0; i < 300; i++) expect(nextNote(66, PRESETS.adv, 2)).not.toBe(66)
  })
})

describe("ajustes", () => {
  it("presetOf reconhece os níveis e marca o resto como personalizado", () => {
    expect(presetOf(PRESETS.ini)).toBe("ini")
    expect(presetOf(PRESETS.adv)).toBe("adv")
    expect(presetOf({ ...PRESETS.med, tries: 0 })).toBe("custom")
  })

  it("parseConfig e parseSaved só aceitam o formato salvo", () => {
    expect(parseConfig(PRESETS.med)).toEqual(PRESETS.med)
    expect(parseConfig({ ...PRESETS.med, key: 9 })).toBeUndefined()
    expect(parseConfig({ ...PRESETS.med, tries: 2 })).toBeUndefined()
    expect(parseConfig(null)).toBeUndefined()
    const saved = { cfg: PRESETS.adv, tally: { ok: 3, streak: 1, sum: 5, done: 4 } }
    expect(parseSaved(saved)).toEqual(saved)
    expect(parseSaved({ ...saved, tally: { ok: -1, streak: 0, sum: 0, done: 0 } })).toBeUndefined()
  })
})

describe("a rodada", () => {
  it("começa pronta, com a mão no lugar da nota de partida, e só procura depois de começar", () => {
    let st = start()
    expect(st.phase).toBe("ready")
    expect(st.here).toEqual({ si: 1, ci: 0 })
    expect(tapOutcome(st, 1, 4)).toBe("ignore")
    expect(run(st, FS)).toBe(st)
    st = run(st, { type: "begin" })
    expect(st.phase).toBe("search")
  })

  it("acerto de primeira: sequência sobe e a mão vai para a casa tocada", () => {
    const st = run(start(), { type: "begin" }, FS)
    expect(st.phase).toBe("hit")
    expect(st.hit).toEqual({ si: 1, ci: 4 })
    expect(st.tally).toEqual({ ok: 1, streak: 1, sum: 1, done: 1 })
    expect(st.results).toEqual([{ n: 1, ok: true }])
  })

  it("só a altura conta: o mesmo som em outra corda também acerta", () => {
    // Lá⁴ (69) é a corda Lá solta ou o 3º dedo da corda Ré
    const st = run(start(), { type: "begin" }, FS, { type: "next" }, tap(1, 2), { type: "next" }, tap(1, 7))
    expect(st.phase).toBe("hit")
    expect(st.hit).toEqual({ si: 1, ci: 7 })
  })

  it("erro e depois acerto: conta 2 tentativas e zera a sequência", () => {
    const st = run(start(), { type: "begin" }, tap(1, 2), FS)
    expect(st.tries).toHaveLength(1)
    expect(st.tally).toEqual({ ok: 1, streak: 0, sum: 2, done: 1 })
    expect(st.results).toEqual([{ n: 2, ok: true }])
  })

  it("3 tentativas erradas revelam a resposta e contam como erro", () => {
    const st = run(start(), { type: "begin" }, tap(1, 2), tap(1, 3), tap(1, 5))
    expect(st.phase).toBe("reveal")
    expect(st.nextHere).toEqual({ si: 1, ci: 4 })
    expect(st.tally).toEqual({ ok: 0, streak: 0, sum: 3, done: 1 })
    expect(st.results).toEqual([{ n: 3, ok: false }])
    expect(run(st, FS)).toBe(st) // depois de revelar, o braço não responde
  })

  it("tentativas ilimitadas nunca revelam", () => {
    let st = run(start({ tries: 0 }), { type: "begin" })
    for (let i = 0; i < 6; i++) st = run(st, tap(1, 2))
    expect(st.phase).toBe("search")
    expect(st.tries).toHaveLength(6)
    expect(tapOutcome(st, 1, 4)).toBe("hit")
  })

  it("tapOutcome antecipa o que o toque causa", () => {
    const st = run(start(), { type: "begin" })
    expect(tapOutcome(st, 1, 4)).toBe("hit")
    expect(tapOutcome(st, 1, 2)).toBe("wrong")
    expect(tapOutcome(run(st, tap(1, 2), tap(1, 3)), 1, 2)).toBe("reveal")
  })

  it("na cadeia, a mão segue onde a pessoa tocou; fora dela, volta ao lugar preferido", () => {
    // acertou no 4º dedo da corda Sol (Ré⁴ não é o caso aqui): usa a corda Ré, casa 4 (Fá♯)
    const chained = run(start({}, true), { type: "begin" }, FS, { type: "next" })
    expect(chained.idx).toBe(1)
    expect(chained.here).toEqual({ si: 1, ci: 4 })
    expect(chained.tries).toEqual([])
    expect(chained.phase).toBe("search")
    const loose = run(start({}, false), { type: "begin" }, FS, { type: "next" })
    expect(loose.here).toEqual(prefPlace(66))
    const revealed = run(start(), { type: "begin" }, tap(1, 2), tap(1, 3), tap(1, 5), { type: "next" })
    expect(revealed.here).toEqual(prefPlace(66))
  })

  it("depois da última nota vem o resumo, e o placar é o acumulado", () => {
    let st = run(start(), { type: "begin" })
    for (const it of round().items) {
      const p = prefPlace(it.to)
      st = run(st, tap(p.si, p.ci), { type: "next" })
    }
    expect(st.phase).toBe("summary")
    expect(st.idx).toBe(8)
    expect(st.tally.ok).toBe(8)
    expect(run(st, tap(1, 4))).toBe(st)
    expect(currentItem(st)).toEqual(round().items[7])
  })

  it("nova rodada mantém o placar; novos ajustes o zeram", () => {
    const played = run(start(), { type: "begin" }, FS)
    const again = run(played, { type: "round", round: round() })
    expect(again.tally).toEqual(played.tally)
    expect(again.phase).toBe("ready")
    expect(again.results).toEqual([])
    const reset = run(played, { type: "config", cfg: PRESETS.adv, round: round() })
    expect(reset.tally).toEqual({ ok: 0, streak: 0, sum: 0, done: 0 })
    expect(reset.cfg).toBe(PRESETS.adv)
  })
})

describe("resumo", () => {
  const results = [{ n: 1, ok: true }, { n: 2, ok: true }, { n: 3, ok: false }]

  it("rollup: de primeira, reveladas, difíceis e saltos mais difíceis", () => {
    const r = rollup(results, round().items)
    expect(r.firsts).toBe(1)
    expect(r.revealed).toBe(1)
    expect(r.sum).toBe(6)
    expect(r.hard).toEqual([1, 2])
    // salto 2 (66→64): 2 tentativas; salto 5 (64→69): revelada pesa 4
    expect(r.jumps).toEqual([{ interval: 5, avg: 4 }, { interval: 2, avg: 2 }])
  })

  it("rodada de treino: só as difíceis, cada uma do seu ponto", () => {
    const st = run(start(), { type: "begin" })
    const tr = trainingRound(st, [1, 2])
    expect(tr.chain).toBe(false)
    expect(tr.items).toEqual([round().items[1], round().items[2]])
    expect(tr.key).toBe(2)
  })

  it("average", () => {
    expect(average(0, 0)).toBeNull()
    expect(average(12, 8)).toBe(1.5)
    expect(average(4, 3)).toBe(1.3)
  })
})

describe("textos", () => {
  const nn = makeNoteNames(["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"])
  const tx = createText(ptBR, nn)

  it("mensagem inicial", () => {
    const m = tx.message(start())
    expect(m.text).toBe("Ouça o contexto e depois a nota. Sem ver o nome.")
    expect(m.sub).toBe("você está em Ré (corda Ré, solta)")
    expect(m.primary).toBe("listen")
  })

  it("dica de direção e tentativas restantes", () => {
    const st = run(start(), { type: "begin" }, tap(1, 2))
    const m = tx.message(st)
    expect(m).toMatchObject({ text: "Mais agudo ▲. Restam 2 tentativas.", icon: "▲", tone: "bad" })
    expect(m.sub).toBe("você tocou a casa marcada com ✕ · tentativa 1")
    expect(tx.message(run(st, tap(1, 3))).text).toBe("Mais agudo ▲. Resta 1 tentativa.")
    expect(tx.message({ ...st, cfg: { ...st.cfg, hint: 0 } }).text).toBe("Ainda não. Ouça o alvo de novo e compare. Restam 2 tentativas.")
  })

  it("mesmo nome em outra oitava", () => {
    // alvo Ré⁴ (62); a pessoa tocou o Ré⁵ (74, corda Lá casa 5)
    const octave: State = {
      ...start(), phase: "search", round: { ...round(), items: [{ from: 66, to: 62 }] },
      tries: [{ si: 2, ci: 5, m: 74 }],
    }
    expect(tx.message(octave).text).toBe("Mesmo nome, outra oitava — Mais grave ▼. Restam 2 tentativas.")
  })

  it("acerto: nome, grau e distância; revelação com o lugar certo", () => {
    const hit = run(start(), { type: "begin" }, tap(1, 2), FS)
    const m = tx.message(hit)
    expect(m.text).toBe("Isso — Fá♯, 3º grau de Ré maior. Quatro meios-tons acima do Ré.")
    expect(m.sub).toBe("corda Ré, 2º dedo · na 2ª tentativa")
    expect(m.primary).toBe("next")
    const rev = run(start(), { type: "begin" }, tap(1, 2), tap(1, 3), tap(1, 5))
    expect(tx.message(rev)).toMatchObject({
      text: "Era Fá♯ — corda Ré, 2º dedo. Ouça de novo e compare.",
      sub: "3º grau de Ré maior · conta como erro",
      icon: "↺",
    })
  })

  it("indicador de som, tentativas e trilha", () => {
    const st = run(start(), { type: "begin" }, tap(1, 2))
    expect(tx.live(st, { kind: "ctx", step: 3, total: 7 })).toEqual({ head: "♪ Tocando o contexto · 3 de 7", text: "Ré maior — entre na música" })
    expect(tx.live(st, { kind: "atual", step: 1, total: 1 })).toEqual({
      head: "♪ Tocando a nota atual", text: "é onde sua mão está: Ré — compare com o alvo",
    })
    expect(tx.live(st, null).head).toBe("Silêncio · sua vez")
    expect(tx.triesView(st)).toEqual({ marks: ["bad", "idle", "idle"], text: "2 tentativas", aria: "Tentativas: 1 de 3 usadas" })
    expect(tx.triesView(run(st, FS)).text).toBe("achou na 2ª")
    const trail = tx.trail(run(st, FS, { type: "next" }))
    expect(trail[0]).toMatchObject({ cap: "início", name: "Ré", sub: "tônica" })
    expect(trail[1]).toMatchObject({ name: "Fá♯", sub: "2 tentativas", state: "tries" })
    expect(trail[2]).toMatchObject({ name: "?", state: "now" })
    expect(trail).toHaveLength(9)
  })

  it("resumo", () => {
    let st = run(start(), { type: "begin" })
    for (const it of round().items) {
      const p = prefPlace(it.to)
      st = run(st, tap(p.si, p.ci), { type: "next" })
    }
    const s = tx.summary(st)
    expect(s.stats.map((x) => x.value)).toEqual(["8/8", "1,0", "0"])
    expect(s.hard).toBe("Nenhuma — todas de primeira.")
    expect(s.jumps).toBe("Nenhum salto deu trabalho.")
    expect(s.notes).toHaveLength(8)
    expect(s.hardIdx).toEqual([])
  })
})

describe("dicionários", () => {
  const keysOf = (o: unknown, p = ""): string[] =>
    o && typeof o === "object" && !Array.isArray(o)
      ? Object.entries(o).flatMap(([k, v]) => keysOf(v, p + "." + k))
      : Array.isArray(o) ? o.map((_, i) => `${p}[${i}]`) : [p]

  it("en.json tem as mesmas chaves e listas do pt-BR.json", () => {
    expect(keysOf(en).sort()).toEqual(keysOf(ptBR).sort())
  })

  it("os textos do jogo funcionam também em inglês", () => {
    const tx = createText(en, makeNoteNames(["C", "D", "E", "F", "G", "A", "B"]))
    const hit = run(start(), { type: "begin" }, tap(1, 2), FS)
    expect(tx.message(hit).text).toBe("Yes — F♯, degree 3 of D major. Four half steps above D.")
    expect(tx.message(start()).sub).toBe("you are on D (D string, open)")
  })
})
