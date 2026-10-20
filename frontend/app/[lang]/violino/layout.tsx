import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Noto_Music } from "next/font/google"
import { getDictionary, isValidLocale } from "../dictionaries"
import ViolinoTabs from "@/components/violino/ViolinoTabs"
import { ViolinoProvider } from "@/components/violino/shared/text"
import "./violino.css"
import "./ajuda.css"

/* Clave de Sol (𝄞) — fonte só do Caderno de Violino */
const notoMusic = Noto_Music({
  subsets: ["music"],
  weight: "400",
  variable: "--font-music",
  display: "swap",
})

export async function generateMetadata({ params }: LayoutProps<"/[lang]/violino">): Promise<Metadata> {
  const { lang } = await params
  if (!isValidLocale(lang)) return {}
  const { violino: t } = await getDictionary(lang)
  return {
    title: { template: `%s · ${t.title} | João Pedro`, default: t.title },
    description: t.meta_description,
  }
}

export default async function ViolinoLayout({ children, params }: LayoutProps<"/[lang]/violino">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()
  const { violino } = await getDictionary(lang)

  return (
    <div className={"content-container vl " + notoMusic.variable}>
      <ViolinoProvider t={violino}>
        <ViolinoTabs lang={lang} />
        {children}
      </ViolinoProvider>
    </div>
  )
}
