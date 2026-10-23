import { describe, expect, it } from "vitest"
import ptBR from "../i18n/pt-BR.json"
import en from "../i18n/en.json"
import {
  BANK, PCS, bankFor, currentMsg, initialState, isBlack, isFinished, isSpecial, ladder, makeFresh, mod, nameKey,
  nextPc, parseSaved, pcOf, primary, progress, reducer, slots, tileView,
  type Action, type Fresh, type Name, type State,
} from "../logic"

const L = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"]
const label = (n: Name) => L[n.l] + (n.alt === 1 ? "♯" : n.alt === -1 ? "♭" : "")
const names = (pc: number) => PCS[pc].map(label)
const n = (l: number, alt: Name["alt"] = 0): Name => ({ l, alt })

/** Rodada fixa: começa em Dó e as perguntas vão de Dó (0) a Si (11) */
const fresh = (start = 0): Fresh => ({
  start,
  bank: BANK,
  eqQ: Array.from({ length: 12 }, (_, pc) => ({ pc, shown: PCS[pc][0] })),
})
const run = (st: State, ...as: Action[]) => as.reduce(reducer, st)
const start = (saved?: Parameters<typeof initialState>[0], f = fresh()) => initialState(saved, f)

describe("os 12 sons", () => {
  it("batem com a tabela do desenho", () => {
    expect(PCS.map((_, pc) => names(pc))).toEqual([
      ["Dó", "Si♯"], ["Dó♯", "Ré♭"], ["Ré"], ["Ré♯", "Mi♭"], ["Mi", "Fá♭"], ["Fá", "Mi♯"],
      ["Fá♯", "Sol♭"], ["Sol"], ["Sol♯", "Lá♭"], ["Lá"], ["Lá♯", "Si♭"], ["Si", "Dó♭"],
    ])
  })

  it("as teclas pretas são as 5 do meio e só as especiais têm nome com acidente numa natural", () => {
    expect([...Array(12).keys()].filter(isBlack)).toEqual([1, 3, 6, 8, 10])
    const special = PCS.flat().filter(isSpecial).map(label)
    expect(special.sort()).toEqual(["Dó♭", "Fá♭", "Mi♯", "Si♯"].sort())
  })

  it("o nome de costume sobe com ♯ e desce com ♭", () => {
    expect(label(primary(1, 1))).toBe("Dó♯")
    expect(label(primary(1, -1))).toBe("Ré♭")
    expect(label(primary(0, -1))).toBe("Dó")
  })

  it("o banco da rodada vem embaralhado em cada linha; o Explorar usa a ordem fixa", () => {
    const keys = (rows: typeof BANK) => rows.map((r) => r.tiles.map(nameKey))
    const ordered = keys(BANK)
    const shuffled = Array.from({ length: 8 }, () => keys(makeFresh("do").bank))
    // cada linha continua com os mesmos 7 nomes, e em algum sorteio sai da ordem
    shuffled.forEach((rows) => rows.forEach((r, i) => expect([...r].sort()).toEqual([...ordered[i]].sort())))
    expect(shuffled.some((rows) => rows.some((r, i) => r.join() !== ordered[i].join()))).toBe(true)
    const st = start(undefined, makeFresh("do"))
    expect(bankFor(st)).toBe(st.bank)
    expect(bankFor(run(st, { type: "mode", mode: "eq", fresh: makeFresh("do") }))).not.toBe(BANK)
    expect(bankFor(run(st, { type: "mode", mode: "explorar", fresh: makeFresh("do") }))).toBe(BANK)
  })

  it("o banco tem 3 linhas de 7 nomes que cobrem todos os sons", () => {
    expect(BANK.map((r) => r.tiles.length)).toEqual([7, 7, 7])
    const covered = new Set(BANK.flatMap((r) => r.tiles.map(pcOf)))
    expect(covered.size).toBe(12)
    expect(new Set(BANK.flatMap((r) => r.tiles.map(nameKey))).size).toBe(21)
  })
})

describe("modo Ordem", () => {
  it("monta a volta subindo, aceitando qualquer nome do som", () => {
    let st = start()
    const order = [n(0), n(0, 1), n(1), n(2, -1), n(2), n(3), n(3, 1), n(4), n(4, 1), n(5), n(6, -1), n(6)]
    order.forEach((name, i) => {
      expect(nextPc(st)).toBe(i)
      st = run(st, { type: "pick", name })
      expect(st.k).toBe(i + 1)
    })
    expect(isFinished(st)).toBe(true)
    expect(st.tally).toEqual({ ok: 12, bad: 0, streak: 12 })
    expect(currentMsg(st).text).toBe("ordem_done_up")
    expect(nextPc(st)).toBeNull()
  })

  it("desce de trás para frente a partir da casa inicial", () => {
    let st = start(undefined, fresh(7))
    st = run(st, { type: "dir", dir: -1, fresh: fresh(7) })
    expect([nextPc(st), nextPc(run(st, { type: "pick", name: n(4) }))]).toEqual([7, 6])
  })

  it("erro zera a sequência e explica pela distância", () => {
    let st = start()
    st = run(st, { type: "pick", name: n(0) })
    st = run(st, { type: "pick", name: n(2) }) // Mi: 4 meios-tons acima
    expect(st.tally).toEqual({ ok: 1, bad: 1, streak: 0 })
    expect(st.k).toBe(1)
    expect(currentMsg(st)).toMatchObject({ tone: "bad", text: "ordem_bad_up", vars: { d: { semis: 4 } } })
  })

  it("repetir a nota anterior com outro nome é erro específico; errar a 1ª explica a casa inicial", () => {
    let st = run(start(), { type: "pick", name: n(1) })
    expect(currentMsg(st).text).toBe("ordem_bad_first")
    st = run(st, { type: "pick", name: n(0) }, { type: "pick", name: n(6, 1) }) // Si♯ soa Dó
    expect(currentMsg(st).text).toBe("ordem_bad_same")
  })

  it("mensagens de acerto distinguem especial, outro nome e o nome de costume", () => {
    const text = (name: Name, st = start()) => currentMsg(run(st, { type: "pick", name })).text
    expect(text(n(6, 1))).toBe("ordem_special")
    expect(text(n(0))).toBe("ordem_natural_alias")
    const at1 = run(start(), { type: "pick", name: n(0) })
    expect(text(n(0, 1), at1)).toBe("ordem_black")
    expect(text(n(1, -1), at1)).toBe("ordem_alias_up")
  })

  it("não aceita jogada depois da volta completa", () => {
    let st = start()
    for (let pc = 0; pc < 12; pc++) st = run(st, { type: "pick", name: PCS[pc][0] })
    expect(run(st, { type: "pick", name: n(0) })).toBe(st)
  })

  it("o banco apaga todos os nomes de um som que já entrou", () => {
    const st = run(start(), { type: "pick", name: n(0) })
    expect(tileView(st, n(0))).toMatchObject({ dim: false, mark: "ok" }) // acabou de acertar: destaca em vez de apagar
    expect(tileView(st, n(6, 1))).toMatchObject({ dim: true, mark: "alias", alias: n(0) })
    expect(tileView(st, n(1))).toMatchObject({ dim: false, mark: "" })
  })

  it("na roda, só a próxima casa fica marcada", () => {
    const st = run(start(), { type: "pick", name: n(0) })
    const marked = slots(st).filter((s) => s.ask).map((s) => s.pc)
    expect(marked).toEqual([1])
    expect(slots(st)[0]).toMatchObject({ name: n(0), flash: true })
    expect(slots(st)[2].name).toBeNull()
  })
})

describe("modo Equivalentes", () => {
  const eq = () => run(start(), { type: "mode", mode: "eq", fresh: fresh() })

  it("aceita o outro nome, rejeita o nome mostrado e nomes de outro som", () => {
    let st = eq()
    st = run(st, { type: "pick", name: n(0) }) // o próprio nome mostrado
    expect(currentMsg(st).text).toBe("eq_bad_self")
    st = run(st, { type: "pick", name: n(1) }) // Ré: 2 meios-tons acima
    expect(currentMsg(st)).toMatchObject({ text: "eq_bad_up", vars: { d: { semis: 2 } } })
    st = run(st, { type: "pick", name: n(6, 1) }) // Si♯ = Dó
    expect(st.eqI).toBe(1)
    expect(st.tally.ok).toBe(1)
  })

  it("'não tem outro nome' vale só para Ré, Sol e Lá", () => {
    let st = eq()
    st = run(st, { type: "none" }) // Dó tem outro nome (Si♯)
    expect(currentMsg(st)).toMatchObject({ tone: "bad", head: "eq_none_bad", text: "eq_none_natural" })
    expect(st.eqI).toBe(0)
    const f: Fresh = { ...fresh(), eqQ: [{ pc: 2, shown: PCS[2][0] }, ...fresh().eqQ.filter((q) => q.pc !== 2)] }
    st = run(st, { type: "next", fresh: f }, { type: "none" })
    expect(st.eqI).toBe(1)
    expect(currentMsg(st).text).toBe("eq_ok_none")
  })

  it("percorre as 12 casas e fecha a roda", () => {
    let st = eq()
    for (let i = 0; i < 12; i++) {
      const cur = st.eqQ[st.eqI]
      st = PCS[cur.pc].length === 1 ? run(st, { type: "none" }) : run(st, { type: "pick", name: PCS[cur.pc][1] })
    }
    expect(isFinished(st)).toBe(true)
    expect(progress(st)).toEqual({ done: 12, total: 12 })
    expect(currentMsg(st).head).toBe("eq_done")
    expect(st.tally.ok).toBe(12)
  })

  it("mostra a pergunta na roda e a escada acende as conferidas", () => {
    let st = eq()
    expect(slots(st).find((s) => s.ask)?.pc).toBe(0)
    st = run(st, { type: "pick", name: n(6, 1) })
    expect(ladder(st).filter((c) => c.kind === "note" && c.known).length).toBe(2) // Dó aparece no começo e no fim
  })
})

describe("modo Explorar", () => {
  it("seleciona pela roda ou pelo banco e descreve o som", () => {
    let st = run(start(), { type: "mode", mode: "explorar", fresh: fresh() })
    expect(currentMsg(st).text).toBe("explore_idle")
    st = run(st, { type: "select", pc: 1 })
    expect(currentMsg(st)).toMatchObject({ head: "explore_near", text: "explore_black" })
    st = run(st, { type: "pick", name: n(2) }) // Mi
    expect(st.sel).toBe(4)
    expect(currentMsg(st).text).toBe("explore_special")
    expect(run(st, { type: "select", pc: 2 }).sel).toBe(2)
    expect(currentMsg(run(st, { type: "select", pc: 2 })).text).toBe("explore_one")
  })

  it("não mexe no placar e trocar o sentido mantém a seleção", () => {
    let st = run(start(), { type: "mode", mode: "explorar", fresh: fresh() }, { type: "select", pc: 3 })
    st = run(st, { type: "dir", dir: -1, fresh: fresh() })
    expect(st.sel).toBe(3)
    expect(label(slots(st)[3].name!)).toBe("Mi♭")
    expect(st.tally).toEqual({ ok: 0, bad: 0, streak: 0 })
  })

  it("select fora do Explorar é ignorado", () => {
    const st = start()
    expect(run(st, { type: "select", pc: 3 })).toBe(st)
  })
})

describe("ajustes e persistência", () => {
  it("trocar de modo recomeça a rodada sem perder o placar; Recomeçar zera", () => {
    let st = run(start(), { type: "pick", name: n(0) })
    st = run(st, { type: "mode", mode: "eq", fresh: fresh() })
    expect(st).toMatchObject({ mode: "eq", k: 0, filled: {}, tally: { ok: 1 } })
    st = run(st, { type: "restart", fresh: fresh() })
    expect(st.tally).toEqual({ ok: 0, bad: 0, streak: 0 })
  })

  it("makeFresh: começa em Dó, ou numa natural sorteada, e sorteia as 12 perguntas", () => {
    expect(makeFresh("do").start).toBe(0)
    for (let i = 0; i < 20; i++) expect([0, 2, 4, 5, 7, 9, 11]).toContain(makeFresh("rand").start)
    const f = makeFresh("do")
    expect(f.eqQ.map((q) => q.pc).sort((a, b) => a - b)).toEqual([...Array(12).keys()])
    f.eqQ.forEach((q) => expect(PCS[q.pc].some((x) => nameKey(x) === nameKey(q.shown))).toBe(true))
  })

  it("parseSaved só aceita o formato salvo", () => {
    const ok = { mode: "eq", dir: -1, startMode: "rand", tally: { ok: 3, bad: 1, streak: 2 } }
    expect(parseSaved(ok)).toEqual(ok)
    expect(parseSaved(null)).toBeUndefined()
    expect(parseSaved({ ...ok, mode: "x" })).toBeUndefined()
    expect(parseSaved({ ...ok, dir: 0 })).toBeUndefined()
    expect(parseSaved({ ...ok, tally: { ok: -1, bad: 0, streak: 0 } })).toBeUndefined()
  })

  it("mod devolve sempre positivo", () => {
    expect([mod(-1, 12), mod(13, 12), mod(0, 12)]).toEqual([11, 1, 0])
  })
})

describe("escada", () => {
  it("tem 13 notas de Dó a Dó e um ½ depois de Mi e de Si", () => {
    const cells = ladder(start())
    expect(cells).toHaveLength(15)
    expect(cells.flatMap((c, i) => (c.kind === "half" ? [i] : []))).toEqual([5, 13])
    expect(cells[0]).toMatchObject({ pc: 0, hot: true })
  })
})

describe("dicionários", () => {
  const keysOf = (o: unknown, p = ""): string[] =>
    o && typeof o === "object" && !Array.isArray(o)
      ? Object.entries(o).flatMap(([k, v]) => keysOf(v, p + "." + k))
      : [p]

  it("en.json tem as mesmas chaves do pt-BR.json", () => {
    expect(keysOf(en).sort()).toEqual(keysOf(ptBR).sort())
    expect(en.cards).toHaveLength(ptBR.cards.length)
  })

  it("toda mensagem que a lógica pode gerar existe nos dois idiomas", () => {
    const seen = new Set<string>()
    const collect = (st: State) => {
      const m = currentMsg(st)
      seen.add("heads." + m.head)
      seen.add("msg." + m.text)
    }
    const f = fresh()
    const base = start()
    const tries: State[] = [
      base,
      ...[n(0, 1), n(6, 1), n(0), n(1), n(2), n(1, -1), n(2, -1)].map((name) => run(base, { type: "pick", name })),
      ...[0, 1, 2].map((pc) => run(run(base, { type: "pick", name: PCS[0][0] }), { type: "pick", name: PCS[pc][0] })),
      run(base, { type: "dir", dir: -1, fresh: f }),
    ]
    tries.forEach(collect)
    const eq = run(base, { type: "mode", mode: "eq", fresh: f })
    ;[eq, run(eq, { type: "none" }), run(eq, { type: "pick", name: n(0) }), run(eq, { type: "pick", name: n(1) }),
      run(eq, { type: "pick", name: n(5, 1) }), run(eq, { type: "pick", name: n(6, 1) }),
      run(eq, { type: "pick", name: n(4, -1) }), run(eq, { type: "pick", name: n(3, -1) })].forEach(collect)
    for (let pc = 0; pc < 12; pc++) {
      const ex = run(base, { type: "mode", mode: "explorar", fresh: f }, { type: "select", pc })
      collect(ex)
    }
    collect(run(base, { type: "mode", mode: "explorar", fresh: f }))
    for (const dict of [ptBR, en] as unknown as Record<string, Record<string, string>>[]) {
      for (const key of seen) {
        const [group, name] = key.split(".")
        expect(dict[group]?.[name], key).toBeTypeOf("string")
      }
    }
  })
})
