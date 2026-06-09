import type { Metadata } from "next"
import {
  IM_Fell_English,
  Cormorant_Garamond,
  EB_Garamond,
  Cinzel,
  JetBrains_Mono,
} from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

/* ---------------------------------------------------------------
   Fontes — exatamente as do design

   --font-display : IM Fell English   → títulos principais
   --font-alt     : Cormorant Garamond → display suave, itálicos
   --font-body    : EB Garamond        → corpo de texto
   --font-caps    : Cinzel             → small-caps / labels
   --font-mono    : JetBrains Mono     → tags, metadados, código
--------------------------------------------------------------- */
const imFell = IM_Fell_English({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-alt",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
})

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-caps",
  weight: ["400", "500"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
})

/* ---------------------------------------------------------------
   Metadata base
--------------------------------------------------------------- */
export const metadata: Metadata = {
  title: {
    template: "%s | João Pedro",
    default: "João Pedro — Desenvolvedor Full Stack",
  },
  description:
    "Portfolio de João Pedro: projetos, estante de mídia e blog técnico.",
}

/* ---------------------------------------------------------------
   Root Layout
--------------------------------------------------------------- */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={[
        imFell.variable,
        cormorant.variable,
        ebGaramond.variable,
        cinzel.variable,
        jetbrainsMono.variable,
      ].join(" ")}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
