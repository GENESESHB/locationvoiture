import { useState, useEffect, useRef } from 'react'

export default function WegoHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeBtnRef = useRef(null)
  const openerBtnRef = useRef(null)

  // Close on Esc key
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [])

  // Disable body scroll when menu is open
  useEffect(() => {
    const body = document.body
    if (mobileOpen) {
      body.classList.add('no-scroll')
      closeBtnRef.current?.focus()
    } else {
      body.classList.remove('no-scroll')
      openerBtnRef.current?.focus()
    }
    return () => body.classList.remove('no-scroll')
  }, [mobileOpen])

  const closeMenu = () => setMobileOpen(false)

  return (
    <header className="site-header">
      <nav className="nav" aria-label="Barre de navigation principale">
        <div className="brand">
          <div className="logo">W</div> WegoPro Voyages d’affaires
        </div>

        <div className="menu" role="menubar">
          <span className="chip" role="menuitem">About</span>
          <span className="chip" role="menuitem">Contact</span>
          <span className="chip" role="menuitem">Support</span>
          <span className="chip" role="menuitem">Expérience</span>
          <a className="signin" href="#" role="menuitem">Réserver</a>
        </div>

        <button
          ref={openerBtnRef}
          className="hamburger"
          aria-expanded={mobileOpen ? 'true' : 'false'}
          aria-controls="mobilePanel"
          onClick={() => setMobileOpen(v => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
          </svg>
          <span>Menu</span>
        </button>
      </nav>

      {mobileOpen && (
        <div
          className="mobile-panel"
          id="mobilePanel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobileMenuTitle"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu()
          }}
        >
          <div className="mobile-sheet">
            <div className="mobile-sheet__header">
              <h2 id="mobileMenuTitle">Menu</h2>
              <button
                ref={closeBtnRef}
                className="mobile-close"
                onClick={closeMenu}
                aria-label="Fermer le menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3A1 1 0 0 0 5.7 5.7L10.6 10.6 5.7 15.5a1 1 0 1 0 1.4 1.4L12 12.03l4.9 4.87a1 1 0 0 0 1.4-1.4l-4.9-4.9 4.9-4.9Z" />
                </svg>
              </button>
            </div>

            <nav className="mobile-nav">
              <a className="mobile-item" href="#"><span>À propos</span><small>Qui sommes-nous</small></a>
              <a className="mobile-item" href="#"><span>Support</span><small>Aide &amp; FAQ</small></a>
              <a className="mobile-item" href="#"><span>Expérience</span><small>Clients</small></a>
              <a className="mobile-item" href="#"><span>Réserver</span><small>services</small></a>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

