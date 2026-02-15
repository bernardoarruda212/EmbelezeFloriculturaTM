import { Link } from 'react-router-dom'
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi'
import { FaWhatsapp, FaInstagram, FaFacebookF } from 'react-icons/fa'
import { useStoreSettings } from '../../contexts/StoreSettingsContext'
import { formatPhone } from '../../utils/formatPhone'

export default function Footer() {
  const { settings } = useStoreSettings()

  const phone = settings?.whatsAppNumber || ''
  const email = settings?.email || ''
  const address = settings?.address
    ? `${settings.address}${settings.city ? `, ${settings.city}` : ''}${settings.state ? ` - ${settings.state}` : ''}`
    : ''

  return (
    <footer className="bg-brand-navy text-white">
      {/* Decorative wave separator */}
      <div className="h-[50px] md:h-[70px] -mb-[1px]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z" className="fill-brand-navy" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Column 1: Logo + description */}
            <div>
              <img
                src="/logo.png"
                alt="Floricultura Embeleze"
                className="h-12 w-auto mb-4"
              />
              <p className="text-sm text-gray-300 leading-relaxed">
                Ha mais de 20 anos trazendo beleza e emocao atraves das flores.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3 mt-5">
                {settings?.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-pink transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-4 h-4" />
                  </a>
                )}
                {settings?.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-blue transition-all duration-300"
                    aria-label="Facebook"
                  >
                    <FaFacebookF className="w-4 h-4" />
                  </a>
                )}
                {phone && (
                  <a
                    href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-green transition-all duration-300"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Column 2: Quick links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Links Rapidos
              </h3>
              <ul className="space-y-2">
                {[
                  { to: '/', label: 'Inicio' },
                  { to: '/produtos', label: 'Produtos' },
                  { to: '/sobre', label: 'Sobre Nos' },
                  { to: '/contato', label: 'Contato' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact info */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Contato
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                {phone && (
                  <li className="flex items-start gap-2">
                    <FiPhone className="w-4 h-4 mt-0.5 shrink-0 text-brand-green" />
                    <span>{formatPhone(phone)}</span>
                  </li>
                )}
                {email && (
                  <li className="flex items-start gap-2">
                    <FiMail className="w-4 h-4 mt-0.5 shrink-0 text-brand-sky" />
                    <span>{email}</span>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-2">
                    <FiMapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-pink" />
                    <span>{address}</span>
                  </li>
                )}
                {settings?.businessHours && settings.businessHours.length > 0 && (
                  <li className="flex items-start gap-2">
                    <FiClock className="w-4 h-4 mt-0.5 shrink-0 text-brand-yellow" />
                    <div className="flex flex-col">
                      {settings.businessHours.map((bh, i) => (
                        <span key={i}>
                          {bh.day}: {bh.hours}
                        </span>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/20 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Embeleze Flores e Plantas. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}
