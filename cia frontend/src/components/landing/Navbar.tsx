import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { LANDING_BRAND_NAME, LANDING_NAV_ITEMS } from '../../data/landingContent'

type NavbarProps = {
  loginPath?: string
}

export function Navbar({ loginPath = '/login' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const isLoggedIn = Boolean(user)

  const handleCloseMenu = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleSectionNavigation = useCallback(
    (sectionId: string) => {
      const section = document.getElementById(sectionId)
      if (!section) {
        return
      }
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      handleCloseMenu()
    },
    [handleCloseMenu],
  )

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Link
          to="/"
          className="relative text-sm font-extrabold uppercase tracking-[0.22em] text-cyan-200 drop-shadow-[0_0_16px_rgba(34,211,238,0.45)]"
        >
          {LANDING_BRAND_NAME}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {LANDING_NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSectionNavigation(item.sectionId)}
              className="rounded-full px-3 py-1 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/60 hover:text-slate-100"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {!isLoggedIn ? (
          <div className="hidden md:block">
            <Link
              to={loginPath}
              className="rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_10px_25px_rgba(56,189,248,0.35)] transition hover:brightness-105"
            >
              Login
            </Link>
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation menu"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-slate-500 md:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-slate-800 bg-slate-950 px-6 py-4 md:hidden"
          aria-label="Mobile primary"
        >
          <div className="flex flex-col gap-3">
            {LANDING_NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSectionNavigation(item.sectionId)}
                className="rounded-md px-1 py-2 text-left text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-slate-100"
              >
                {item.label}
              </button>
            ))}
              {!isLoggedIn ? (
                <Link
                  to={loginPath}
                  onClick={handleCloseMenu}
                  className="mt-1 rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 px-4 py-2 text-center text-sm font-semibold text-slate-950 shadow-[0_10px_25px_rgba(56,189,248,0.35)] transition hover:brightness-105"
                >
                  Login
                </Link>
              ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
