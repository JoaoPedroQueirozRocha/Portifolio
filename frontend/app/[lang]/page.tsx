import { notFound } from "next/navigation"
import { getDictionary, isValidLocale } from "./dictionaries"
import Portrait from "@/components/layout/Portrait"
import Bio from "@/components/layout/Bio"
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <main className="content-container flex flex-col">
      {/* Hero sample */}

      <section className="flex flex-row gap-10">
        <Portrait portrait={dict.portrait} />
        <Bio hero={dict.hero} />
      </section>


      

    </main>
  )
}
