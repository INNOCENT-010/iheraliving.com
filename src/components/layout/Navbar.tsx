'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/hooks/useTheme'

const NAV_LINKS = [
  { href: '/surfaces',   label: 'Surfaces'   },
  { href: '/lighting',   label: 'Lighting'   },
  { href: '/objects',    label: 'Objects'    },
  { href: '/textiles',   label: 'Textiles'   },
  { href: '/collection', label: 'Collection' },
  { href: '/studio',     label: 'Studio'     },
  { href: '/journal',    label: 'Journal'    },
  { href: '/contact',    label: 'Contact'    },
]

function IheraLogo({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* I — left vertical */}
      <rect x="14" y="10" width="9" height="78" rx="1" fill="currentColor" />
      {/* Serif top I */}
      <rect x="8"  y="10" width="21" height="3.5" rx="1" fill="currentColor" />
      {/* Serif bottom I */}
      <rect x="8"  y="84" width="21" height="3.5" rx="1" fill="currentColor" />

      {/* h — right vertical */}
      <rect x="58" y="10" width="9" height="78" rx="1" fill="currentColor" />
      {/* Serif top h */}
      <rect x="52" y="10" width="21" height="3.5" rx="1" fill="currentColor" />
      {/* Serif bottom h */}
      <rect x="52" y="84" width="21" height="3.5" rx="1" fill="currentColor" />

      {/* Arch connecting I to h */}
      <path
        d="M23 22 C23 22 40 18 52 36"
        stroke="currentColor"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />

      {/* Apostrophe */}
      <ellipse cx="56" cy="7" rx="3" ry="5" fill="currentColor" />
    </svg>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isHome   = pathname === '/'
  const isDark   = theme === 'dark'
  const onHero   = isHome && !scrolled
  const linkColor = open
    ? '#f5f0e8'
    : onHero
      ? 'rgba(245,240,232,0.85)'
      : isDark ? 'rgba(245,240,232,0.7)' : 'rgba(14,12,8,0.65)'

  const activeLinkColor = open ? '#b8924a' : isDark ? '#b8924a' : '#6b4f18'

  return (
    <>
      {/* ── Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          height:          '68px',
          backgroundColor: open
            ? 'transparent'
            : scrolled || !isHome
              ? isDark
                ? 'rgba(13,13,13,0.95)'
                : 'rgba(250,247,242,0.95)'
              : 'transparent',
          backdropFilter:  !open && (scrolled || !isHome) ? 'blur(16px)' : 'none',
          borderBottom:    !open && (scrolled || !isHome)
            ? `1px solid ${isDark ? 'rgba(184,146,74,0.1)' : 'rgba(0,0,0,0.06)'}`
            : 'none',
        }}
      >
        <div className="h-full flex items-center justify-between px-8 md:px-12">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-75 shrink-0"
            style={{ color: open ? '#f5f0e8' : onHero ? '#f5f0e8' : isDark ? '#f5f0e8' : '#0a0805' }}
          >
            <IheraLogo size={34} />
            <div className="flex flex-col leading-none">
              <span className="font-display text-sm tracking-[0.22em]">
                IHE&apos;RA
              </span>
              <div className="flex items-center gap-1 my-0.5">
                <div className="h-px flex-1" style={{ backgroundColor: 'currentColor', opacity: 0.35 }} />
                <div className="h-1 w-px" style={{ backgroundColor: 'currentColor', opacity: 0.35 }} />
                <div className="h-px flex-1" style={{ backgroundColor: 'currentColor', opacity: 0.35 }} />
              </div>
              <span className="font-body text-[6px] tracking-[0.22em] uppercase" style={{ opacity: 0.55 }}>
                Curated Living
              </span>
            </div>
          </Link>

          {/* Center nav links — visible on desktop */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-[10px] tracking-widest uppercase transition-colors duration-300 hover:opacity-100"
                  style={{
                    color:         active ? activeLinkColor : linkColor,
                    fontWeight:    active ? 400 : 300,
                    borderBottom:  active ? `1px solid ${activeLinkColor}` : '1px solid transparent',
                    paddingBottom: '2px',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right — icons + hamburger */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="transition-opacity hover:opacity-60 hidden md:block"
              style={{ color: open ? '#f5f0e8' : onHero ? '#f5f0e8' : isDark ? '#f5f0e8' : '#0a0805' }}
              title="Toggle theme"
            >
              {isDark ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="transition-opacity hover:opacity-60 hidden md:block"
              style={{ color: open ? '#f5f0e8' : onHero ? '#f5f0e8' : isDark ? '#f5f0e8' : '#0a0805' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setOpen(v => !v)}
              className="flex flex-col justify-center items-end gap-[5px] w-7 h-7 transition-opacity hover:opacity-60"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span
                className="block h-px transition-all duration-300 origin-center"
                style={{
                  width:           '100%',
                  backgroundColor: open ? '#f5f0e8' : onHero ? '#f5f0e8' : isDark ? '#f5f0e8' : '#0a0805',
                  transform:       open ? 'translateY(5px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block h-px transition-all duration-200"
                style={{
                  width:           '65%',
                  backgroundColor: open ? '#f5f0e8' : onHero ? '#f5f0e8' : isDark ? '#f5f0e8' : '#0a0805',
                  opacity:         open ? 0 : 1,
                  transform:       open ? 'scaleX(0)' : 'none',
                }}
              />
              <span
                className="block h-px transition-all duration-300 origin-center"
                style={{
                  width:           '80%',
                  backgroundColor: open ? '#f5f0e8' : onHero ? '#f5f0e8' : isDark ? '#f5f0e8' : '#0a0805',
                  transform:       open ? 'translateY(-5px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ── Fullscreen overlay ── */}
      <div
        className="fixed inset-0 z-40 flex flex-col justify-between px-10 md:px-20 pt-28 pb-12"
        style={{
          backgroundColor: '#0d0d0d',
          opacity:          open ? 1 : 0,
          pointerEvents:    open ? 'all' : 'none',
          transform:        open ? 'translateY(0)' : 'translateY(-6px)',
          transition:       'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        {/* Big nav links */}
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display block transition-all duration-300 hover:opacity-50 w-fit"
              style={{
                fontSize:        'clamp(2.2rem, 5.5vw, 4.5rem)',
                color:           pathname === link.href ? '#b8924a' : '#f5f0e8',
                opacity:         open ? 1 : 0,
                transform:       open ? 'translateX(0)' : 'translateX(-16px)',
                transition:      `opacity 0.5s ease ${i * 55}ms, transform 0.5s ease ${i * 55}ms, color 0.3s ease`,
                lineHeight:      1.15,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bottom info */}
        <div
          className="flex items-end justify-between border-t pt-6"
          style={{
            borderColor:    'rgba(184,146,74,0.15)',
            opacity:         open ? 1 : 0,
            transform:       open ? 'translateY(0)' : 'translateY(8px)',
            transition:      'opacity 0.5s ease 420ms, transform 0.5s ease 420ms',
          }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,240,232,0.3)' }}>
              Lagos, Nigeria
            </span>
            <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,240,232,0.25)' }}>
              Curated Living.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="font-body text-[9px] tracking-widest uppercase transition-opacity hover:opacity-60"
              style={{ color: 'rgba(245,240,232,0.35)' }}
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="font-body text-[9px] tracking-widest uppercase transition-opacity hover:opacity-60"
              style={{ color: 'rgba(245,240,232,0.35)' }}
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </>
  )
}