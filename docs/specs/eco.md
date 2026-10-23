# Eco — pegar a nota de ouvido

Brief da feature para desenho e implementação. Modo novo do Caderno de Violino.

---

## 1. Para que serve

Durante uma música, a pessoa erra uma nota e perde o lugar. Para se recuperar, precisa
**ouvir onde a melodia está e achar a nota certa no braço sem ler o nome dela**, a tempo de
seguir tocando.

O Eco treina exatamente isso: **ouvir uma nota, entender onde ela está em relação à música
e encontrá-la no braço de ouvido**, partindo do ponto onde a mão já está.

Não é um jogo de memória (o "Simon" que cogitamos antes). É treino de **recuperação**.

### O que ele treina
1. Ouvir uma altura e localizá-la no braço (ouvido → dedo).
2. Ouvir a nota **dentro da tonalidade**: sentir se é a tônica, a terça, a sensível…
3. Calcular a distância a partir de onde a mão está ("estou no Ré, a nota é duas casas acima").
4. Corrigir rápido: ouvir o que se tocou, comparar com o alvo e ajustar.

### O que ele não faz
- Não depende de ler partitura (a pauta é opcional e fica escondida por padrão).
- Não é cronometrado como a Corrida: aqui o objetivo é acertar o ouvido, não a velocidade.

---

## 2. Como se joga (uma rodada de 8 notas)

1. **Contexto.** O jogo toca a tonalidade (a tônica, ou um pequeno trecho da escala) para a
   pessoa "entrar na música". Há um botão para ouvir o contexto de novo.
2. **Você está aqui.** O braço marca a **última nota "tocada"** (onde a mão está). É o ponto
   de partida, como na situação real.
3. **Nota-alvo.** O jogo toca a nota que vem a seguir. A pessoa não vê o nome dela.
4. **Procurar.** A pessoa toca uma casa no braço. Cada toque **soa** (a pessoa ouve o que
   escolheu e compara com o alvo). Pode ouvir o alvo de novo quando quiser.
5. **Resultado.** Acertou: a casa fica verde e o jogo mostra o nome, a corda/dedo e a
   relação com a tonalidade ("3º grau — Fá♯, quatro meios-tons acima do Ré").
   Errou: recebe uma dica e tenta de novo, até 3 tentativas. Depois da terceira, o jogo
   revela a resposta e conta como erro.
6. A nota-alvo vira o novo "você está aqui" e começa a próxima. Ao fim das 8, aparece o
   resumo.

**Só a altura conta.** Lá⁴ na corda Ré (3º dedo) e Lá⁴ na corda Lá (solta) valem igual.

### Níveis (mesmo padrão de perfis do Onde tocar)
| Nível | Distância da nota atual | Notas |
|---|---|---|
| Iniciante | até 2 graus da escala | só da escala |
| Médio | até uma 5ª | só da escala |
| Avançado | qualquer na 1ª posição | inclui notas fora da escala (cromáticas) |

### Dica de direção (opcional, ligada por padrão)
Depois de um erro: "mais agudo ▲" ou "mais grave ▼". Não diz a distância.

### Ajustes
Nível · Tonalidade (sorteada ou fixa; até 2 acidentes no iniciante) · Contexto (tônica /
trecho da escala / nenhum) · Dica de direção · Mostrar pauta (desligado por padrão).

### Pontuação
- Acertos de primeira, média de tentativas, sequência.
- No resumo: quais notas deram mais trabalho e quais saltos (intervalos) foram mais difíceis.

---

## 3. Estados e telas para desenhar

1. **Som desligado.** O modo é de ouvir, então exige som. Tela inicial explicando isso, com o
   botão "Ligar o som". Subestados: carregando, erro ao carregar.
2. **Pronto.** Tonalidade, botão "Ouvir" e o braço com o "você está aqui".
3. **Ouvindo o contexto.** Indicador de que algo está tocando.
4. **Procurando.** Braço ativo; contador de tentativas (3 marcas); botões "Ouvir o alvo" e
   "Ouvir o contexto".
5. **Toque errado.** A casa tocada marcada; dica de direção (texto + seta, não só cor);
   tentativas restantes.
6. **Acerto.** Casa verde; nome da nota, corda e dedo; relação com a tonalidade.
7. **Revelado.** Depois da 3ª tentativa: a casa certa destacada e tocada; mensagem neutra.
8. **Resumo da rodada.** As 8 notas em fila com o nº de tentativas de cada uma, média,
   mais difíceis; botões "Nova rodada" e "Treinar as difíceis".
9. **Painel de ajustes** (como o do Onde tocar) e a versão **mobile** (390 px), que deve
   seguir o braço compacto já existente (círculos estreitos, só o nº do dedo).
10. **Opcional:** variante "tocar no violino de verdade", com microfone (ver seção 6).

---

## 4. Restrições do design (para ficar na mesma família do Caderno)

- Mesma linguagem visual dos outros modos: fólio com os quatro cantos, tipografia e tokens
  de cor do tema (claro e escuro). Referência: o artboard do Onde tocar.
- **Braço:** 4 cordas × 9 colunas (corda solta + 8 casas de meio tom), mesma estrutura do
  Onde tocar. Estados de casa já existentes: neutro, certo, errado, "era aqui", "também vale".
  Precisa ganhar um estado novo: **"você está aqui"**.
- Cabeçalho com placar (Acertos, Sequência, Tentativas), barra de ajustes e linha de
  mensagem, como nos outros modos.
- Toque mínimo de 44 px. O resultado nunca depende só de cor (texto e ícone também).
- Teclado: **espaço** = ouvir o alvo de novo.
- É um modo de áudio: precisa ficar claro **quando algo está tocando** (indicador visual).

---

## 5. Textos de referência (pt-BR, para o design)

- Aba: **Eco** · "ache a nota de ouvido"
- Título: "Ache a nota de ouvido"
- Subtítulo: "Ouça a nota e encontre-a no braço, partindo de onde sua mão está — como quando
  você erra no meio de uma música e precisa pegar a nota da frente."
- Estado inicial: "Ouça o contexto e depois a nota. Sem ver o nome."
- Dica: "Mais agudo ▲" / "Mais grave ▼"
- Acerto: "Isso — Fá♯, 3º grau de Ré maior. Quatro meios-tons acima do Ré."
- Revelado: "Era Fá♯ — corda Ré, 4º dedo. Ouça de novo e compare."

---

## 6. Decisões em aberto (precisam de resposta antes de fechar o design)

1. **Tocar no violino de verdade.** O uso real é com o instrumento. A tela com o braço é um
   substituto prático; o ideal é a pessoa **tocar no violino e o app ouvir** (já temos
   afinador e detecção de altura). Entra neste desenho já como um segundo modo de entrada,
   ou numa fase seguinte? Recomendação: desenhar o espaço dele (botão no cabeçalho), mas
   entregar primeiro o toque na tela.
2. **Número de tentativas:** 3, ou ilimitado?
3. **Mostrar a pauta:** escondida por padrão (treina ouvido puro) ou visível?
4. **Contexto padrão:** só a tônica, ou um pequeno trecho da escala?

---

## 7. Notas técnicas (para quem implementa)

- Pasta autocontida: `components/violino/eco/` com `logic.ts` (gerador e regras, puro, com
  testes), `reducer.ts`, `EcoGame.tsx`, `EcoClient.tsx`, `i18n/` e `eco.css`, no mesmo molde
  de `components/violino/roda/`.
- Reaproveitar: `playMidi` e o estado global de som (`lib/violinSound.ts`), `places()` e
  `OPEN_MIDI` (`lib/leitura.ts`), `Board`/`FretCell`/`Seg`/`ScoreBoard`, `keyAcc`/`scale`
  (`lib/armaduras.ts`).
- **Pré-requisitos no núcleo:**
  - Mover o `Fingerboard` de `onde-tocar/` para `shared/`, genérico (hoje depende do
    dicionário e da configuração do Onde tocar) e com o estado "você está aqui".
  - `playSequence(notas, intervalo)` com cancelamento ao sair da tela (hoje `playMidi`
    interrompe a nota anterior).
  - Cada toque no braço deve tocar a nota (feedback de ouvido).
- Persistência: placar e ajustes em `eco:v1` no localStorage.
