import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isValidLocale } from "../../dictionaries"
import { loadRodaDict } from "@/components/violino/roda/i18n"
import RodaClient from "@/components/violino/roda/RodaClient"

export async function generateMetadata({ params }: PageProps<"/[lang]/violino/roda">): Promise<Metadata> {
  const { lang } = await params
  if (!isValidLocale(lang)) return {}
  const t = await loadRodaDict(lang)
  return { title: t.meta_title, description: t.meta_description }
}

export default async function RodaPage({ params }: PageProps<"/[lang]/violino/roda">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  return <RodaClient t={await loadRodaDict(lang)} />
}
