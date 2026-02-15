import api from './axiosInstance'
import type { FinancialReport, Expense, ExpenseCreate, ExpenseFilter, ExpenseCategory, ExpenseCategoryCreate } from '../types/financial'
import type { PaginatedResult } from '../types/product'

export const financialApi = {
  getReport: (startDate: string, endDate: string) =>
    api.get<FinancialReport>('/financial/report', { params: { startDate, endDate } }),

  getExpenses: (params?: ExpenseFilter) =>
    api.get<PaginatedResult<Expense>>('/financial/expenses', { params }),

  createExpense: (data: ExpenseCreate) =>
    api.post<Expense>('/financial/expenses', data),

  updateExpense: (id: string, data: ExpenseCreate) =>
    api.put<Expense>(`/financial/expenses/${id}`, data),

  deleteExpense: (id: string) =>
    api.delete(`/financial/expenses/${id}`),

  getExpenseCategories: () =>
    api.get<ExpenseCategory[]>('/financial/expense-categories'),

  createExpenseCategory: (data: ExpenseCategoryCreate) =>
    api.post<ExpenseCategory>('/financial/expense-categories', data),

  updateExpenseCategory: (id: string, data: ExpenseCategoryCreate) =>
    api.put<ExpenseCategory>(`/financial/expense-categories/${id}`, data),

  deleteExpenseCategory: (id: string) =>
    api.delete(`/financial/expense-categories/${id}`),

  reorderExpenseCategories: (categoryIds: string[]) =>
    api.put('/financial/expense-categories/reorder', categoryIds),
}
