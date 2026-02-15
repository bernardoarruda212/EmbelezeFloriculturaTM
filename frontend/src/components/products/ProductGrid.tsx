import type { Product } from '../../types/product'
import ProductCard, { ProductCardSkeleton } from './ProductCard'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  skeletonCount?: number
  emptyMessage?: string
}

export default function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  emptyMessage = 'Nenhum produto encontrado.',
}: ProductGridProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-6xl mb-4">🌿</span>
        <p className="text-lg font-medium text-text-dark">{emptyMessage}</p>
        <p className="text-sm text-text-light mt-1">
          Tente ajustar os filtros ou buscar por outro termo.
        </p>
      </div>
    )
  }

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, i) => (
        <div
          key={product.id}
          className={`animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
          style={{ transitionDelay: `${Math.min(i, 7) * 80}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}
