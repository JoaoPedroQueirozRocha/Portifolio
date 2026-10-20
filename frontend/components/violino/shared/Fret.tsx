"use client"

import type { ButtonHTMLAttributes } from "react"
import { useViolinoText } from "./text"

/* ---------------------------------------------------------------
   Casa do braço — componente único dos dois minijogos, para as casas
   terem sempre o mesmo visual: número no canto, círculo com a nota
   sobre a corda e o rótulo embaixo ("solta" / "dedo N" / aviso).
   O layout (onde a casa fica) é do jogo; cores e formas: violino.css.
--------------------------------------------------------------- */

/** scale = nota da escala (clara) · out = fora da escala (apagada) · neutral = sem destaque */
export type FretTone = "scale" | "out" | "neutral"
export type FretState = "" | "ok" | "bad" | "fix" | "alt"

/** Nome da nota com o ♯/♭ separado (mesma cor da nota) — "Fá" + "♯" */
export function NoteText({ name }: { name: string }) {
  const last = name.slice(-1)
  if (last !== "♯" && last !== "♭") return <>{name}</>
  return <>{name.slice(0, -1)}<span className="vl-acc">{last}</span></>
}

interface FretCellProps {
  name: string             // texto do círculo (nota, nº do dedo ou vazio)
  tone: FretTone
  number?: number          // nº da casa no canto (omitido na corda solta)
  open?: boolean           // coluna da corda solta
  finger?: number | null   // "dedo N" embaixo
  note?: string            // aviso no lugar do dedo (era aqui / também vale)
  state?: FretState        // resultado ao responder
  struck?: boolean         // corda solta fora da escala (riscada)
  dotClassName?: string    // posicionamento do círculo no jogo
  /** false = casa vazia, sem círculo (no Armaduras, só onde há dedo); o nome vai para o rótulo */
  dot?: boolean
  title?: string
  /** com `button`, o círculo é clicável; sem, é só visual */
  button?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "type" | "title">
}

export function FretCell({
  name, tone, number, open, finger, note, state = "", struck, dotClassName, title, button, dot = true,
}: FretCellProps) {
  const t = useViolinoText().fret
  const dotCls =
    "vl-dot is-" + tone +
    (open ? " is-open" : "") +
    (state ? " is-" + state : "") +
    (struck ? " is-struck" : "") +
    (dotClassName ? " " + dotClassName : "")
  const content = <NoteText name={name} />

  return (
    <>
      {number !== undefined && !open && <span className="vl-fret-n" aria-hidden="true">{number}</span>}
      {!dot ? null : button
        ? <button type="button" className={dotCls} title={title} {...button}>{content}</button>
        : <span className={dotCls} title={title} aria-hidden={title ? undefined : true}>{content}</span>}
      {!dot
        ? <span className={"vl-fret-lab is-" + tone}>{content}</span>
        : note
        ? <span className="vl-fret-lab is-note">{note}</span>
        : open
          ? <span className="vl-fret-lab">{t.open}</span>
          : finger
            ? <span className="vl-fret-lab"><span className="vl-fret-word">{t.finger} </span>{finger}</span>
            : null}
    </>
  )
}
