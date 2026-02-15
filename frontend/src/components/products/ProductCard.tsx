import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import type { Product } from '../../types/product'
import { formatCurrency } from '../../utils/formatCurrency'
import { buildWhatsAppUrl, buildProductMessage } from '../../utils/whatsappUrl'
import { useStoreSettings } from '../../contexts/StoreSettingsContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { settings } = useStoreSettings()
  const phone = settings?.whatsAppNumber || ''

  const whatsappUrl = phone
    ? buildWhatsAppUrl(phone, buildProductMessage(product.name, product.basePrice))
    : '#'

  return (
    <div className="group card-top-accent bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col border border-gray-100/50">
      {/* Image */}
      <Link to={`/produtos/${product.slug}`} className="relative block overflow-hidden aspect-square img-hover-overlay">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-pink-light to-brand-bg flex items-center justify-center">
            <span className="text-6xl">🌸</span>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-brand-pink text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {product.badge}
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-text-dark text-sm font-bold px-4 py-2 rounded-full">
              Esgotado
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Categories */}
        {product.categoryNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categoryNames.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="text-xs font-medium text-brand-blue bg-brand-bg px-2 py-0.5 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Name */}
        <Link to={`/produtos/${product.slug}`} className="flex-1">
          <h3 className="text-sm font-semibold text-text-dark line-clamp-2 group-hover:text-brand-blue transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        {/* Price + WhatsApp button */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-lg font-bold text-brand-pink">
            {formatCurrency(product.basePrice)}
          </span>

          {phone && product.stockQuantity > 0 && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-brand-green hover:bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-full transition-all duration-300 hover:scale-105"
              aria-label={`Comprar ${product.name} pelo WhatsApp`}
            >
              <FaWhatsapp className="w-3.5 h-3.5" />
              Comprar
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* Skeleton for loading state */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex gap-1">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  )
}
