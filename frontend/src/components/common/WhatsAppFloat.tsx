import { FaWhatsapp } from 'react-icons/fa'
import { useStoreSettings } from '../../contexts/StoreSettingsContext'
import { buildWhatsAppUrl } from '../../utils/whatsappUrl'

export default function WhatsAppFloat() {
  const { settings } = useStoreSettings()

  const phone = settings?.whatsAppNumber || ''

  if (!phone) return null

  const url = buildWhatsAppUrl(phone, 'Ola! Gostaria de mais informacoes sobre os produtos da Floricultura Embeleze.')

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-brand-green hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse-green"
    >
      <FaWhatsapp className="w-7 h-7" />
    </a>
  )
}
