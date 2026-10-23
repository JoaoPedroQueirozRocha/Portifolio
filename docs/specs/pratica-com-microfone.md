# Prática com Microfone — Treino de Armaduras

Spec de implementação. Feature nova no minijogo **Armaduras**: depois de conferir a
resposta (forma + notas posicionadas), um botão abre um popup que pede nota a nota
e **escuta o violino pelo microfone** para conferir se a altura está certa.

---

## 1. Viabilidade — o que dá e o que não dá

Testado contra a biblioteca escolhida e contra a faixa de notas que o jogo gera.

### Dá para fazer

| Item | Situação |
|---|---|
| Captar o microfone no navegador | `getUserMedia` — Chrome, Firefox, Safari (desktop e mobile). Exige contexto seguro: HTTPS em produção, `localhost` em dev |
| Detectar a altura de uma nota de violino | Sim. O violino é monofônico e de altura bem definida — caso fácil para detecção de pitch |
| Faixa de notas do jogo | Sol³ (196 Hz) até ~Ré♯⁶ (1245 Hz) na 3ª posição, 4º dedo na corda Mi. Toda a faixa cabe com folga numa janela de 2048 amostras a 48 kHz |
| Medir desafinação em cents | Sim — é o que um afinador faz. Precisão prática: ±3 cents com nota sustentada |
| Rodar tudo no cliente | Sim. Nenhum áudio sai do navegador, nada é gravado |

### Não dá para fazer (limites honestos, precisam aparecer na UI)

| Limite | Consequência no exercício |
|---|---|
| **O microfone não sabe em que corda a nota foi tocada** | Lá⁴ na corda Lá solta e Lá⁴ na corda Ré (3º dedo) são a mesma altura. O jogo pede "corda Ré, 3º dedo", mas só consegue validar a **altura** |
| **Nem qual dedo foi usado** | Idem acima |
| **Nota a nota, uma de cada vez** | Acordes/cordas duplas confundem o algoritmo. A UI precisa pedir nota isolada |
| **Nota curta demais não é julgada** | São necessários ~250 ms de som estável. Pizzicato curto e staccato tendem a falhar |
| **Vibrato oscila ±20–50 cents** | Resolvido com mediana de várias leituras, não com uma leitura só |
| **O som do próprio app vazando pelo alto-falante** | Se a nota de referência tocar (smplr) enquanto o mic escuta, ele detecta a referência. Resolvido pausando a escuta durante a referência + aviso de fone |

A limitação de corda/dedo é a mais relevante: o exercício vira **"toque esta altura"**,
não "toque este dedo nesta corda". A oitava ajuda a pegar parte do erro — tocar na corda
errada quase sempre dá uma oitava de diferença, e isso a gente detecta e avisa
("oitava errada") em vez de só marcar vermelho.

---

## 2. Biblioteca

**Escolhida: [`pitchy`](https://www.npmjs.com/package/pitchy) v4.1.0** — MIT, ESM puro,
uma única dependência (`fft.js`), ~10 KB.

Implementa o **McLeod Pitch Method (MPM)**, que é o algoritmo usado em afinadores
(o Tartini). Devolve `[hz, clarity]`, onde `clarity` (0–1) diz o quanto aquilo era
realmente uma nota e não ruído — é o que filtra sopro de arco, respiração e sala.

```ts
const detector = PitchDetector.forFloat32Array(2048)
detector.clarityThreshold = 0.85   // violino com vibrato: 0.9 é rígido demais
detector.minVolumeDecibels = -35   // ignora silêncio/ruído de fundo
const [hz, clarity] = detector.findPitch(buffer, ctx.sampleRate) // [0, 0] se baixo demais
```

### Alternativas avaliadas

| Lib | Por que não |
|---|---|
| `pitchfinder` | Coleção de algoritmos (YIN, AMDF, MPM…). Mais flexível, mas sem medida de clareza pronta e sem filtro de volume — teríamos que escrever o que a pitchy já dá |
| `aubiojs` (WASM) | Excelente qualidade, mas ~300 KB de WASM e API de baixo nível. Exagero para uma nota por vez |
| CREPE / ml5 (modelo neural) | Precisão alta, porém megabytes de modelo e GPU/CPU pesada. Não compensa num minijogo de portfólio |
| `AnalyserNode.getFloatFrequencyData` puro | FFT sozinha erra oitava em instrumento de corda (o 2º harmônico costuma ser mais forte que a fundamental). É o erro clássico de quem faz afinador na mão |

Carregamento **dinâmico** (`await import("pitchy")`) só quando o popup abre — mesmo
padrão já usado para o `smplr` em `lib/violinSound.ts`, então nada entra no bundle inicial.

---

## 3. Arquitetura

Segue os padrões que já existem no Caderno de Violino: módulo singleton de áudio com
store externa (`subscribe` + `useSyncExternalStore`), lógica musical pura em `lib/`,
componente só com UI.

### Arquivos novos

```
lib/pitch.ts                                   — matemática pura (Hz ↔ MIDI ↔ cents) + juiz da nota
lib/violinListen.ts                            — microfone + pitchy + store de leituras
components/violino/armaduras/PracticeDialog.tsx — o popup
components/violino/armaduras/pratica.css        — estilos (ou bloco em armaduras.css)
```

### Arquivos alterados

```
components/violino/armaduras/ArmadurasGame.tsx — botão "Praticar no violino" (só com checked)
lib/violinSound.ts                             — extrair o AudioContext para um singleton compartilhado
dictionaries/pt-BR.json, dictionaries/en.json  — bloco armaduras.practice.*
```

### `lib/pitch.ts` — puro, sem DOM

```ts
export const midiToHz = (midi: number, a4: number) => a4 * 2 ** ((midi - 69) / 12)
export const centsBetween = (hz: number, targetHz: number) => 1200 * Math.log2(hz / targetHz)

export interface Verdict {
  state: "ok" | "flat" | "sharp" | "octave" | "wrong"
  cents: number        // desvio do alvo, já com a mediana das leituras
  midi: number         // nota realmente tocada
}
```

Mais o **juiz** (`createJudge`): acumula leituras e só decide quando N leituras
consecutivas (≈250 ms) ficam dentro de uma janela estável. Descarta o ataque do arco,
tira a mediana (imune ao vibrato) e compara com o alvo.

Por ser pura, essa parte dá para verificar sem microfone — alimentando um array de
frequências de teste.

### `lib/violinListen.ts` — espelho de `violinSound.ts`

```ts
export type ListenStatus = "off" | "asking" | "on" | "denied" | "nomic" | "insecure" | "error"
export interface Reading { hz: number; clarity: number; midi: number; at: number }

export function startListening(): Promise<boolean>  // chamar dentro de um clique
export function stopListening(): void               // para as tracks (apaga o indicador de gravação)
export function subscribeListen(cb: () => void): () => void
export function getListenStatus(): ListenStatus
export function getReading(): Reading | null
```

Detalhes que importam:

- `getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } })`
  — **os três flags precisam estar desligados**. O cancelamento de eco e a supressão de
  ruído do Chrome destroem nota sustentada: o navegador acha que é ruído estacionário
- `AnalyserNode` com `fftSize = 2048` + `getFloatTimeDomainData`, lido num laço de
  `requestAnimationFrame`
- Um `AudioContext` só para o caderno inteiro (hoje o `violinSound.ts` cria o dele):
  extrair para `lib/audioContext.ts` e os dois módulos passam a usar o mesmo
- Ao fechar o popup: `stream.getTracks().forEach(t => t.stop())`, senão o indicador de
  microfone fica aceso na aba

### `PracticeDialog.tsx`

Usa o `Dialog` de `components/ui/dialog.tsx` (Base UI) — já dá foco preso, Esc e
backdrop de graça, melhor que repetir o padrão manual do `HelpBalloon`.

Conteúdo:

1. **Cabeçalho** — tonalidade da rodada + trilha das notas (reaproveita o visual de
   `.arm-scale`), com a nota atual destacada e as já tocadas marcadas
2. **Nota pedida** — nome grande, corda e dedo ("corda Ré · 2º dedo"), botão de ouvir
   a referência (smplr, que já existe)
3. **Afinador ao vivo** — ponteiro de cents, nota detectada e barra de volume. É o
   feedback que ensina: o usuário vê o quanto está baixo ou alto enquanto ajusta o dedo
4. **Rodapé** — pular nota, repetir, sair; contador "7 de 17"

---

## 4. Fluxo do usuário

```
[conferiu a armadura]
   └── botão "Praticar no violino"  → abre o popup
         └── tela de permissão: o que vai acontecer + "Ligar o microfone"
               ├── negado  → explica como reverter no navegador + botão "tentar de novo"
               └── ligado
                     └── (opcional) calibrar: "toque a corda Lá solta" → ajusta o Lá de referência
                           └── loop por nota:
                                 pede a nota → escuta → veredito (certo / baixo / alto / oitava)
                                 → certo: avança sozinho em ~400 ms
                                 → errado: mostra a diferença e deixa tentar de novo
                           └── fim: resumo (quantas de primeira, quais custaram mais)
```

### Sequência de notas

Padrão: **a escala que o usuário acabou de montar no braço**, corda por corda
(Sol → Ré → Lá → Mi), corda solta quando ela pertence à escala + dedos 1 a 4 —
usando `stringAnswer(s, p, n)` e `midiOf(s, p, k, alt)`, que já existem em
`lib/armaduras.ts`. São 16 a 20 notas.

Alternativa a oferecer num seletor: **só a escala de 7 notas** da tonalidade
(`scale(n)`), subindo e descendo — mais curto, bom para repetir.

---

## 5. Regras de julgamento

| Parâmetro | Valor proposto | Por quê |
|---|---|---|
| Janela de análise | 2048 amostras (~43 ms a 48 kHz) | Cobre toda a faixa do jogo com folga; resposta rápida |
| `clarityThreshold` | 0.85 | Abaixo disso é ruído de arco/sala |
| `minVolumeDecibels` | −35 dB | Ignora silêncio |
| Leituras para decidir | 6 consecutivas (~250 ms) dentro de ±40 cents entre si | Descarta o ataque do arco e o glissando do dedo procurando o lugar |
| Valor final | **mediana** das leituras estáveis | Imune ao vibrato e a um outlier |
| Tolerância de acerto | ajustável: Exigente ±20 / Normal ±35 / Tranquilo ±50 cents | Um semitom é 100 cents; acima de ±50 começaria a aceitar a nota vizinha |
| Oitava errada | desvio entre 1150 e 1250 cents (para qualquer lado) | Vira aviso específico, não erro genérico |
| Lá de referência | 440 Hz, com opção 442 e calibração pela corda Lá solta | Orquestra costuma afinar em 442; violino desafinado invalidaria o exercício inteiro |

---

## 6. Permissão, privacidade e erros

- O microfone só é pedido **dentro do popup, num clique** — nunca ao carregar a página
- Tela de permissão explicando, antes de pedir: *o áudio é analisado no seu navegador,
  nada é gravado nem enviado*
- Estados a tratar: negado (`NotAllowedError`), sem microfone (`NotFoundError`), em uso
  por outro app (`NotReadableError`), contexto inseguro (sem HTTPS), navegador sem suporte
- Em cada um: mensagem clara + caminho de saída (o jogo continua funcionando sem o
  microfone; a prática é opcional)
- Ao fechar o popup ou sair da página: parar as tracks e o laço de análise

---

## 7. i18n

Bloco novo `armaduras.practice.*` nos dois dicionários (`pt-BR.json`, `en.json`),
seguindo o padrão já usado (`fmt` com `{placeholders}`): título, instrução, texto da
permissão, erros, "toque {note}", "corda {string} · {k}º dedo", baixo/alto/oitava,
rótulos do afinador, resumo final e o rótulo do botão em `armaduras.actions.practice`.

---

## 8. Fases

Cada fase fecha num estado verificável.

### Fase 1 — Ouvido (meio dia)
1. `lib/pitch.ts` com as conversões e o juiz, verificável com array de frequências sintéticas
2. `lib/audioContext.ts` + `violinSound.ts` passando a usá-lo
3. `lib/violinListen.ts` com permissão, laço e store
4. Painel de afinador cru (Hz · nota · cents · clareza) atrás de uma flag, só para validar no violino de verdade

**Pronto quando:** tocar Lá na corda Lá mostra ~440 Hz e ~0 cents, estável.

### Fase 2 — O popup (um dia)
5. `PracticeDialog.tsx`: permissão → sequência → veredito → resumo
6. Botão "Praticar no violino" no `ArmadurasGame`, visível só com `checked`
7. Trilha de notas, afinador visual, pular/repetir
8. Textos nos dois dicionários

**Pronto quando:** dá para fazer a escala inteira de ponta a ponta com o violino.

### Fase 3 — Acabamento (meio dia)
9. Calibração pela corda Lá solta + seletor 440/442
10. Seletor de tolerância e de sequência (braço inteiro × escala de 7 notas)
11. Aviso de fone / pausa da escuta enquanto a referência toca
12. Acessibilidade: `aria-live` anunciando a nota pedida e o veredito, tudo operável por teclado
13. Tema claro/escuro e largura de celular (o mesmo passe feito no resto do caderno)

---

## 9. Riscos e decisões em aberto

| Risco | Mitigação |
|---|---|
| Violino do usuário desafinado → tudo marca errado | Calibração pela corda Lá antes de começar, e aviso quando a corda solta sai muito do esperado |
| Ruído ambiente alto | `minVolumeDecibels` + `clarityThreshold`; afinador ao vivo mostra que o sinal está fraco |
| Safari/iOS: contexto suspenso, exige gesto | Pedir mic e dar `resume()` no mesmo clique; testar no iPhone antes de fechar |
| Realimentação pelo alto-falante | Pausar a escuta durante a referência; sugerir fone |
| Som do app e microfone disputando o `AudioContext` | Contexto único compartilhado |
| Sem runner de teste no projeto (não há vitest/jest) | `lib/pitch.ts` é puro e fácil de testar — vale decidir se entra um runner junto com esta feature ou se a verificação fica manual |

**Em aberto para decidir:**

1. **Sequência padrão**: braço inteiro (16–20 notas, o que o usuário acabou de montar)
   ou só a escala de 7 notas? Proposta: braço inteiro, com seletor.
2. **Pontuação**: a prática entra no placar do jogo ou tem contador próprio?
   Proposta: contador próprio, para não misturar com o acerto da armadura.
3. **Runner de teste** para `lib/pitch.ts` (ver tabela acima).
