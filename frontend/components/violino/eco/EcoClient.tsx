"use client"

import dynamic from "next/dynamic"
import type { EcoDict } from "./i18n"
import "./eco.css"

/* O sorteio da rodada e o placar do localStorage só existem no cliente —
   renderizar só lá evita divergência de hidratação. */
const EcoGame = dynamic(() => import("./EcoGame"), {
  ssr: false,
  loading: () => <div className="vl-loading" aria-busy="true" />,
})

export default function EcoClient({ t }: { t: EcoDict }) {
  return <EcoGame t={t} />
}
