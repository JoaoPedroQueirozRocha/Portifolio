import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDictionary, isValidLocale } from "../../dictionaries"
import OndeTocarClient from "@/components/violino/onde-tocar/OndeTocarClient"
import "./onde-tocar.css"

export async function generateMetadata({ params }: PageProps<"/[lang]/violino/onde-tocar">): Promise<Metadata> {
  const { lang } = await params
  if (!isValidLocale(lang)) return {}
  const { onde_tocar: t } = await getDictionary(lang)
  return { title: t.meta_title, description: t.meta_description }
}

export default async function OndeTocarPage({ params }: PageProps<"/[lang]/violino/onde-tocar">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return <OndeTocarClient t={dict.onde_tocar} help={dict.armaduras} />
}
