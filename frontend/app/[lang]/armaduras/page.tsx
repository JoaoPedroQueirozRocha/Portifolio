import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Noto_Music } from "next/font/google"
import { getDictionary, isValidLocale } from "../dictionaries"
import ArmadurasClient from "@/components/armaduras/ArmadurasClient"
import "./armaduras.css"

/* Clave de Sol (𝄞) — fonte só desta rota */
const notoMusic = Noto_Music({
  subsets: ["music"],
  weight: "400",
  variable: "--font-music",
  display: "swap",
})

export async function generateMetadata({ params }: PageProps<"/[lang]/armaduras">): Promise<Metadata> {
  const { lang } = await params
  if (!isValidLocale(lang)) return {}
  const { armaduras: t } = await getDictionary(lang)
  return { title: t.meta_title, description: t.meta_description }
}

export default async function ArmadurasPage({ params }: PageProps<"/[lang]/armaduras">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <div className={notoMusic.variable}>
      <ArmadurasClient t={dict.armaduras} />
    </div>
  )
}
