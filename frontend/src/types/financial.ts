export enum RecurrenceInterval {
  Daily = 0,
  Weekly = 1,
  Monthly = 2,
  Yearly = 3,
}

export const RecurrenceIntervalLabels: Record<RecurrenceInterval, string> = {
  [RecurrenceInterval.Daily]: 'Diario',
  [RecurrenceInterval.Weekly]: 'Semanal',
  [RecurrenceInterval.Monthly]: 'Mensal',
  [RecurrenceInterval.Yearly]: 'Anual',
}

export interface FinancialReport {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  averageTicket: number
  totalOrders: number
  revenueByDay: RevenueByDay[]
  expensesByCategory: CategoryExpense[]
  topProducts: TopProduct[]
}

export interface RevenueByDay {
  date: string
  revenue: number
  orderCount: number
}

export interface CategoryExpense {
  categoryId: string
  categoryName: string
  colorHex: string | null
  totalAmount: number
  count: number
}

export interface TopProduct {
  productId: string
  productName: string
  quantitySold: number
  totalRevenue: number
}

export interface Expense {
  id: string
  categoryId: string
  categoryName: string
  categoryColor: string | null
  amount: number
  description: string
  expenseDate: string
  isRecurring: boolean
  recurrenceInterval: RecurrenceInterval | null
  createdAt: string
}

export interface ExpenseCreate {
  categoryId: string
  amount: number
  description: string
  expenseDate: string
  isRecurring: boolean
  recurrenceInterval?: RecurrenceInterval
}

export interface ExpenseFilter {
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  isRecurring?: boolean
  page?: number
  pageSize?: number
}

export interface ExpenseCategory {
  id: string
  name: string
  colorHex: string | null
  iconClass: string | null
  displayOrder: number
  isActive: boolean
  expenseCount: number
  totalAmount: number
}

export interface ExpenseCategoryCreate {
  name: string
  colorHex?: string
  iconClass?: string
  displayOrder: number
}
