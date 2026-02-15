import { useState, useEffect, useCallback } from 'react'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { campaignsApi } from '../../api/campaignsApi'
import type { Campaign, CampaignCreate } from '../../types/marketing'
import type { PaginatedResult } from '../../types/product'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

// -- Helpers ------------------------------------------------------------------

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

const toInputDate = (iso: string) => iso.slice(0, 10)

const today = () => new Date().toISOString().slice(0, 10)

const emptyCampaignForm: CampaignCreate = {
  name: '',
  description: '',
  startDate: today(),
  endDate: today(),
  isActive: true,
}

type CampaignStatus = 'active' | 'ended' | 'future' | 'inactive'

const getCampaignStatus = (campaign: Campaign): CampaignStatus => {
  if (!campaign.isActive) return 'inactive'
  const now = new Date()
  const start = new Date(campaign.startDate)
  const end = new Date(campaign.endDate)
  if (now < start) return 'future'
  if (now > end) return 'ended'
  return 'active'
}

const statusConfig: Record<CampaignStatus, { label: string; className: string }> = {
  active: { label: 'Em andamento', className: 'bg-green-100 text-green-700' },
  ended: { label: 'Encerrada', className: 'bg-gray-100 text-gray-500' },
  future: { label: 'Futura', className: 'bg-blue-100 text-blue-700' },
  inactive: { label: 'Inativa', className: 'bg-red-100 text-red-600' },
}

// -- Main Component -----------------------------------------------------------

export default function CampaignsPage() {
  // Data state
  const [campaigns, setCampaigns] = useState<PaginatedResult<Campaign> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CampaignCreate>(emptyCampaignForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Toggle state
  const [toggling, setToggling] = useState<string | null>(null)

  // -- Fetch data -------------------------------------------------------------

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await campaignsApi.list({
        search: search || undefined,
        isActive: filterActive,
        page,
        pageSize,
      })
      setCampaigns(res.data)
    } catch {
      setError('Erro ao carregar campanhas.')
    } finally {
      setLoading(false)
    }
  }, [search, filterActive, page])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // -- CRUD -------------------------------------------------------------------

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyCampaignForm })
    setModalOpen(true)
  }

  const openEdit = async (campaign: Campaign) => {
    setEditingId(campaign.id)
    try {
      const res = await campaignsApi.getById(campaign.id)
      const c = res.data
      setForm({
        name: c.name,
        description: c.description || '',
        startDate: toInputDate(c.startDate),
        endDate: toInputDate(c.endDate),
        isActive: c.isActive,
      })
      setModalOpen(true)
    } catch {
      toast.error('Erro ao carregar dados da campanha.')
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('O nome da campanha e obrigatorio.')
      return
    }
    if (!form.startDate || !form.endDate) {
      toast.error('As datas de inicio e fim sao obrigatorias.')
      return
    }
    if (form.startDate > form.endDate) {
      toast.error('A data de inicio deve ser anterior a data de fim.')
      return
    }

    setSaving(true)
    try {
      const payload: CampaignCreate = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
      }

      if (editingId) {
        await campaignsApi.update(editingId, payload)
        toast.success('Campanha atualizada com sucesso.')
      } else {
        await campaignsApi.create(payload)
        toast.success('Campanha criada com sucesso.')
      }
      setModalOpen(false)
      fetchCampaigns()
    } catch {
      toast.error('Erro ao salvar campanha.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await campaignsApi.delete(deleteTarget.id)
      toast.success('Campanha excluida com sucesso.')
      setDeleteTarget(null)
      fetchCampaigns()
    } catch {
      toast.error('Erro ao excluir campanha. Verifique se nao ha cupons ou promocoes associados.')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (campaign: Campaign) => {
    setToggling(campaign.id)
    try {
      await campaignsApi.toggleActive(campaign.id)
      toast.success(
        campaign.isActive ? 'Campanha desativada.' : 'Campanha ativada.'
      )
      fetchCampaigns()
    } catch {
      toast.error('Erro ao alterar status da campanha.')
    } finally {
      setToggling(null)
    }
  }

  // -- Render -----------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-dark heading-ornament-left">Campanhas</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Nova Campanha
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
              placeholder="Buscar por nome..."
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
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
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
              onClick={fetchCampaigns}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90"
            >
              <FiRefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        ) : !campaigns || campaigns.items.length === 0 ? (
          <div className="text-center py-20">
            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-text-light text-sm">Nenhuma campanha encontrada.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="admin-table-header border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Nome</th>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Descricao</th>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Inicio</th>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Fim</th>
                    <th className="text-center px-4 py-3 text-text-light font-medium">Status</th>
                    <th className="text-center px-4 py-3 text-text-light font-medium">Cupons</th>
                    <th className="text-center px-4 py-3 text-text-light font-medium">Promocoes</th>
                    <th className="text-right px-4 py-3 text-text-light font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {campaigns.items.map((campaign) => {
                    const status = getCampaignStatus(campaign)
                    const config = statusConfig[status]
                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-text-dark">{campaign.name}</span>
                        </td>
                        <td className="px-4 py-3 text-text-medium max-w-[200px] truncate">
                          {campaign.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-text-medium whitespace-nowrap">
                          {formatDate(campaign.startDate)}
                        </td>
                        <td className="px-4 py-3 text-text-medium whitespace-nowrap">
                          {formatDate(campaign.endDate)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
                          >
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-text-medium">
                          {campaign.couponCount}
                        </td>
                        <td className="px-4 py-3 text-center text-text-medium">
                          {campaign.promotionCount}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleActive(campaign)}
                              disabled={toggling === campaign.id}
                              className={`p-1.5 rounded-lg transition-colors ${
                                campaign.isActive
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={campaign.isActive ? 'Desativar' : 'Ativar'}
                            >
                              {toggling === campaign.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-blue border-t-transparent" />
                              ) : campaign.isActive ? (
                                <FiToggleRight className="w-5 h-5" />
                              ) : (
                                <FiToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => openEdit(campaign)}
                              className="p-1.5 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                              title="Editar"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(campaign)}
                              className="p-1.5 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg"
                              title="Excluir"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {campaigns.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-text-light">
                  Mostrando {(campaigns.page - 1) * campaigns.pageSize + 1}-
                  {Math.min(campaigns.page * campaigns.pageSize, campaigns.totalCount)} de{' '}
                  {campaigns.totalCount}
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: campaigns.totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        pg === campaigns.page
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
                {editingId ? 'Editar Campanha' : 'Nova Campanha'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-text-light hover:text-text-dark">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Nome</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Nome da campanha"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Descricao</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
                  placeholder="Descricao da campanha"
                />
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Data Inicio</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  />
                </div>
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
        title="Excluir Campanha"
        message={`Tem certeza que deseja excluir a campanha "${deleteTarget?.name ?? ''}"? Cupons e promocoes associados serao desvinculados.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleting}
      />
    </div>
  )
}
