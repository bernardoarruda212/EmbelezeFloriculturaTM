import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { FiTruck, FiAward, FiHeart, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi'
import { homePageApi } from '../../api/homePageApi'
import { productsApi } from '../../api/productsApi'
import { useStoreSettings } from '../../contexts/StoreSettingsContext'
import { buildWhatsAppUrl } from '../../utils/whatsappUrl'
import { formatPhone } from '../../utils/formatPhone'
import type { HomePageSection } from '../../types/homePage'
import { HomePageSectionType } from '../../types/homePage'
import type { Product } from '../../types/product'
import ProductGrid from '../../components/products/ProductGrid'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

export default function HomePage() {
  const { settings } = useStoreSettings()
  const [sections, setSections] = useState<HomePageSection[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(true)

  const phone = settings?.whatsAppNumber || ''
  const whatsappUrl = phone
    ? buildWhatsAppUrl(phone, 'Ol\u00e1! Gostaria de mais informa\u00e7\u00f5es sobre os produtos da Floricultura Embeleze.')
    : '#'

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await homePageApi.getVisibleSections()
        setSections(res.data)
      } catch {
        setApiAvailable(false)
      } finally {
        setLoading(false)
      }
    }
    fetchSections()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsApi.getFeatured(8)
        setFeaturedProducts(res.data)
      } catch {
        // Products not available
      } finally {
        setProductsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Helper to find section by type
  const getSection = (type: HomePageSectionType) =>
    sections.find((s) => s.sectionType === type)

  // When API is unavailable or no sections defined, use defaults
  const showSection = (type: HomePageSectionType) => {
    if (!apiAvailable || sections.length === 0) return true
    const s = getSection(type)
    return s?.isVisible !== false
  }

  if (loading) {
    return <LoadingSpinner size="lg" message="Carregando..." />
  }

  // Determine section order
  const orderedTypes: HomePageSectionType[] =
    sections.length > 0
      ? sections
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((s) => s.sectionType)
      : [
          HomePageSectionType.Hero,
          HomePageSectionType.Diferenciais,
          HomePageSectionType.FeaturedProducts,
          HomePageSectionType.ContactInfo,
          HomePageSectionType.CTA,
        ]

  const renderSection = (type: HomePageSectionType) => {
    if (!showSection(type)) return null
    const section = getSection(type)

    switch (type) {
      case HomePageSectionType.Hero:
        return <HeroSection key="hero" section={section} whatsappUrl={whatsappUrl} />
      case HomePageSectionType.Diferenciais:
        return <DiferenciaisSection key="diferenciais" section={section} />
      case HomePageSectionType.FeaturedProducts:
        return (
          <FeaturedProductsSection
            key="featured"
            section={section}
            products={featuredProducts}
            isLoading={productsLoading}
          />
        )
      case HomePageSectionType.ContactInfo:
        return <ContactInfoSection key="contact-info" section={section} settings={settings} />
      case HomePageSectionType.CTA:
        return <CtaSection key="cta" section={section} whatsappUrl={whatsappUrl} />
      default:
        return null
    }
  }

  return <div>{orderedTypes.map(renderSection)}</div>
}

/* ─── Hero Section ─── */
function HeroSection({
  section,
  whatsappUrl,
}: {
  section?: HomePageSection
  whatsappUrl: string
}) {
  const title = section?.title || 'Beleza que Floresce'
  const subtitle =
    section?.subtitle ||
    'Descubra arranjos exclusivos e plantas que transformam ambientes e emocionam coracoes'

  const words = title.split(' ')
  const lastWord = words.pop()
  const firstWords = words.join(' ')

  return (
    <section className="relative bg-gradient-to-br from-brand-blue to-brand-navy text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-brand-pink/10 blur-3xl" />

        {/* Floating decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 rounded-full border-2 border-white/10 animate-float" />
        <div className="absolute bottom-1/3 left-[20%] w-12 h-12 rounded-full bg-white/5 animate-float-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-[15%] w-8 h-8 rounded-full bg-brand-pink/10 animate-float" style={{ animationDelay: '2s' }} />

        {/* Large slow-spinning decorative ring */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/5 animate-spin-slow" />

        {/* SVG flower pattern overlay */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 1000">
          <circle cx="200" cy="200" r="80" fill="white" />
          <circle cx="800" cy="300" r="60" fill="white" />
          <circle cx="500" cy="800" r="70" fill="white" />
          <circle cx="150" cy="700" r="50" fill="white" />
          <circle cx="850" cy="750" r="40" fill="white" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            {firstWords}{' '}
            <span className="text-gradient-pink-blue">{lastWord}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 bg-white text-brand-navy font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Ver Catalogo
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-green hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <FaWhatsapp className="w-5 h-5" />
              Fale Conosco
            </a>
          </div>
        </div>

        {/* Stats with glassmorphism */}
        <div className="mt-16 grid grid-cols-3 gap-4 md:gap-6 max-w-xl">
          {[
            { number: '20+', label: 'Anos de Experiencia' },
            { number: '500+', label: 'Clientes Satisfeitos' },
            { number: '100%', label: 'Flores Frescas' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-5 hover:bg-white/15 transition-all duration-300"
            >
              <div className="text-2xl md:text-3xl font-extrabold">{stat.number}</div>
              <div className="text-xs md:text-sm text-white/80 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Diferenciais Section ─── */
function DiferenciaisSection({ section }: { section?: HomePageSection }) {
  const title = section?.title || 'Por Que Escolher a Embeleze?'
  const subtitle =
    section?.subtitle ||
    'Excelencia em qualidade e atendimento personalizado para cada ocasiao especial'

  const { ref, isVisible } = useScrollAnimation()

  const diferenciais = [
    {
      icon: <FiTruck className="w-8 h-8" />,
      title: 'Entrega Rapida',
      description:
        'Entregamos o frescor das flores diretamente na sua casa, com agilidade e cuidado.',
      color: 'bg-brand-blue/10 text-brand-blue',
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: 'Qualidade Garantida',
      description:
        'Flores selecionadas diariamente, garantindo durabilidade e beleza excepcional em cada arranjo.',
      color: 'bg-brand-green/10 text-brand-green',
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: 'Atendimento Personalizado',
      description:
        'Ajuda especializada para voce escolher o presente perfeito ou criar arranjos exclusivos.',
      color: 'bg-brand-pink/10 text-brand-pink',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white relative">
      {/* Wave divider from hero */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-[1px]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
          <path d="M0,0 C300,90 900,90 1200,0 L1200,0 L0,0 Z" fill="#1a4c8a" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4 heading-ornament">{title}</h2>
          <p className="text-text-medium max-w-2xl mx-auto mt-6">{subtitle}</p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {diferenciais.map((item, i) => (
            <div
              key={item.title}
              className={`card-top-accent bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center border border-gray-50 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${item.color}`}
              >
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-text-dark mb-3">{item.title}</h3>
              <p className="text-sm text-text-medium leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Featured Products Section ─── */
function FeaturedProductsSection({
  section,
  products,
  isLoading,
}: {
  section?: HomePageSection
  products: Product[]
  isLoading: boolean
}) {
  const title = section?.title || 'Produtos em Destaque'
  const subtitle = section?.subtitle || 'Confira nossos arranjos e plantas mais populares'

  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-16 md:py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4 heading-ornament">{title}</h2>
          <p className="text-text-medium max-w-2xl mx-auto mt-6">{subtitle}</p>
        </div>

        <ProductGrid
          products={products}
          isLoading={isLoading}
          skeletonCount={4}
          emptyMessage="Em breve novos produtos!"
        />

        {products.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-navy text-white font-bold px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Contact Info Section ─── */
function ContactInfoSection({
  section,
  settings,
}: {
  section?: HomePageSection
  settings: ReturnType<typeof import('../../contexts/StoreSettingsContext').useStoreSettings>['settings']
}) {
  const title = section?.title || 'Pronto para Atende-lo'
  const subtitle = section?.subtitle || 'Entre em contato e faca seu pedido'

  const { ref, isVisible } = useScrollAnimation()

  const phone = settings?.whatsAppNumber || ''
  const email = settings?.email || ''
  const address = settings?.address
    ? `${settings.address}${settings.city ? `, ${settings.city}` : ''}${settings.state ? ` - ${settings.state}` : ''}`
    : ''
  const businessHours = settings?.businessHours || [
    { day: 'Segunda a Sexta', hours: '8h00 as 19h00' },
    { day: 'Sabados', hours: 'Fechado' },
    { day: 'Domingos', hours: '8h00 as 12h00' },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4 heading-ornament">{title}</h2>
          <p className="text-text-medium max-w-2xl mx-auto mt-6">{subtitle}</p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Business Hours Card */}
          <div
            className={`card-top-accent bg-brand-bg rounded-2xl p-8 shadow-md animate-on-scroll animate-from-left ${isVisible ? 'animate-visible' : ''}`}
          >
            <h3 className="text-lg font-bold text-text-dark mb-6 flex items-center gap-2">
              <FiClock className="w-5 h-5 text-brand-blue" />
              Horario de Funcionamento
            </h3>
            <ul className="space-y-3">
              {businessHours.map((bh, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="font-medium text-text-dark">{bh.day}</span>
                  <span className="text-text-medium">{bh.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Channels Card */}
          <div
            className={`card-top-accent bg-brand-bg rounded-2xl p-8 shadow-md animate-on-scroll animate-from-right ${isVisible ? 'animate-visible' : ''}`}
            style={{ transitionDelay: '150ms' }}
          >
            <h3 className="text-lg font-bold text-text-dark mb-6 flex items-center gap-2">
              <FiPhone className="w-5 h-5 text-brand-green" />
              Canais de Atendimento
            </h3>
            <div className="space-y-4">
              {phone && (
                <a
                  href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
                    <FaWhatsapp className="w-5 h-5 text-brand-green" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text-dark">WhatsApp</div>
                    <div className="text-sm text-text-medium">{formatPhone(phone)}</div>
                  </div>
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <FiMail className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text-dark">E-mail</div>
                    <div className="text-sm text-text-medium">{email}</div>
                  </div>
                </a>
              )}
              {address && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center">
                    <FiMapPin className="w-5 h-5 text-brand-pink" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text-dark">Endereco</div>
                    <div className="text-sm text-text-medium">{address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── CTA Section ─── */
function CtaSection({
  section,
  whatsappUrl,
}: {
  section?: HomePageSection
  whatsappUrl: string
}) {
  const title = section?.title || 'Pronto para Surpreender?'
  const subtitle =
    section?.subtitle ||
    'Entre em contato agora mesmo e faca alguem especial sorrir com nossas flores'

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-brand-pink to-brand-pink/80 text-white relative overflow-hidden">
      {/* Wave from preceding section */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-[1px]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
          <path d="M0,0 C300,90 900,90 1200,0 L1200,0 L0,0 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full border-2 border-white/10 animate-float" />
        <div className="absolute bottom-10 right-16 w-16 h-16 rounded-full bg-white/5 animate-float-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-10 h-10 rounded-full border border-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{subtitle}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-green hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <FaWhatsapp className="w-5 h-5" />
            Falar no WhatsApp
          </a>
          <Link
            to="/contato"
            className="inline-flex items-center gap-2 bg-white text-brand-pink font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <FiPhone className="w-5 h-5" />
            Outras Formas de Contato
          </Link>
        </div>
      </div>
    </section>
  )
}
