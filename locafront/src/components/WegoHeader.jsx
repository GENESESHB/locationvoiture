import { useState, useEffect } from 'react'

export default function WegoHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [])

  return (
    <header className="site-header">
      <nav className="nav" aria-label="Barre de navigation principale">
        <div className="brand"><div className="logo">W</div> WegoPro Voyages d’affaires</div>

        <div className="menu" role="menubar">
          <span className="chip" role="menuitem">🇲🇦 FR</span>
          <span className="chip" role="menuitem">MAD</span>
          <span className="chip" role="menuitem">Support</span>
          <span className="chip" role="menuitem">Mes voyages</span>
          <a className="signin" href="#" role="menuitem">S’identifier</a>
        </div>

        <button
          className="hamburger"
          aria-expanded={mobileOpen ? 'true' : 'false'}
          aria-controls="mobilePanel"
          onClick={() => setMobileOpen(v => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
          Menu
        </button>
      </nav>

      {mobileOpen && (
        <div className="mobile-panel" id="mobilePanel">
          <div className="mobile-sheet">
            <a className="mobile-item" href="#"><span>MAD</span><small>Devise</small></a>
            <a className="mobile-item" href="#"><span>Support</span><small>Aide &amp; FAQ</small></a>
            <a className="mobile-item" href="#"><span>Mes voyages</span><small>Réservations</small></a>
            <a className="mobile-item" href="#"><span>S’identifier</span><small>Compte</small></a>
          </div>
        </div>
      )}
    </header>
  )
}

