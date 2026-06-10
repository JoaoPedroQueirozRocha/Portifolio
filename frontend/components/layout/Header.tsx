'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"
import Logo from "./Logo"
import type { Dictionary } from "@/app/[lang]/dictionaries"

interface HeaderProps {
  lang: string
  nav: Dictionary["nav"]
  themeLabel: string
}

// Rotas do site na ordem de exibição
const NAV_ROUTES = [
  { key: "home",  path: "" },
  { key: "shelf", path: "/shelf" },
  { key: "blog",  path: "/blog" },
  { key: "stats", path: "/stats" },
] as const

export default function Header({ lang, nav, themeLabel }: HeaderProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)

    function onScroll() {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        borderBottom: `1px solid ${scrolled ? "var(--line-soft)" : "transparent"}`,
        background: scrolled ? "color-mix(in oklab, var(--bg) 84%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(1.2)" : "none",
        transition: "background .3s, border-color .3s, backdrop-filter .3s",
      }}
    >
      <div
        className="max-w-[--maxw] mx-auto px-8 py-[18px] flex items-center justify-between gap-6"
      >
        {/* Logo */}
        <Logo href={`/${lang}`} />

        {/* Nav */}
        <nav className="flex gap-[2px]">
          {NAV_ROUTES.map(({ key, path }) => {
            const href = `/${lang}${path}`
            const isActive = path === ""
              ? pathname === href
              : pathname.startsWith(href)

            return (
              <Link
                key={key}
                href={href}
                className="relative px-[15px] py-2 rounded text-[15px] font-medium tracking-[.01em] transition-colors duration-[180ms]"
                style={{
                  fontFamily: "var(--font-body)",
                  color: isActive ? "var(--accent-bright)" : "var(--muted)",
                }}
              >
                {nav[key as keyof typeof nav]}

                {/* underline do item ativo */}
                {isActive && (
                  <span
                    className="absolute bottom-[2px] left-[15px] right-[15px] h-px"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Botão de tema */}
        <button
          onClick={toggleTheme}
          aria-label={themeLabel}
          className="w-[38px] h-[38px] rounded grid place-items-center transition-[color,border-color] duration-[180ms]"
          style={{
            border: "1px solid var(--line)",
            color: "var(--muted)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--accent-bright)"
            ;(e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--muted)"
            ;(e.currentTarget as HTMLElement).style.borderColor = "var(--line)"
          }}
        >
          {/* só renderiza o ícone após hidratação para evitar mismatch SSR/cliente */}
          {mounted
            ? theme === "dark"
              ? <Sun size={16} />
              : <Moon size={16} />
            : <span className="w-4 h-4" />
          }
        </button>
      </div>
    </header>
  )
}
