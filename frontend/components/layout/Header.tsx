'use client'

import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import Link from "next/link"
import Logo from "./Logo"
import { Button } from "@/components/ui/button"
import { Dictionary } from "@/app/[lang]/dictionaries"

interface NavTranslations {
    home: string
    about: string
    contact: string
    shelf: string
    blog: string
    stats: string
}

export default function Header({dict}: {dict: NavTranslations}) {


    return (
    <header className="sticky top-0 z-50 backdrop-blur-lg py-4 mx-16">
      <div className="content-container flex items-center justify-between">
        <Logo/>
        <nav className="flex items-center gap-4 color-muted">
          <Link href="/">{dict.home}</Link>
          <Link href="/about">{dict.shelf}</Link>
        </nav>
        <Button variant="outline" size="icon-lg">
          <Sun className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}