'use client'

import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import Link from "next/link"
import Logo from "./Logo"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg border-b border-line-soft py-4">
      <div className="content-container flex items-center justify-between">
        <Logo></Logo>
        <nav className="flex items-center gap-4">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}