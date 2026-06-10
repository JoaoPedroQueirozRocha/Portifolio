'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import Logo from "./Logo"
import type { Dictionary } from "@/app/[lang]/dictionaries"

interface HeaderProps {
  lang: string
  nav: Dictionary["nav"]
  themeLabel: string
}

const NAV_ROUTES = [
  { key: "home",  path: "" },
  { key: "shelf", path: "/shelf" },
  { key: "blog",  path: "/blog" },
  { key: "stats", path: "/stats" },
] as const

export default function Header({ lang, nav, themeLabel }: HeaderProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted]   = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Fecha menu ao navegar
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Trava scroll do body quando menu está aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const isScrolledOrOpen = scrolled || menuOpen

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        borderBottom: `1px solid ${isScrolledOrOpen ? "var(--line-soft)" : "transparent"}`,
        background: isScrolledOrOpen
          ? "color-mix(in oklab, var(--bg) 84%, transparent)"
          : "transparent",
        backdropFilter: isScrolledOrOpen ? "blur(16px) saturate(1.2)" : "none",
        transition: "background .3s, border-color .3s, backdrop-filter .3s",
      }}
    >
      {/* ── Barra principal ── */}
      <div className="max-w-[--maxw] mx-auto px-4 sm:px-6 lg:px-8 py-[18px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Logo href={`/${lang}`} />

        {/* Nav — visível apenas em md+ */}
        <nav className="hidden md:flex gap-[2px]">
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

        {/* Direita: tema + hamburger */}
        <div className="flex items-center gap-2">
          {/* Botão de tema */}
          <button
            onClick={toggleTheme}
            aria-label={themeLabel}
            className="w-[38px] h-[38px] rounded grid place-items-center transition-[color,border-color] duration-[180ms]"
            style={{ border: "1px solid var(--line)", color: "var(--muted)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--accent-bright)"
              ;(e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--muted)"
              ;(e.currentTarget as HTMLElement).style.borderColor = "var(--line)"
            }}
          >
            {mounted
              ? theme === "dark" ? <Sun size={16} /> : <Moon size={16} />
              : <span className="w-4 h-4" />
            }
          </button>

          {/* Hamburger — visível apenas em mobile */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="md:hidden w-[38px] h-[38px] rounded grid place-items-center transition-[color,border-color] duration-[180ms]"
            style={{ border: "1px solid var(--line)", color: "var(--muted)" }}
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* ── Drawer mobile ── */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: menuOpen ? "400px" : "0px" }}
      >
        <nav
          className="flex flex-col px-4 pb-5 pt-1"
          style={{ borderTop: "1px solid var(--line-soft)" }}
        >
          {NAV_ROUTES.map(({ key, path }) => {
            const href = `/${lang}${path}`
            const isActive = path === ""
              ? pathname === href
              : pathname.startsWith(href)

            return (
              <Link
                key={key}
                href={href}
                className="py-3 text-[16px] font-medium tracking-[.01em] transition-colors duration-[180ms]"
                style={{
                  fontFamily: "var(--font-body)",
                  color: isActive ? "var(--accent-bright)" : "var(--muted)",
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                {nav[key as keyof typeof nav]}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
