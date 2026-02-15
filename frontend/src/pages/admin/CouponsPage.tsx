import { useState, useEffect, useCallback } from 'react'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSearch,
  FiPercent,
  FiRefreshCw,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { couponsApi } from '../../api/couponsApi'
import { campaignsApi } from '../../api/campaignsApi'
import type { Coupon, CouponCreate, Campaign, DiscountType } from '../../types/marketing'
import { DiscountType as DT, DiscountTypeLabels } from '../../types/marketing'
import type { PaginatedResult } from '../../types/product'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

// -- Helpers ------------------------------------------------------------------

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (iso: string | null) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

const emptyCouponForm: CouponCreate = {
  code: '',
  description: '',
  discountType: DT.Percentage,
  discountValue: 0,
  minOrderAmount: undefined,
  maxUses: undefined,
  expiresAt: undefined,
  isActive: true,
  campaignId: undefined,
}

// -- Main Component -----------------------------------------------------------

export default function CouponsPage() {
  // Data state
  const [coupons, setCoupons] = useState<PaginatedResult<Coupon> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Campaigns for select
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CouponCreate>(emptyCouponForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)
  const [deleting, setDeleting] = useState(false)

  // -- Fetch data -------------------------------------------------------------

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await couponsApi.list({
        search: search || undefined,
        isActive: filterActive,
        page,
        pageSize,
      })
      setCoupons(res.data)
    } catch {
      setError('Erro ao carregar cupons.')
    } finally {
      setLoading(false)
    }
  }, [search, filterActive, page])

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await campaignsApi.list({ pageSize: 100 })
      setCampaigns(res.data.items)
    } catch {
      // silent — campaigns select is optional
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // -- CRUD -------------------------------------------------------------------

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyCouponForm })
    setModalOpen(true)
  }

  const openEdit = async (coupon: Coupon) => {
    setEditingId(coupon.id)
    try {
      const res = await couponsApi.getById(coupon.id)
      const c = res.data
      setForm({
        code: c.code,
        description: c.description || '',
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount ?? undefined,
        maxUses: c.maxUses ?? undefined,
        expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : undefined,
        isActive: c.isActive,
        campaignId: undefined, // backend doesn't return campaignId on coupon, only campaignName
      })
      setModalOpen(true)
    } catch {
      toast.error('Erro ao carregar dados do cupom.')
    }
  }

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error('O codigo do cupom e obrigatorio.')
      return
    }
    if (form.discountValue <= 0) {
      toast.error('O valor do desconto deve ser maior que zero.')
      return
    }

    setSaving(true)
    try {
      const payload: CouponCreate = {
        ...form,
        code: form.code.toUpperCase().trim(),
        campaignId: form.campaignId || undefined,
        minOrderAmount: form.minOrderAmount || undefined,
        maxUses: form.maxUses || undefined,
        expiresAt: form.expiresAt || undefined,
      }

      if (editingId) {
        await couponsApi.update(editingId, payload)
        toast.success('Cupom atualizado com sucesso.')
      } else {
        await couponsApi.create(payload)
        toast.success('Cupom criado com sucesso.')
      }
      setModalOpen(false)
      fetchCoupons()
    } catch {
      toast.error('Erro ao salvar cupom.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await couponsApi.delete(deleteTarget.id)
      toast.success('Cupom excluido com sucesso.')
      setDeleteTarget(null)
      fetchCoupons()
    } catch {
      toast.error('Erro ao excluir cupom.')
    } finally {
      setDeleting(false)
    }
  }

  // -- Render helpers ---------------------------------------------------------

  const renderDiscountBadge = (type: DiscountType) => {
    const colors =
      type === DT.Percentage
        ? 'bg-purple-100 text-purple-700'
        : 'bg-blue-100 text-blue-700'
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
        {DiscountTypeLabels[type]}
      </span>
    )
  }

  const renderDiscountValue = (type: DiscountType, value: number) => {
    if (type === DT.Percentage) return `${value}%`
    return formatCurrency(value)
  }

  const renderStatusBadge = (coupon: Coupon) => {
    const expired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
    const maxReached = coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses

    if (!coupon.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          Inativo
        </span>
      )
    }
    if (expired) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Expirado
        </span>
      )
    }
    if (maxReached) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Esgotado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Ativo
      </span>
    )
  }

  // -- Render -----------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-dark heading-ornament-left">Cupons</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Novo Cupom
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar por codigo..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            />
          </div>

          <select
            value={filterActive === undefined ? '' : filterActive ? 'active' : 'inactive'}
            onChange={(e) => {
              const val = e.target.value
              setFilterActive(val === '' ? undefined : val === 'active')
              setPage(1)
            }}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blue border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchCoupons}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90"
            >
              <FiRefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        ) : !coupons || coupons.items.length === 0 ? (
          <div className="text-center py-20">
            <FiPercent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-text-light text-sm">Nenhum cupom encontrado.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="admin-table-header border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Codigo</th>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Tipo</th>
                    <th className="text-right px-4 py-3 text-text-light font-medium">Valor</th>
                    <th className="text-center px-4 py-3 text-text-light font-medium">Usos</th>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Validade</th>
                    <th className="text-center px-4 py-3 text-text-light font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Campanha</th>
                    <th className="text-right px-4 py-3 text-text-light font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {coupons.items.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-text-dark uppercase">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">{renderDiscountBadge(coupon.discountType)}</td>
                      <td className="px-4 py-3 text-right text-text-dark font-medium whitespace-nowrap">
                        {renderDiscountValue(coupon.discountType, coupon.discountValue)}
                      </td>
                      <td className="px-4 py-3 text-center text-text-medium">
                        {coupon.currentUses}
                        {coupon.maxUses !== null ? `/${coupon.maxUses}` : ''}
                      </td>
                      <td className="px-4 py-3 text-text-medium whitespace-nowrap">
                        {formatDate(coupon.expiresAt)}
                      </td>
                      <td className="px-4 py-3 text-center">{renderStatusBadge(coupon)}</td>
                      <td className="px-4 py-3 text-text-medium text-sm">
                        {coupon.campaignName || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="p-1.5 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                            title="Editar"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(coupon)}
                            className="p-1.5 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg"
                            title="Excluir"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {coupons.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-text-light">
                  Mostrando {(coupons.page - 1) * coupons.pageSize + 1}-
                  {Math.min(coupons.page * coupons.pageSize, coupons.totalCount)} de{' '}
                  {coupons.totalCount}
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: coupons.totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        pg === coupons.page
                          ? 'bg-brand-blue text-white'
                          : 'text-text-medium hover:bg-gray-100'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-dark">
                {editingId ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-text-light hover:text-text-dark">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Codigo</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 font-mono uppercase"
                  placeholder="EX: DESCONTO20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Descricao</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
                  placeholder="Descricao opcional do cupom"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Tipo de Desconto</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discountType"
                      checked={form.discountType === DT.Percentage}
                      onChange={() => setForm((f) => ({ ...f, discountType: DT.Percentage }))}
                      className="text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="text-sm text-text-medium">Percentual (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discountType"
                      checked={form.discountType === DT.FixedValue}
                      onChange={() => setForm((f) => ({ ...f, discountType: DT.FixedValue }))}
                      className="text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="text-sm text-text-medium">Valor Fixo (R$)</span>
                  </label>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Valor do Desconto {form.discountType === DT.Percentage ? '(%)' : '(R$)'}
                </label>
                <input
                  type="number"
                  step={form.discountType === DT.Percentage ? '1' : '0.01'}
                  min="0"
                  max={form.discountType === DT.Percentage ? '100' : undefined}
                  value={form.discountValue || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="0"
                />
              </div>

              {/* Min Order Amount */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Valor Minimo do Pedido (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.minOrderAmount ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      minOrderAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Opcional"
                />
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Limite de Usos
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.maxUses ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxUses: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Ilimitado"
                />
              </div>

              {/* Expires At */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Data de Expiracao
                </label>
                <input
                  type="date"
                  value={form.expiresAt || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiresAt: e.target.value || undefined }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>

              {/* Campaign */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Campanha</label>
                <select
                  value={form.campaignId || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, campaignId: e.target.value || undefined }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                >
                  <option value="">Nenhuma campanha</option>
                  {campaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Is Active */}
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-dark">Ativo</span>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-5 w-5"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {editingId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir Cupom"
        message={`Tem certeza que deseja excluir o cupom "${deleteTarget?.code ?? ''}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleting}
      />
    </div>
  )
}
