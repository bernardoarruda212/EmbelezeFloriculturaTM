import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { FiChevronRight, FiMinus, FiPlus, FiShoppingCart, FiCheck, FiPackage } from 'react-icons/fi'
import { productsApi } from '../../api/productsApi'
import { ordersApi } from '../../api/ordersApi'
import { useStoreSettings } from '../../contexts/StoreSettingsContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { buildWhatsAppUrl, buildProductMessage } from '../../utils/whatsappUrl'
import type { ProductDetail, ProductVariation } from '../../types/product'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { settings } = useStoreSettings()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Order form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formQuantity, setFormQuantity] = useState(1)

  const phone = settings?.whatsAppNumber || ''

  useEffect(() => {
    if (!slug) return
    const fetchProduct = async () => {
      setLoading(true)
      setError(false)
      try {
        const res = await productsApi.getBySlug(slug)
        setProduct(res.data)
        // Select first active variation by default
        const firstActive = res.data.variations?.find((v) => v.isActive)
        if (firstActive) setSelectedVariation(firstActive)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  if (loading) {
    return <LoadingSpinner size="lg" message="Carregando produto..." />
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <span className="text-6xl mb-4">🌷</span>
        <h2 className="text-2xl font-bold text-text-dark mb-2">Produto nao encontrado</h2>
        <p className="text-text-medium mb-6">
          O produto que voce esta procurando nao existe ou foi removido.
        </p>
        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-navy text-white font-bold px-6 py-3 rounded-full transition-all duration-300"
        >
          Ver Catalogo
        </Link>
      </div>
    )
  }

  const currentPrice = selectedVariation ? selectedVariation.price : product.basePrice
  const currentStock = selectedVariation ? selectedVariation.stockQuantity : product.stockQuantity
  const inStock = currentStock > 0

  const images = product.images?.length
    ? product.images.sort((a, b) => a.displayOrder - b.displayOrder)
    : []

  const mainImageUrl = images[selectedImage]?.imageUrl || product.mainImageUrl

  const whatsappMessage = buildProductMessage(
    product.name,
    currentPrice,
    selectedVariation?.name
  )
  const whatsappUrl = phone ? buildWhatsAppUrl(phone, whatsappMessage) : '#'

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formPhone.trim()) return

    setOrderSubmitting(true)
    try {
      await ordersApi.create({
        customerName: formName,
        customerPhone: formPhone,
        deliveryAddress: formAddress || undefined,
        deliveryNotes: formNotes || undefined,
        items: [
          {
            productId: product.id,
            productVariationId: selectedVariation?.id,
            quantity: formQuantity,
          },
        ],
      })
      setOrderSuccess(true)
      setShowOrderForm(false)
    } catch {
      // If order API fails, redirect to WhatsApp as fallback
      if (phone) {
        window.open(whatsappUrl, '_blank')
      }
    } finally {
      setOrderSubmitting(false)
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-white to-brand-bg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-text-light gap-1">
            <Link to="/" className="hover:text-brand-blue transition-colors">Inicio</Link>
            <FiChevronRight className="w-3.5 h-3.5" />
            <Link to="/produtos" className="hover:text-brand-blue transition-colors">Produtos</Link>
            <FiChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-dark font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="py-10 md:py-16 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image Gallery */}
            <div>
              {/* Main image */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-md aspect-square mb-4 img-hover-overlay">
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-pink-light to-brand-bg flex items-center justify-center">
                    <span className="text-8xl">🌸</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(idx)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        idx === selectedImage
                          ? 'border-brand-blue shadow-md'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt={`${product.name} - imagem ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Badge */}
              {product.badge && (
                <span className="inline-block bg-brand-pink text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  {product.badge}
                </span>
              )}

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/produtos?category=${cat.slug}`}
                      className="text-xs font-medium text-brand-blue bg-brand-bg px-3 py-1 rounded-full hover:bg-brand-blue hover:text-white transition-all duration-300"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-brand-pink">
                  {formatCurrency(currentPrice)}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <p className="text-text-medium leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Variations */}
              {product.variations && product.variations.filter((v) => v.isActive).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-text-dark mb-3">Opcoes disponiveis:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variations
                      .filter((v) => v.isActive)
                      .map((variation) => (
                        <button
                          key={variation.id}
                          onClick={() => setSelectedVariation(variation)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-300 ${
                            selectedVariation?.id === variation.id
                              ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                              : 'border-gray-200 text-text-medium hover:border-brand-blue/50'
                          } ${variation.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={variation.stockQuantity === 0}
                        >
                          {variation.name}
                          <span className="block text-xs mt-0.5">{formatCurrency(variation.price)}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Stock indicator */}
              <div className="flex items-center gap-2 mb-6">
                <FiPackage className={`w-4 h-4 ${inStock ? 'text-brand-green' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${inStock ? 'text-brand-green' : 'text-red-500'}`}>
                  {inStock ? `Em estoque (${currentStock} disponivel${currentStock > 1 ? 'eis' : ''})` : 'Produto esgotado'}
                </span>
              </div>

              {/* Action buttons */}
              {inStock && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {phone && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-brand-green hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                      Comprar via WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setShowOrderForm(true)
                      setOrderSuccess(false)
                    }}
                    className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-navy text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    Fazer Pedido
                  </button>
                </div>
              )}

              {/* Order success message */}
              {orderSuccess && (
                <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 text-brand-green font-bold mb-2">
                    <FiCheck className="w-5 h-5" />
                    Pedido enviado com sucesso!
                  </div>
                  <p className="text-sm text-text-medium">
                    Recebemos seu pedido e entraremos em contato em breve para confirmar os detalhes.
                  </p>
                </div>
              )}

              {/* Order form */}
              {showOrderForm && !orderSuccess && (
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                    <FiShoppingCart className="w-5 h-5 text-brand-blue" />
                    Formulario de Pedido
                  </h3>
                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    {/* Quantity */}
                    <div>
                      <label className="text-sm font-medium text-text-dark block mb-1">Quantidade</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setFormQuantity(Math.max(1, formQuantity - 1))}
                          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-brand-bg transition-colors"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-bold w-10 text-center">{formQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setFormQuantity(Math.min(currentStock, formQuantity + 1))}
                          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-brand-bg transition-colors"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-text-light ml-2">
                          Total: <strong className="text-brand-pink">{formatCurrency(currentPrice * formQuantity)}</strong>
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text-dark block mb-1">Nome *</label>
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
                      <label className="text-sm font-medium text-text-dark block mb-1">Telefone *</label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text-dark block mb-1">Endereco de entrega</label>
                      <input
                        type="text"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300"
                        placeholder="Rua, numero, bairro, cidade"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text-dark block mb-1">Observacoes</label>
                      <textarea
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300 resize-none"
                        placeholder="Mensagem no cartao, data de entrega, etc."
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={orderSubmitting}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-navy text-white font-bold py-3 rounded-full transition-all duration-300 disabled:opacity-60"
                      >
                        {orderSubmitting ? 'Enviando...' : 'Enviar Pedido'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOrderForm(false)}
                        className="px-6 py-3 text-sm font-medium text-text-medium hover:text-text-dark border border-gray-200 rounded-full transition-all duration-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
