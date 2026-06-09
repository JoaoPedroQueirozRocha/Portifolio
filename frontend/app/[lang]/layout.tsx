import { notFound } from "next/navigation"
import { isValidLocale, locales } from "@/lib/i18n"
import Header from "@/components/layout/Header"
import { getDictionary } from "./dictionaries"
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params

  if (!isValidLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  

  return (
    <>
    {/* TODO: fix this type error */}
      <Header dict={dict.nav as any} />
      {children}
    </>
  )
}
