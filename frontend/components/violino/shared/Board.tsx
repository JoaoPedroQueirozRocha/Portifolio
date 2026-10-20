/* ---------------------------------------------------------------
   Braço do violino — container comum aos dois minijogos, para o
   braço ter sempre a mesma estrutura e medidas (violino.css, .vl-b*):

   <Board>
     <BoardRow name="Sol" cap="Corda">        ← nome da corda + trilho
       <BoardWire />                           ← a corda, no meio do trilho
       <BoardCells>{9 × <BoardCell>}</BoardCells>
       …sobreposições do jogo (dedos arrastáveis, ½)…
     </BoardRow>
   </Board>
--------------------------------------------------------------- */
import type { ReactNode } from "react"

export function Board({ children }: { children: ReactNode }) {
  return <div className="vl-board">{children}</div>
}

interface BoardRowProps {
  name: string        // nome da corda
  cap: string         // rótulo acima do nome ("Corda" / "desligada")
  off?: boolean       // corda desligada (apagada)
  after?: ReactNode   // conteúdo abaixo do trilho (ex.: resultado da corda)
  children: ReactNode // conteúdo do trilho
}

export function BoardRow({ name, cap, off, after, children }: BoardRowProps) {
  return (
    <div className={"vl-brow" + (off ? " is-off" : "")}>
      <div className="vl-sname"><span>{cap}</span><b>{name}</b></div>
      <div className="vl-track">{children}</div>
      {after}
    </div>
  )
}

export function BoardWire() {
  return <span className="vl-wire" aria-hidden="true" />
}

export function BoardCells({ children }: { children: ReactNode }) {
  return <div className="vl-cells">{children}</div>
}

export function BoardCell({ open, className, children }: { open?: boolean; className?: string; children: ReactNode }) {
  return <div className={"vl-cell" + (open ? " is-open" : "") + (className ? " " + className : "")}>{children}</div>
}
