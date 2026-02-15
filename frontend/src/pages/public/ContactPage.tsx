import { useState, useEffect } from 'react'
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiChevronDown, FiCheck } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { contactApi } from '../../api/contactApi'
import { useStoreSettings } from '../../contexts/StoreSettingsContext'
import { formatPhone } from '../../utils/formatPhone'
import { buildWhatsAppUrl } from '../../utils/whatsappUrl'
import type { Faq } from '../../types/contact'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ContactPage() {
  const { settings } = useStoreSettings()

  // Contact form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  // FAQ state
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [faqsLoading, setFaqsLoading] = useState(true)
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  const phone = settings?.whatsAppNumber || ''
  const email = settings?.email || ''
  const address = settings?.address
    ? `${settings.address}${settings.city ? `, ${settings.city}` : ''}${settings.state ? ` - ${settings.state}` : ''}`
    : ''
  const businessHours = settings?.businessHours || []
  const mapsUrl = settings?.googleMapsEmbedUrl || ''

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await contactApi.listFaqs()
        setFaqs(res.data)
      } catch {
        // FAQs not available
      } finally {
        setFaqsLoading(false)
      }
    }
    fetchFaqs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formMessage.trim()) return

    setSubmitting(true)
    setSubmitError(false)
    try {
      await contactApi.send({
        name: formName,
        phone: formPhone || undefined,
        subject: formSubject || undefined,
        message: formMessage,
      })
      setSubmitSuccess(true)
      setFormName('')
      setFormPhone('')
      setFormSubject('')
      setFormMessage('')
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  const subjectOptions = [
    'Informacoes sobre produtos',
    'Orcamento de arranjo',
    'Encomenda especial',
    'Reclamacao',
    'Elogio',
    'Outro',
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-blue text-white py-16 md:py-24 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-[15%] w-20 h-20 rounded-full border-2 border-white/10 animate-float" />
          <div className="absolute bottom-1/3 left-[20%] w-12 h-12 rounded-full bg-white/5 animate-float-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/5 animate-spin-slow" />
          <svg className="absolute top-0 left-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 1000">
            <circle cx="200" cy="200" r="80" fill="white" />
            <circle cx="800" cy="300" r="60" fill="white" />
            <circle cx="500" cy="800" r="70" fill="white" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Fale Conosco</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Estamos prontos para atende-lo. Entre em contato pelo canal de sua preferencia.
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-12 md:py-16 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20">
            {/* WhatsApp */}
            {phone && (
              <a
                href={buildWhatsAppUrl(phone, 'Ol\u00e1! Gostaria de mais informa\u00e7\u00f5es.')}
                target="_blank"
                rel="noopener noreferrer"
                className="card-top-accent bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-green/20 transition-colors">
                  <FaWhatsapp className="w-7 h-7 text-brand-green" />
                </div>
                <h3 className="text-sm font-bold text-text-dark mb-1">WhatsApp</h3>
                <p className="text-sm text-text-medium">{formatPhone(phone)}</p>
              </a>
            )}

            {/* Phone */}
            {(settings?.phoneNumber || phone) && (
              <a
                href={`tel:+${(settings?.phoneNumber || phone).replace(/\D/g, '')}`}
                className="card-top-accent bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-blue/20 transition-colors">
                  <FiPhone className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="text-sm font-bold text-text-dark mb-1">Telefone</h3>
                <p className="text-sm text-text-medium">{formatPhone(settings?.phoneNumber || phone)}</p>
              </a>
            )}

            {/* Email */}
            {email && (
              <a
                href={`mailto:${email}`}
                className="card-top-accent bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-pink/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-pink/20 transition-colors">
                  <FiMail className="w-7 h-7 text-brand-pink" />
                </div>
                <h3 className="text-sm font-bold text-text-dark mb-1">E-mail</h3>
                <p className="text-sm text-text-medium break-all">{email}</p>
              </a>
            )}

            {/* Address */}
            {address && (
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-yellow/10 flex items-center justify-center mx-auto mb-4">
                  <FiMapPin className="w-7 h-7 text-brand-yellow" />
                </div>
                <h3 className="text-sm font-bold text-text-dark mb-1">Endereco</h3>
                <p className="text-sm text-text-medium">{address}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Business Hours */}
      {businessHours.length > 0 && (
        <section className="py-8 bg-brand-bg">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2 justify-center">
                <FiClock className="w-5 h-5 text-brand-blue" />
                Horario de Funcionamento
              </h3>
              <div className="space-y-2">
                {businessHours.map((bh, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="font-medium text-text-dark">{bh.day}</span>
                    <span className="text-text-medium">{bh.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact form + Map */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-dark mb-2 heading-ornament">
                Envie sua Mensagem
              </h2>
              <p className="text-text-medium mb-8">
                Preencha o formulario abaixo e retornaremos o mais breve possivel.
              </p>

              {submitSuccess ? (
                <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-brand-green" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-green mb-2">Mensagem enviada!</h3>
                  <p className="text-sm text-text-medium mb-4">
                    Obrigado por entrar em contato. Retornaremos em breve.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="text-sm font-medium text-brand-blue hover:underline"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-text-dark block mb-1.5">Nome *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-dark block mb-1.5">Telefone</label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-dark block mb-1.5">Assunto</label>
                    <select
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300 cursor-pointer"
                    >
                      <option value="">Selecione um assunto</option>
                      {subjectOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-dark block mb-1.5">Mensagem *</label>
                    <textarea
                      required
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300 resize-none"
                      placeholder="Como podemos ajuda-lo?"
                    />
                  </div>

                  {submitError && (
                    <p className="text-sm text-red-500">
                      Erro ao enviar mensagem. Por favor, tente novamente ou entre em contato pelo WhatsApp.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-navy text-white font-bold py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60"
                  >
                    <FiSend className="w-4 h-4" />
                    {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                  </button>
                </form>
              )}
            </div>

            {/* Map */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-dark mb-2 heading-ornament">
                Nossa Localizacao
              </h2>
              <p className="text-text-medium mb-8">
                Venha nos visitar! Estamos localizados em um ponto de facil acesso.
              </p>

              <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-md aspect-[4/3]">
                {mapsUrl ? (
                  <iframe
                    src={mapsUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localizacao da Floricultura Embeleze"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-light p-8 text-center">
                    <FiMapPin className="w-12 h-12 mb-4 text-brand-blue/30" />
                    <p className="text-sm font-medium">
                      {address || 'Tres de Maio - RS'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {!faqsLoading && faqs.length > 0 && (
        <section className="py-16 md:py-24 bg-brand-bg">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4 heading-ornament">
                Perguntas Frequentes
              </h2>
              <p className="text-text-medium">
                Tire suas duvidas sobre nossos produtos e servicos
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-sm font-semibold text-text-dark pr-4">
                      {faq.question}
                    </span>
                    <FiChevronDown
                      className={`w-5 h-5 shrink-0 text-text-light transition-transform duration-300 ${
                        openFaqId === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaqId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-5 text-sm text-text-medium leading-relaxed border-t border-gray-50 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqsLoading && (
        <section className="py-16 bg-brand-bg">
          <LoadingSpinner size="sm" message="Carregando perguntas frequentes..." />
        </section>
      )}
    </div>
  )
}
