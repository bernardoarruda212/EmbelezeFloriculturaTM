import { useState, useEffect, useCallback } from 'react'
import {
  FiPackage,
  FiAlertTriangle,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { stockApi } from '../../api/stockApi'
import type {
  StockMovement,
  StockMovementCreate,
  StockMovementFilter,
  LowStockAlert,
} from '../../types/inventory'
import {
  StockMovementType,
  StockMovementTypeLabels,
  StockMovementTypeColors,
} from '../../types/inventory'
import type { PaginatedResult } from '../../types/product'
import type { Product, ProductDetail } from '../../types/product'
import api from '../../api/axiosInstance'
import { formatDateTime } from '../../utils/formatDate'
import StatsCard from '../../components/admin/StatsCard'

type TabKey = 'movements' | 'alerts' | 'adjustment'

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'movements', label: 'Movimentacoes', icon: FiPackage },
  { key: 'alerts', label: 'Alertas', icon: FiAlertTriangle },
  { key: 'adjustment', label: 'Ajuste Manual', icon: FiPlus },
]

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('movements')
  const [lowStockCount, setLowStockCount] = useState(0)

  // Movements state
  const [movements, setMovements] = useState<PaginatedResult<StockMovement> | null>(null)
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [movementFilters, setMovementFilters] = useState<StockMovementFilter>({
    page: 1,
    pageSize: 15,
  })

  // Alerts state
  const [alerts, setAlerts] = useState<LowStockAlert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alertThreshold, setAlertThreshold] = useState(5)

  // Adjustment form state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [formData, setFormData] = useState<StockMovementCreate>({
    productId: '',
    type: StockMovementType.In,
    quantity: 1,
    reason: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  // Fetch low stock count for stats
  const fetchLowStockCount = useCallback(async () => {
    try {
      const res = await stockApi.getLowStock(5)
      setLowStockCount(res.data.length)
    } catch {
      // Non-critical, fail silently
    }
  }, [])

  useEffect(() => {
    fetchLowStockCount()
  }, [fetchLowStockCount])

  // ------ MOVEMENTS TAB ------
  const fetchMovements = useCallback(async () => {
    setMovementsLoading(true)
    try {
      const res = await stockApi.getMovements(movementFilters)
      setMovements(res.data)
    } catch {
      toast.error('Erro ao carregar movimentacoes de estoque.')
    } finally {
      setMovementsLoading(false)
    }
  }, [movementFilters])

  useEffect(() => {
    if (activeTab === 'movements') {
      fetchMovements()
    }
  }, [activeTab, fetchMovements])

  const updateMovementFilter = (update: Partial<StockMovementFilter>) => {
    setMovementFilters((prev) => ({ ...prev, ...update, page: update.page ?? 1 }))
  }

  // ------ ALERTS TAB ------
  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true)
    try {
      const res = await stockApi.getLowStock(alertThreshold)
      setAlerts(res.data)
    } catch {
      toast.error('Erro ao carregar alertas de estoque baixo.')
    } finally {
      setAlertsLoading(false)
    }
  }, [alertThreshold])

  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchAlerts()
    }
  }, [activeTab, fetchAlerts])

  // ------ ADJUSTMENT TAB ------
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    try {
      const res = await api.get<PaginatedResult<Product>>('/products', {
        params: { search: productSearch || undefined, pageSize: 50, isActive: true },
      })
      setProducts(res.data.items)
    } catch {
      toast.error('Erro ao carregar produtos.')
    } finally {
      setProductsLoading(false)
    }
  }, [productSearch])

  useEffect(() => {
    if (activeTab === 'adjustment') {
      fetchProducts()
    }
  }, [activeTab, fetchProducts])

  const handleProductSelect = async (productId: string) => {
    setFormData((f) => ({ ...f, productId, productVariationId: undefined }))
    setSelectedProduct(null)

    if (!productId) return

    try {
      const res = await api.get<ProductDetail>(`/products/${productId}`)
      setSelectedProduct(res.data)
    } catch {
      // Non-critical
    }
  }

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.productId) {
      toast.error('Selecione um produto.')
      return
    }
    if (formData.quantity <= 0) {
      toast.error('Quantidade deve ser maior que zero.')
      return
    }

    setIsSaving(true)
    try {
      await stockApi.createMovement({
        productId: formData.productId,
        productVariationId: formData.productVariationId || undefined,
        type: formData.type,
        quantity: formData.quantity,
        reason: formData.reason || undefined,
      })
      toast.success('Movimentacao de estoque registrada com sucesso.')
      setFormData({
        productId: '',
        type: StockMovementType.In,
        quantity: 1,
        reason: '',
      })
      setSelectedProduct(null)
      fetchLowStockCount()
    } catch {
      toast.error('Erro ao registrar movimentacao.')
    } finally {
      setIsSaving(false)
    }
  }

  const getMovementTypeIcon = (type: StockMovementType) => {
    switch (type) {
      case StockMovementType.In:
        return <FiArrowDown className="w-3.5 h-3.5" />
      case StockMovementType.Out:
        return <FiArrowUp className="w-3.5 h-3.5" />
      case StockMovementType.Adjustment:
        return <FiRefreshCw className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark heading-ornament-left">Estoque</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          label="Total Movimentacoes"
          value={movements?.totalCount ?? '...'}
          icon={FiPackage}
          colorClass="bg-brand-blue"
        />
        <StatsCard
          label="Alertas Estoque Baixo"
          value={lowStockCount}
          icon={FiAlertTriangle}
          colorClass={lowStockCount > 0 ? 'bg-red-500' : 'bg-brand-green'}
        />
        <StatsCard
          label="Ajustes Manuais"
          value={movements?.items.filter((m) => m.type === StockMovementType.Adjustment).length ?? '...'}
          icon={FiRefreshCw}
          colorClass="bg-brand-pink"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-text-light hover:text-text-medium hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'alerts' && lowStockCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {lowStockCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  type="text"
                  placeholder="ID do produto..."
                  value={movementFilters.productId ?? ''}
                  onChange={(e) => updateMovementFilter({ productId: e.target.value || undefined })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
              <select
                value={movementFilters.type ?? ''}
                onChange={(e) =>
                  updateMovementFilter({
                    type: e.target.value !== '' ? (Number(e.target.value) as StockMovementType) : undefined,
                  })
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-white"
              >
                <option value="">Todos os tipos</option>
                {Object.entries(StockMovementTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={movementFilters.dateFrom ?? ''}
                onChange={(e) => updateMovementFilter({ dateFrom: e.target.value || undefined })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
              <input
                type="date"
                value={movementFilters.dateTo ?? ''}
                onChange={(e) => updateMovementFilter({ dateTo: e.target.value || undefined })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
            </div>
          </div>

          {/* Movements Table */}
          <div className="card-top-accent bg-white rounded-xl shadow-sm overflow-hidden">
            {movementsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-blue border-t-transparent" />
              </div>
            ) : !movements || movements.items.length === 0 ? (
              <div className="text-center py-20">
                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-text-light">Nenhuma movimentacao encontrada.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="admin-table-header">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-text-light">Data</th>
                        <th className="text-left py-3 px-4 font-medium text-text-light">Produto</th>
                        <th className="text-left py-3 px-4 font-medium text-text-light">Tipo</th>
                        <th className="text-right py-3 px-4 font-medium text-text-light">Quantidade</th>
                        <th className="text-center py-3 px-4 font-medium text-text-light">Antes → Depois</th>
                        <th className="text-left py-3 px-4 font-medium text-text-light">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.items.map((movement, idx) => (
                        <tr
                          key={movement.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            idx % 2 === 1 ? 'bg-gray-50/50' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-text-light whitespace-nowrap">
                            {formatDateTime(movement.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-text-dark">{movement.productName}</p>
                              {movement.variationName && (
                                <p className="text-xs text-text-light">{movement.variationName}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                StockMovementTypeColors[movement.type]
                              }`}
                            >
                              {getMovementTypeIcon(movement.type)}
                              {StockMovementTypeLabels[movement.type]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-text-dark">
                            {movement.type === StockMovementType.In ? '+' : movement.type === StockMovementType.Out ? '-' : ''}
                            {movement.quantity}
                          </td>
                          <td className="py-3 px-4 text-center text-text-medium">
                            <span className="text-text-light">{movement.quantityBefore}</span>
                            <span className="mx-2 text-text-light">→</span>
                            <span className="font-medium text-text-dark">{movement.quantityAfter}</span>
                          </td>
                          <td className="py-3 px-4 text-text-light max-w-xs truncate">
                            {movement.reason ?? (movement.orderNumber ? `Pedido #${movement.orderNumber}` : '—')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {movements.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <p className="text-sm text-text-light">
                      Pagina {movements.page} de {movements.totalPages} ({movements.totalCount} registros)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setMovementFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))
                        }
                        disabled={(movementFilters.page ?? 1) <= 1}
                        className="p-2 text-text-medium hover:bg-gray-100 rounded-lg disabled:opacity-30"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setMovementFilters((f) => ({
                            ...f,
                            page: Math.min(movements.totalPages, (f.page ?? 1) + 1),
                          }))
                        }
                        disabled={(movementFilters.page ?? 1) >= movements.totalPages}
                        className="p-2 text-text-medium hover:bg-gray-100 rounded-lg disabled:opacity-30"
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Threshold filter */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-text-dark whitespace-nowrap">
                Limite de estoque:
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value) || 5)}
                className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
              <button
                onClick={fetchAlerts}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                Atualizar
              </button>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="card-top-accent bg-white rounded-xl shadow-sm overflow-hidden">
            {alertsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-blue border-t-transparent" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-20">
                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-text-light">Nenhum produto com estoque baixo.</p>
                <p className="text-xs text-text-light mt-1">
                  Todos os produtos possuem estoque acima de {alertThreshold} unidades.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="admin-table-header">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-text-light">Produto</th>
                      <th className="text-right py-3 px-4 font-medium text-text-light">Estoque Atual</th>
                      <th className="text-right py-3 px-4 font-medium text-text-light">Limite</th>
                      <th className="text-center py-3 px-4 font-medium text-text-light">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert, idx) => {
                      const isCritical = alert.currentStock === 0
                      const isLow = alert.currentStock > 0 && alert.currentStock <= alert.threshold
                      return (
                        <tr
                          key={alert.productId}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            idx % 2 === 1 ? 'bg-gray-50/50' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-text-dark">{alert.productName}</p>
                            {alert.hasVariations && (
                              <p className="text-xs text-text-light">Possui variacoes</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-bold ${
                                isCritical ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-text-dark'
                              }`}
                            >
                              {alert.currentStock}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-text-medium">{alert.threshold}</td>
                          <td className="py-3 px-4 text-center">
                            {isCritical ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <FiAlertTriangle className="w-3.5 h-3.5" />
                                Sem Estoque
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <FiAlertTriangle className="w-3.5 h-3.5" />
                                Estoque Baixo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'adjustment' && (
        <div className="max-w-2xl">
          <div className="card-top-accent bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-text-dark mb-6">Registrar Movimentacao de Estoque</h2>

            <form onSubmit={handleAdjustmentSubmit} className="space-y-5">
              {/* Product search + select */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Produto</label>
                <div className="relative mb-2">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  />
                </div>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-blue border-t-transparent" />
                  </div>
                ) : (
                  <select
                    value={formData.productId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-white"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Estoque: {p.stockQuantity})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Variation select (if product has variations) */}
              {selectedProduct && selectedProduct.variations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Variacao (opcional)
                  </label>
                  <select
                    value={formData.productVariationId ?? ''}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, productVariationId: e.target.value || undefined }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-white"
                  >
                    <option value="">Produto principal</option>
                    {selectedProduct.variations
                      .filter((v) => v.isActive)
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (Estoque: {v.stockQuantity})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Movement type */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Tipo</label>
                <div className="flex gap-3">
                  {[StockMovementType.In, StockMovementType.Out, StockMovementType.Adjustment].map(
                    (type) => {
                      const isSelected = formData.type === type
                      const icons = {
                        [StockMovementType.In]: <FiArrowDown className="w-4 h-4" />,
                        [StockMovementType.Out]: <FiArrowUp className="w-4 h-4" />,
                        [StockMovementType.Adjustment]: <FiRefreshCw className="w-4 h-4" />,
                      }
                      const colorClasses = {
                        [StockMovementType.In]: isSelected
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 text-text-medium hover:border-green-300',
                        [StockMovementType.Out]: isSelected
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 text-text-medium hover:border-red-300',
                        [StockMovementType.Adjustment]: isSelected
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 text-text-medium hover:border-yellow-300',
                      }

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData((f) => ({ ...f, type }))}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${colorClasses[type]}`}
                        >
                          {icons[type]}
                          {StockMovementTypeLabels[type]}
                        </button>
                      )
                    }
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData((f) => ({ ...f, quantity: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Ex: 10"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Motivo</label>
                <textarea
                  value={formData.reason ?? ''}
                  onChange={(e) => setFormData((f) => ({ ...f, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
                  placeholder="Descreva o motivo da movimentacao..."
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving || !formData.productId}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      Registrar Movimentacao
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
