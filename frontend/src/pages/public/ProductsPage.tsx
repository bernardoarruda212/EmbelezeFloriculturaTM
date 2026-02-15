import { useState, useEffect, useCallback } from 'react'
import { productsApi } from '../../api/productsApi'
import { categoriesApi } from '../../api/categoriesApi'
import type { Product, PaginatedResult } from '../../types/product'
import type { Category } from '../../types/category'
import ProductGrid from '../../components/products/ProductGrid'
import ProductSearch from '../../components/products/ProductSearch'
import ProductFilters from '../../components/products/ProductFilters'
import Pagination from '../../components/common/Pagination'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  // Filter state
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const hasActiveFilters = search !== '' || categoryId !== '' || minPrice !== '' || maxPrice !== '' || sortBy !== 'newest'

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.listActive()
        setCategories(res.data)
      } catch {
        // Categories not available
      }
    }
    fetchCategories()
  }, [])

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsApi.list({
        search: search || undefined,
        categoryId: categoryId || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sortBy: sortBy || undefined,
        page,
        pageSize,
        isActive: true,
      })
      const data = res.data as PaginatedResult<Product>
      setProducts(data.items)
      setTotalPages(data.totalPages)
    } catch {
      setProducts([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [search, categoryId, minPrice, maxPrice, sortBy, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleCategoryChange = (id: string) => {
    setCategoryId(id)
    setPage(1)
  }

  const handleMinPriceChange = (val: string) => {
    setMinPrice(val)
    setPage(1)
  }

  const handleMaxPriceChange = (val: string) => {
    setMaxPrice(val)
    setPage(1)
  }

  const handleSortChange = (val: string) => {
    setSortBy(val)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setCategoryId('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('newest')
    setPage(1)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-pink to-brand-pink/70 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-[15%] w-20 h-20 rounded-full border-2 border-white/10 animate-float" />
          <div className="absolute bottom-1/4 left-[20%] w-12 h-12 rounded-full bg-white/5 animate-float-slow" style={{ animationDelay: '1s' }} />
          <svg className="absolute top-0 left-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 1000">
            <circle cx="200" cy="200" r="80" fill="white" />
            <circle cx="800" cy="300" r="60" fill="white" />
            <circle cx="500" cy="800" r="70" fill="white" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Catalogo Completo</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Encontre o arranjo perfeito para cada ocasiao especial
          </p>
        </div>
      </section>

      {/* Filters + Products */}
      <section className="py-10 md:py-16 bg-brand-bg relative">
        {/* Wave divider */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-[1px]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[40px] md:h-[50px]">
            <path d="M0,0 C300,80 900,80 1200,0 L1200,0 L0,0 Z" fill="#d85c8a" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search bar */}
          <div className="flex justify-center mb-8">
            <ProductSearch
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar por nome de produto..."
            />
          </div>

          {/* Filters */}
          <div className="mb-8">
            <ProductFilters
              categories={categories}
              selectedCategoryId={categoryId}
              onCategoryChange={handleCategoryChange}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={handleMinPriceChange}
              onMaxPriceChange={handleMaxPriceChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Product grid */}
          <ProductGrid
            products={products}
            isLoading={loading}
            skeletonCount={pageSize}
            emptyMessage="Nenhum produto encontrado para os filtros selecionados."
          />

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </section>
    </div>
  )
}
