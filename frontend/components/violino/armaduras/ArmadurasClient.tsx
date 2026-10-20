"use client"

import dynamic from "next/dynamic"
import type { ArmDict } from "./text"

/* O jogo sorteia rodadas e lê o placar do localStorage — renderizar só no
   cliente evita divergência de hidratação. */
const ArmadurasGame = dynamic(() => import("./ArmadurasGame"), {
  ssr: false,
  loading: () => <div className="vl-loading" aria-busy="true" />,
})

export default function ArmadurasClient({ t }: { t: ArmDict }) {
  return <ArmadurasGame t={t} />
}
