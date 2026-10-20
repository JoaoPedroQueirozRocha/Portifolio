"use client"

import dynamic from "next/dynamic"
import type { Dictionary } from "@/app/[lang]/dictionaries"

/* A partitura é sorteada e o placar vem do localStorage — renderizar só
   no cliente evita divergência de hidratação. */
const OndeTocarGame = dynamic(() => import("./OndeTocarGame"), {
  ssr: false,
  loading: () => <div className="vl-loading" aria-busy="true" />,
})

interface Props {
  t: Dictionary["onde_tocar"]
  help: Dictionary["armaduras"] // textos do balão "Como ler uma armadura"
}

export default function OndeTocarClient({ t, help }: Props) {
  return <OndeTocarGame t={t} help={help} />
}
