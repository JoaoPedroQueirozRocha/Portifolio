import { redirect } from "next/navigation"
import { DEFAULT_MODE } from "@/components/violino/modes"

/* /violino abre direto no primeiro modo */
export default async function ViolinoIndex({ params }: PageProps<"/[lang]/violino">) {
  const { lang } = await params
  redirect(`/${lang}/violino/${DEFAULT_MODE.slug}`)
}
