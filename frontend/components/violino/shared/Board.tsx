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
import type { CSSProperties, ReactNode } from "react"

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

/** `cols`: nº de casas do trilho (padrão 9: corda solta + 8) */
export function BoardCells({ cols, children }: { cols?: number; children: ReactNode }) {
  const style = cols ? ({ "--cols": cols } as CSSProperties) : undefined
  return <div className="vl-cells" style={style}>{children}</div>
}

export function BoardCell({ open, className, children }: { open?: boolean; className?: string; children: ReactNode }) {
  return <div className={"vl-cell" + (open ? " is-open" : "") + (className ? " " + className : "")}>{children}</div>
}
