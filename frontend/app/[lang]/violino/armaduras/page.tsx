import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDictionary, isValidLocale } from "../../dictionaries"
import ArmadurasClient from "@/components/violino/armaduras/ArmadurasClient"
import "./armaduras.css"
import "./pratica.css"

export async function generateMetadata({ params }: PageProps<"/[lang]/violino/armaduras">): Promise<Metadata> {
  const { lang } = await params
  if (!isValidLocale(lang)) return {}
  const { armaduras: t } = await getDictionary(lang)
  return { title: t.meta_title, description: t.meta_description }
}

export default async function ArmadurasPage({ params }: PageProps<"/[lang]/violino/armaduras">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return <ArmadurasClient t={dict.armaduras} />
}
