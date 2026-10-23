"use client"

import dynamic from "next/dynamic"
import type { RodaDict } from "./i18n"
import "./roda.css"

/* O sorteio da rodada e o placar do localStorage só existem no cliente —
   renderizar só lá evita divergência de hidratação. */
const RodaGame = dynamic(() => import("./RodaGame"), {
  ssr: false,
  loading: () => <div className="vl-loading" aria-busy="true" />,
})

export default function RodaClient({ t }: { t: RodaDict }) {
  return <RodaGame t={t} />
}
