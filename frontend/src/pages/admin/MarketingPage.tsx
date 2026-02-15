import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FiPercent,
  FiCalendar,
  FiTag,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi'
import { couponsApi } from '../../api/couponsApi'
import { campaignsApi } from '../../api/campaignsApi'
import { productPromotionsApi } from '../../api/productPromotionsApi'
import type { Coupon, Campaign } from '../../types/marketing'
import { DiscountType as DT } from '../../types/marketing'

// -- Helpers ------------------------------------------------------------------

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

// -- Main Component -----------------------------------------------------------

export default function MarketingPage() {
  // Stats
  const [activeCoupons, setActiveCoupons] = useState(0)
  const [activeCampaigns, setActiveCampaigns] = useState(0)
  const [activePromotions, setActivePromotions] = useState(0)

  // Recent items
  const [recentCoupons, setRecentCoupons] = useState<Coupon[]>([])
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([])

  // Loading / error
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [couponsRes, campaignsRes, promotionsRes, recentCouponsRes, recentCampaignsRes] =
        await Promise.all([
          couponsApi.list({ isActive: true, pageSize: 1 }),
          campaignsApi.list({ isActive: true, pageSize: 1 }),
          productPromotionsApi.list({ isActive: true, pageSize: 1 }),
          couponsApi.list({ pageSize: 5 }),
          campaignsApi.list({ pageSize: 5 }),
        ])

      setActiveCoupons(couponsRes.data.totalCount)
      setActiveCampaigns(campaignsRes.data.totalCount)
      setActivePromotions(promotionsRes.data.totalCount)
      setRecentCoupons(recentCouponsRes.data.items)
      setRecentCampaigns(recentCampaignsRes.data.items)
    } catch {
      setError('Erro ao carregar dados de marketing.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // -- Render -----------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90"
        >
          <FiRefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-text-dark heading-ornament-left">Marketing</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Coupons */}
        <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-light">Cupons Ativos</span>
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <FiPercent className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-dark">{activeCoupons}</p>
        </div>

        {/* Active Campaigns */}
        <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-light">Campanhas Ativas</span>
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-dark">{activeCampaigns}</p>
        </div>

        {/* Active Promotions */}
        <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-light">Promocoes Ativas</span>
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <FiTag className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-dark">{activePromotions}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/cupons"
          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-brand-blue/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FiPercent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">Gerenciar Cupons</p>
              <p className="text-xs text-text-light">Criar, editar e excluir cupons de desconto</p>
            </div>
          </div>
          <FiArrowRight className="w-5 h-5 text-text-light group-hover:text-brand-blue transition-colors" />
        </Link>

        <Link
          to="/admin/campanhas"
          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-brand-blue/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">Gerenciar Campanhas</p>
              <p className="text-xs text-text-light">Organizar campanhas de marketing</p>
            </div>
          </div>
          <FiArrowRight className="w-5 h-5 text-text-light group-hover:text-brand-blue transition-colors" />
        </Link>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Coupons */}
        <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-dark">Ultimos Cupons</h3>
            <Link
              to="/admin/cupons"
              className="text-xs text-brand-blue hover:underline font-medium"
            >
              Ver todos
            </Link>
          </div>

          {recentCoupons.length === 0 ? (
            <p className="text-sm text-text-light text-center py-6">Nenhum cupom cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-text-light font-medium">Codigo</th>
                    <th className="text-right py-2 text-text-light font-medium">Desconto</th>
                    <th className="text-center py-2 text-text-light font-medium">Usos</th>
                    <th className="text-center py-2 text-text-light font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCoupons.map((coupon) => {
                    const expired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
                    const isActive = coupon.isActive && !expired
                    return (
                      <tr key={coupon.id} className="border-b border-gray-50">
                        <td className="py-2">
                          <span className="font-mono text-xs font-semibold text-text-dark uppercase">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="py-2 text-right text-text-medium">
                          {coupon.discountType === DT.Percentage
                            ? `${coupon.discountValue}%`
                            : formatCurrency(coupon.discountValue)}
                        </td>
                        <td className="py-2 text-center text-text-medium">
                          {coupon.currentUses}
                          {coupon.maxUses !== null ? `/${coupon.maxUses}` : ''}
                        </td>
                        <td className="py-2 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-dark">Ultimas Campanhas</h3>
            <Link
              to="/admin/campanhas"
              className="text-xs text-brand-blue hover:underline font-medium"
            >
              Ver todas
            </Link>
          </div>

          {recentCampaigns.length === 0 ? (
            <p className="text-sm text-text-light text-center py-6">Nenhuma campanha cadastrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-text-light font-medium">Nome</th>
                    <th className="text-left py-2 text-text-light font-medium">Periodo</th>
                    <th className="text-center py-2 text-text-light font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCampaigns.map((campaign) => {
                    const now = new Date()
                    const start = new Date(campaign.startDate)
                    const end = new Date(campaign.endDate)
                    let statusLabel = 'Inativa'
                    let statusClass = 'bg-gray-100 text-gray-500'
                    if (campaign.isActive) {
                      if (now < start) {
                        statusLabel = 'Futura'
                        statusClass = 'bg-blue-100 text-blue-700'
                      } else if (now > end) {
                        statusLabel = 'Encerrada'
                        statusClass = 'bg-gray-100 text-gray-500'
                      } else {
                        statusLabel = 'Em andamento'
                        statusClass = 'bg-green-100 text-green-700'
                      }
                    }
                    return (
                      <tr key={campaign.id} className="border-b border-gray-50">
                        <td className="py-2 text-text-dark font-medium">{campaign.name}</td>
                        <td className="py-2 text-text-medium text-xs whitespace-nowrap">
                          {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                        </td>
                        <td className="py-2 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
                          >
                            {statusLabel}
                          </span>
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
    </div>
  )
}
