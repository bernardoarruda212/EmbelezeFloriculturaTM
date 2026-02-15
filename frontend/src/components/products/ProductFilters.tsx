import { FiFilter, FiX } from 'react-icons/fi'
import type { Category } from '../../types/category'

interface ProductFiltersProps {
  categories: Category[]
  selectedCategoryId: string
  onCategoryChange: (id: string) => void
  minPrice: string
  maxPrice: string
  onMinPriceChange: (val: string) => void
  onMaxPriceChange: (val: string) => void
  sortBy: string
  onSortChange: (val: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export default function ProductFilters({
  categories,
  selectedCategoryId,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Category filter buttons */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-light mb-3 flex items-center gap-1.5">
          <FiFilter className="w-3.5 h-3.5" />
          Categorias
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
              selectedCategoryId === ''
                ? 'bg-brand-blue text-white shadow-md'
                : 'bg-white text-text-medium border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
                selectedCategoryId === cat.id
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-white text-text-medium border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range + Sort */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Price range */}
        <div className="flex items-center gap-2">
          <div>
            <label className="text-xs font-medium text-text-light block mb-1">Preco min.</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="0"
              className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300"
            />
          </div>
          <span className="text-text-light mt-5">-</span>
          <div>
            <label className="text-xs font-medium text-text-light block mb-1">Preco max.</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="999"
              className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="text-xs font-medium text-text-light block mb-1">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all duration-300 cursor-pointer"
          >
            <option value="newest">Mais Recentes</option>
            <option value="price_asc">Menor Preco</option>
            <option value="price_desc">Maior Preco</option>
            <option value="name_asc">Nome A-Z</option>
          </select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs font-medium text-brand-pink hover:text-brand-pink/80 transition-colors duration-300 mb-0.5"
          >
            <FiX className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
