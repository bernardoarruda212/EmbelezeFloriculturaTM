import { useState, useEffect, useCallback } from 'react'
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingBag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCalendar,
  FiFilter,
  FiChevronUp,
  FiChevronDown,
  FiRefreshCw,
  FiLoader,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { financialApi } from '../../api/financialApi'
import type {
  FinancialReport,
  Expense,
  ExpenseCreate,
  ExpenseFilter,
  ExpenseCategory,
  ExpenseCategoryCreate,
  RecurrenceInterval,
} from '../../types/financial'
import { RecurrenceIntervalLabels } from '../../types/financial'
import { RecurrenceInterval as RI } from '../../types/financial'
import type { PaginatedResult } from '../../types/product'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

const formatDateShort = (iso: string) => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const toInputDate = (d: Date) => d.toISOString().slice(0, 10)

const getMonthRange = (): [string, string] => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return [toInputDate(start), toInputDate(end)]
}

const getWeekRange = (): [string, string] => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(now.getFullYear(), now.getMonth(), diff)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return [toInputDate(start), toInputDate(end)]
}

type PeriodPreset = 'month' | 'week' | 'custom'
type TabKey = 'resumo' | 'despesas' | 'categorias'

// ─── Empty form defaults ────────────────────────────────────────────────────

const emptyExpenseForm: ExpenseCreate = {
  categoryId: '',
  amount: 0,
  description: '',
  expenseDate: toInputDate(new Date()),
  isRecurring: false,
}

const emptyCategoryForm: ExpenseCategoryCreate = {
  name: '',
  colorHex: '#6366f1',
  displayOrder: 0,
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function FinancialPage() {
  // ── Period state ─────────────────────────
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('month')
  const [startDate, setStartDate] = useState(() => getMonthRange()[0])
  const [endDate, setEndDate] = useState(() => getMonthRange()[1])

  // ── Active tab ───────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>('resumo')

  // ── Report state ─────────────────────────
  const [report, setReport] = useState<FinancialReport | null>(null)
  const [reportLoading, setReportLoading] = useState(true)
  const [reportError, setReportError] = useState('')

  // ── Expenses state ───────────────────────
  const [expenses, setExpenses] = useState<PaginatedResult<Expense> | null>(null)
  const [expensesLoading, setExpensesLoading] = useState(false)
  const [expenseFilter, setExpenseFilter] = useState<ExpenseFilter>({ page: 1, pageSize: 10 })
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [expenseForm, setExpenseForm] = useState<ExpenseCreate>(emptyExpenseForm)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [expenseSaving, setExpenseSaving] = useState(false)
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<Expense | null>(null)
  const [expenseDeleting, setExpenseDeleting] = useState(false)

  // ── Categories state ─────────────────────
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [categoryForm, setCategoryForm] = useState<ExpenseCategoryCreate>(emptyCategoryForm)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categorySaving, setCategorySaving] = useState(false)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<ExpenseCategory | null>(null)
  const [categoryDeleting, setCategoryDeleting] = useState(false)

  // ── Hovered chart bar ────────────────────
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null)

  // ── Period preset handlers ───────────────
  const handlePeriodChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset)
    if (preset === 'month') {
      const [s, e] = getMonthRange()
      setStartDate(s)
      setEndDate(e)
    } else if (preset === 'week') {
      const [s, e] = getWeekRange()
      setStartDate(s)
      setEndDate(e)
    }
  }

  // ── Data fetching ────────────────────────

  const fetchReport = useCallback(async () => {
    setReportLoading(true)
    setReportError('')
    try {
      const res = await financialApi.getReport(startDate, endDate)
      setReport(res.data)
    } catch {
      setReportError('Erro ao carregar relatorio financeiro.')
    } finally {
      setReportLoading(false)
    }
  }, [startDate, endDate])

  const fetchExpenses = useCallback(async () => {
    setExpensesLoading(true)
    try {
      const res = await financialApi.getExpenses(expenseFilter)
      setExpenses(res.data)
    } catch {
      toast.error('Erro ao carregar despesas.')
    } finally {
      setExpensesLoading(false)
    }
  }, [expenseFilter])

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      const res = await financialApi.getExpenseCategories()
      setCategories(res.data)
    } catch {
      toast.error('Erro ao carregar categorias de despesa.')
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  // ── Effects ──────────────────────────────

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (activeTab === 'despesas') {
      fetchExpenses()
    }
  }, [activeTab, fetchExpenses])

  // ── Expense CRUD ─────────────────────────

  const openCreateExpense = () => {
    setEditingExpenseId(null)
    setExpenseForm({
      ...emptyExpenseForm,
      categoryId: categories.length > 0 ? categories[0].id : '',
    })
    setExpenseModalOpen(true)
  }

  const openEditExpense = (exp: Expense) => {
    setEditingExpenseId(exp.id)
    setExpenseForm({
      categoryId: exp.categoryId,
      amount: exp.amount,
      description: exp.description,
      expenseDate: exp.expenseDate.slice(0, 10),
      isRecurring: exp.isRecurring,
      recurrenceInterval: exp.recurrenceInterval ?? undefined,
    })
    setExpenseModalOpen(true)
  }

  const handleSaveExpense = async () => {
    if (!expenseForm.categoryId) {
      toast.error('Selecione uma categoria.')
      return
    }
    if (expenseForm.amount <= 0) {
      toast.error('O valor deve ser maior que zero.')
      return
    }

    setExpenseSaving(true)
    try {
      const payload: ExpenseCreate = {
        ...expenseForm,
        recurrenceInterval: expenseForm.isRecurring ? expenseForm.recurrenceInterval : undefined,
      }

      if (editingExpenseId) {
        await financialApi.updateExpense(editingExpenseId, payload)
        toast.success('Despesa atualizada.')
      } else {
        await financialApi.createExpense(payload)
        toast.success('Despesa criada.')
      }
      setExpenseModalOpen(false)
      fetchExpenses()
      fetchReport()
    } catch {
      toast.error('Erro ao salvar despesa.')
    } finally {
      setExpenseSaving(false)
    }
  }

  const handleDeleteExpense = async () => {
    if (!deleteExpenseTarget) return
    setExpenseDeleting(true)
    try {
      await financialApi.deleteExpense(deleteExpenseTarget.id)
      toast.success('Despesa excluida.')
      setDeleteExpenseTarget(null)
      fetchExpenses()
      fetchReport()
    } catch {
      toast.error('Erro ao excluir despesa.')
    } finally {
      setExpenseDeleting(false)
    }
  }

  // ── Category CRUD ────────────────────────

  const openCreateCategory = () => {
    setEditingCategoryId(null)
    setCategoryForm({ ...emptyCategoryForm, displayOrder: categories.length })
    setCategoryModalOpen(true)
  }

  const openEditCategory = (cat: ExpenseCategory) => {
    setEditingCategoryId(cat.id)
    setCategoryForm({
      name: cat.name,
      colorHex: cat.colorHex ?? '#6366f1',
      iconClass: cat.iconClass ?? '',
      displayOrder: cat.displayOrder,
    })
    setCategoryModalOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Nome e obrigatorio.')
      return
    }
    setCategorySaving(true)
    try {
      if (editingCategoryId) {
        await financialApi.updateExpenseCategory(editingCategoryId, categoryForm)
        toast.success('Categoria atualizada.')
      } else {
        await financialApi.createExpenseCategory(categoryForm)
        toast.success('Categoria criada.')
      }
      setCategoryModalOpen(false)
      fetchCategories()
      fetchReport()
    } catch {
      toast.error('Erro ao salvar categoria.')
    } finally {
      setCategorySaving(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return
    setCategoryDeleting(true)
    try {
      await financialApi.deleteExpenseCategory(deleteCategoryTarget.id)
      toast.success('Categoria excluida.')
      setDeleteCategoryTarget(null)
      fetchCategories()
    } catch {
      toast.error('Erro ao excluir categoria. Verifique se nao ha despesas associadas.')
    } finally {
      setCategoryDeleting(false)
    }
  }

  const handleMoveCategory = async (catId: string, direction: 'up' | 'down') => {
    const idx = categories.findIndex((c) => c.id === catId)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= categories.length) return

    const reordered = [...categories]
    const tmp = reordered[idx]
    reordered[idx] = reordered[swapIdx]
    reordered[swapIdx] = tmp
    setCategories(reordered)

    try {
      await financialApi.reorderExpenseCategories(reordered.map((c) => c.id))
      toast.success('Ordem atualizada.')
    } catch {
      toast.error('Erro ao reordenar.')
      fetchCategories()
    }
  }

  // ── Derived values ───────────────────────

  const maxRevenue = report
    ? Math.max(...report.revenueByDay.map((d) => d.revenue), 1)
    : 1

  const totalCategoryExpense = report
    ? report.expensesByCategory.reduce((sum, c) => sum + c.totalAmount, 0)
    : 0

  // ── Render helpers ───────────────────────

  const renderLoading = () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blue border-t-transparent" />
    </div>
  )

  const renderError = (msg: string, onRetry: () => void) => (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-red-500 text-sm">{msg}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90"
      >
        <FiRefreshCw className="w-4 h-4" />
        Tentar novamente
      </button>
    </div>
  )

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-dark heading-ornament-left">Financeiro</h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePeriodChange('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              periodPreset === 'month'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-text-medium hover:bg-gray-200'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => handlePeriodChange('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              periodPreset === 'week'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-text-medium hover:bg-gray-200'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setPeriodPreset('custom')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              periodPreset === 'custom'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-text-medium hover:bg-gray-200'
            }`}
          >
            Personalizado
          </button>

          {periodPreset === 'custom' && (
            <>
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4 text-text-light" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
              <span className="text-text-light text-sm">ate</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
            </>
          )}
        </div>
      </div>

      {/* ── Stats cards ─────────────────────── */}
      {reportLoading ? (
        renderLoading()
      ) : reportError ? (
        renderError(reportError, fetchReport)
      ) : report ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-light">Receita Total</span>
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(report.totalRevenue)}</p>
              <p className="text-xs text-text-light mt-1">{report.totalOrders} pedidos</p>
            </div>

            {/* Expenses */}
            <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-light">Despesas Totais</span>
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                  <FiTrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(report.totalExpenses)}</p>
            </div>

            {/* Net profit */}
            <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-light">Lucro Liquido</span>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    report.netProfit >= 0 ? 'bg-blue-100' : 'bg-red-100'
                  }`}
                >
                  <FiDollarSign
                    className={`w-5 h-5 ${report.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}
                  />
                </div>
              </div>
              <p
                className={`text-2xl font-bold ${
                  report.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(report.netProfit)}
              </p>
            </div>

            {/* Average ticket */}
            <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-light">Ticket Medio</span>
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FiShoppingBag className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-dark">{formatCurrency(report.averageTicket)}</p>
            </div>
          </div>

          {/* ── Tabs ────────────────────────────── */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-6">
              {([
                { key: 'resumo' as TabKey, label: 'Resumo' },
                { key: 'despesas' as TabKey, label: 'Despesas' },
                { key: 'categorias' as TabKey, label: 'Categorias' },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-text-light hover:text-text-medium'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ── Tab Content ─────────────────────── */}
          {activeTab === 'resumo' && renderResumoTab(report, maxRevenue, totalCategoryExpense, hoveredBarIdx, setHoveredBarIdx)}
          {activeTab === 'despesas' && renderDespesasTab({
            expenses,
            expensesLoading,
            expenseFilter,
            setExpenseFilter,
            categories,
            openCreateExpense,
            openEditExpense,
            setDeleteExpenseTarget,
            fetchExpenses,
          })}
          {activeTab === 'categorias' && renderCategoriasTab({
            categories,
            categoriesLoading,
            openCreateCategory,
            openEditCategory,
            setDeleteCategoryTarget,
            handleMoveCategory,
          })}
        </>
      ) : null}

      {/* ── Expense Modal ───────────────────── */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setExpenseModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-dark">
                {editingExpenseId ? 'Editar Despesa' : 'Nova Despesa'}
              </h2>
              <button onClick={() => setExpenseModalOpen(false)} className="text-text-light hover:text-text-dark">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category select */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Categoria</label>
                <select
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                >
                  <option value="">Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseForm.amount || ''}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="0,00"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Descricao</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
                  placeholder="Descricao da despesa"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Data</label>
                <input
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, expenseDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>

              {/* Recurring toggle */}
              <label className="flex items-center justify-between">
                <span className="text-sm text-text-medium">Recorrente</span>
                <input
                  type="checkbox"
                  checked={expenseForm.isRecurring}
                  onChange={(e) =>
                    setExpenseForm((f) => ({
                      ...f,
                      isRecurring: e.target.checked,
                      recurrenceInterval: e.target.checked ? (f.recurrenceInterval ?? RI.Monthly) : undefined,
                    }))
                  }
                  className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-5 w-5"
                />
              </label>

              {/* Recurrence interval */}
              {expenseForm.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Intervalo</label>
                  <select
                    value={expenseForm.recurrenceInterval ?? RI.Monthly}
                    onChange={(e) =>
                      setExpenseForm((f) => ({
                        ...f,
                        recurrenceInterval: parseInt(e.target.value) as RecurrenceInterval,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  >
                    {Object.entries(RecurrenceIntervalLabels).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setExpenseModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveExpense}
                disabled={expenseSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {expenseSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {editingExpenseId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Modal ──────────────────── */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCategoryModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-dark">
                {editingCategoryId ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={() => setCategoryModalOpen(false)} className="text-text-light hover:text-text-dark">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Nome</label>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Nome da categoria"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Cor</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={categoryForm.colorHex || '#6366f1'}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, colorHex: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    value={categoryForm.colorHex || ''}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, colorHex: e.target.value }))}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              {/* Display order */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Ordem de exibicao</label>
                <input
                  type="number"
                  min="0"
                  value={categoryForm.displayOrder}
                  onChange={(e) =>
                    setCategoryForm((f) => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={categorySaving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {categorySaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {editingCategoryId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirms ─────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteExpenseTarget}
        title="Excluir Despesa"
        message={`Tem certeza que deseja excluir a despesa "${deleteExpenseTarget?.description ?? ''}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeleteExpenseTarget(null)}
        isLoading={expenseDeleting}
      />

      <ConfirmDialog
        isOpen={!!deleteCategoryTarget}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${deleteCategoryTarget?.name ?? ''}"? Categorias com despesas associadas nao podem ser excluidas.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCategoryTarget(null)}
        isLoading={categoryDeleting}
      />
    </div>
  )
}

// ═══════════════════════════════════════════
// TAB: Resumo
// ═══════════════════════════════════════════

function renderResumoTab(
  report: FinancialReport,
  maxRevenue: number,
  totalCategoryExpense: number,
  hoveredBarIdx: number | null,
  setHoveredBarIdx: (idx: number | null) => void,
) {
  return (
    <div className="space-y-6 mt-6">
      {/* Revenue by day chart */}
      <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-text-dark mb-4">Receita por Dia</h3>
        {report.revenueByDay.length === 0 ? (
          <p className="text-sm text-text-light text-center py-8">Nenhum dado no periodo selecionado.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 min-w-[400px]" style={{ height: 220 }}>
              {report.revenueByDay.map((day, idx) => {
                const pct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                const barHeight = Math.max(pct, 2)
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center relative group"
                    onMouseEnter={() => setHoveredBarIdx(idx)}
                    onMouseLeave={() => setHoveredBarIdx(null)}
                  >
                    {/* Tooltip */}
                    {hoveredBarIdx === idx && (
                      <div className="absolute bottom-full mb-2 bg-brand-navy text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-lg pointer-events-none">
                        <p className="font-medium">{formatDate(day.date)}</p>
                        <p>{formatCurrency(day.revenue)}</p>
                        <p>{day.orderCount} pedidos</p>
                      </div>
                    )}
                    {/* Bar */}
                    <div
                      className="w-full rounded-t-sm bg-brand-green hover:bg-brand-green/80 transition-colors cursor-pointer"
                      style={{ height: `${barHeight}%`, minHeight: 4 }}
                    />
                    {/* Label */}
                    {report.revenueByDay.length <= 15 && (
                      <span className="text-[10px] text-text-light mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {formatDateShort(day.date)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {report.revenueByDay.length > 15 && (
              <div className="flex justify-between mt-2">
                <span className="text-xs text-text-light">{formatDateShort(report.revenueByDay[0].date)}</span>
                <span className="text-xs text-text-light">
                  {formatDateShort(report.revenueByDay[report.revenueByDay.length - 1].date)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by category */}
        <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-text-dark mb-4">Despesas por Categoria</h3>
          {report.expensesByCategory.length === 0 ? (
            <p className="text-sm text-text-light text-center py-8">Nenhuma despesa no periodo.</p>
          ) : (
            <div className="space-y-3">
              {report.expensesByCategory.map((cat) => {
                const pct = totalCategoryExpense > 0 ? (cat.totalAmount / totalCategoryExpense) * 100 : 0
                return (
                  <div key={cat.categoryId} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.colorHex || '#9ca3af' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-text-dark truncate">{cat.categoryName}</span>
                        <span className="text-sm font-medium text-text-dark ml-2 whitespace-nowrap">
                          {formatCurrency(cat.totalAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.colorHex || '#9ca3af',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-text-light">{cat.count} despesas</span>
                        <span className="text-xs text-text-light">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-text-dark mb-4">Top 10 Produtos</h3>
          {report.topProducts.length === 0 ? (
            <p className="text-sm text-text-light text-center py-8">Nenhuma venda no periodo.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-text-light font-medium">#</th>
                    <th className="text-left py-2 text-text-light font-medium">Produto</th>
                    <th className="text-right py-2 text-text-light font-medium">Qtd</th>
                    <th className="text-right py-2 text-text-light font-medium">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topProducts.map((prod, idx) => (
                    <tr key={prod.productId} className="border-b border-gray-50">
                      <td className="py-2 text-text-light">{idx + 1}</td>
                      <td className="py-2 text-text-dark">{prod.productName}</td>
                      <td className="py-2 text-right text-text-medium">{prod.quantitySold}</td>
                      <td className="py-2 text-right text-text-dark font-medium">
                        {formatCurrency(prod.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// TAB: Despesas
// ═══════════════════════════════════════════

interface DespesasTabProps {
  expenses: PaginatedResult<Expense> | null
  expensesLoading: boolean
  expenseFilter: ExpenseFilter
  setExpenseFilter: React.Dispatch<React.SetStateAction<ExpenseFilter>>
  categories: ExpenseCategory[]
  openCreateExpense: () => void
  openEditExpense: (exp: Expense) => void
  setDeleteExpenseTarget: (exp: Expense) => void
  fetchExpenses: () => void
}

function renderDespesasTab({
  expenses,
  expensesLoading,
  expenseFilter,
  setExpenseFilter,
  categories,
  openCreateExpense,
  openEditExpense,
  setDeleteExpenseTarget,
}: DespesasTabProps) {
  return (
    <div className="space-y-4 mt-6">
      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <FiFilter className="w-4 h-4 text-text-light" />

          <select
            value={expenseFilter.categoryId || ''}
            onChange={(e) =>
              setExpenseFilter((f) => ({
                ...f,
                categoryId: e.target.value || undefined,
                page: 1,
              }))
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={expenseFilter.dateFrom || ''}
            onChange={(e) =>
              setExpenseFilter((f) => ({
                ...f,
                dateFrom: e.target.value || undefined,
                page: 1,
              }))
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            placeholder="De"
          />

          <input
            type="date"
            value={expenseFilter.dateTo || ''}
            onChange={(e) =>
              setExpenseFilter((f) => ({
                ...f,
                dateTo: e.target.value || undefined,
                page: 1,
              }))
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            placeholder="Ate"
          />

          <label className="flex items-center gap-2 text-sm text-text-medium">
            <input
              type="checkbox"
              checked={expenseFilter.isRecurring === true}
              onChange={(e) =>
                setExpenseFilter((f) => ({
                  ...f,
                  isRecurring: e.target.checked ? true : undefined,
                  page: 1,
                }))
              }
              className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-4 w-4"
            />
            Apenas recorrentes
          </label>

          <div className="flex-1" />

          <button
            onClick={openCreateExpense}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-top-accent bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {expensesLoading ? (
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-6 h-6 text-brand-blue animate-spin" />
          </div>
        ) : !expenses || expenses.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light text-sm">Nenhuma despesa encontrada.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="admin-table-header border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Data</th>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Categoria</th>
                    <th className="text-left px-4 py-3 text-text-light font-medium">Descricao</th>
                    <th className="text-right px-4 py-3 text-text-light font-medium">Valor</th>
                    <th className="text-center px-4 py-3 text-text-light font-medium">Recorrente</th>
                    <th className="text-right px-4 py-3 text-text-light font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expenses.items.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-text-medium whitespace-nowrap">
                        {formatDate(exp.expenseDate.slice(0, 10))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: exp.categoryColor || '#9ca3af' }}
                          />
                          <span className="text-text-dark">{exp.categoryName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-medium max-w-[200px] truncate">
                        {exp.description}
                      </td>
                      <td className="px-4 py-3 text-right text-text-dark font-medium whitespace-nowrap">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {exp.isRecurring ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {exp.recurrenceInterval !== null
                              ? RecurrenceIntervalLabels[exp.recurrenceInterval]
                              : 'Sim'}
                          </span>
                        ) : (
                          <span className="text-text-light text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditExpense(exp)}
                            className="p-1.5 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                            title="Editar"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteExpenseTarget(exp)}
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
            {expenses.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-text-light">
                  Mostrando {(expenses.page - 1) * expenses.pageSize + 1}-
                  {Math.min(expenses.page * expenses.pageSize, expenses.totalCount)} de{' '}
                  {expenses.totalCount}
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: expenses.totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setExpenseFilter((f) => ({ ...f, page: pg }))}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        pg === expenses.page
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
    </div>
  )
}

// ═══════════════════════════════════════════
// TAB: Categorias
// ═══════════════════════════════════════════

interface CategoriasTabProps {
  categories: ExpenseCategory[]
  categoriesLoading: boolean
  openCreateCategory: () => void
  openEditCategory: (cat: ExpenseCategory) => void
  setDeleteCategoryTarget: (cat: ExpenseCategory) => void
  handleMoveCategory: (catId: string, direction: 'up' | 'down') => void
}

function renderCategoriasTab({
  categories,
  categoriesLoading,
  openCreateCategory,
  openEditCategory,
  setDeleteCategoryTarget,
  handleMoveCategory,
}: CategoriasTabProps) {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-end">
        <button
          onClick={openCreateCategory}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {categoriesLoading ? (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="w-6 h-6 text-brand-blue animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12">
          <p className="text-text-light text-sm">Nenhuma categoria de despesa cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              {/* Color dot */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.colorHex || '#9ca3af' }}
              />

              {/* Name + info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-dark">{cat.name}</p>
                <p className="text-xs text-text-light">
                  {cat.expenseCount} despesas &middot; {formatCurrency(cat.totalAmount)}
                </p>
              </div>

              {/* Active badge */}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  cat.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {cat.isActive ? 'Ativa' : 'Inativa'}
              </span>

              {/* Reorder buttons */}
              <div className="flex flex-col">
                <button
                  onClick={() => handleMoveCategory(cat.id, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 text-text-light hover:text-text-dark disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover para cima"
                >
                  <FiChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveCategory(cat.id, 'down')}
                  disabled={idx === categories.length - 1}
                  className="p-0.5 text-text-light hover:text-text-dark disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover para baixo"
                >
                  <FiChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={() => openEditCategory(cat)}
                className="p-2 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                title="Editar"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteCategoryTarget(cat)}
                className="p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg"
                title="Excluir"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
