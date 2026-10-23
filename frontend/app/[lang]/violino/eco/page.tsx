import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isValidLocale } from "../../dictionaries"
import { loadEcoDict } from "@/components/violino/eco/i18n"
import EcoClient from "@/components/violino/eco/EcoClient"

export async function generateMetadata({ params }: PageProps<"/[lang]/violino/eco">): Promise<Metadata> {
  const { lang } = await params
  if (!isValidLocale(lang)) return {}
  const t = await loadEcoDict(lang)
  return { title: t.meta_title, description: t.meta_description }
}

export default async function EcoPage({ params }: PageProps<"/[lang]/violino/eco">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  return <EcoClient t={await loadEcoDict(lang)} />
}
