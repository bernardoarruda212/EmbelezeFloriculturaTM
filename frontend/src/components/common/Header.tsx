import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-white/98 backdrop-blur-md border-b-2 border-brand-pink-light ${
        scrolled ? 'shadow-lg shadow-brand-pink/5' : 'shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <img
              src="/logo.png"
              alt="Floricultura Embeleze"
              className="h-[50px] w-auto"
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-all duration-300 py-1 ${
                    isActive
                      ? 'text-brand-pink border-b-2 border-brand-pink'
                      : 'text-brand-navy hover:text-brand-pink relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-pink after:transition-all after:duration-300 hover:after:w-full'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-text-dark hover:text-brand-blue hover:bg-brand-bg transition-all duration-300"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation - slide in */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-4 py-3 space-y-1 bg-white border-t border-gray-100">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-pink-light text-brand-pink'
                    : 'text-text-dark hover:bg-brand-bg hover:text-brand-blue'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
