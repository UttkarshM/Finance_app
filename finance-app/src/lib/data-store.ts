"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Expense {
  id: number
  description: string
  amount: number
  category: string
  date: string
  notes?: string
}

interface CryptoHolding {
  id: string
  symbol: string
  name: string
  amount: number
  purchasePrice: number
}

interface DataStore {
  // Expenses
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, "id">) => void
  deleteExpense: (id: number) => void
  getTotalExpenses: () => number
  getExpensesByCategory: () => Record<string, number>

  // Crypto Holdings
  cryptoHoldings: CryptoHolding[]
  addCryptoHolding: (holding: Omit<CryptoHolding, "id">) => void
  updateCryptoHolding: (id: string, updates: Partial<CryptoHolding>) => void
  getCryptoHolding: (id: string) => CryptoHolding | undefined

  // Portfolio calculations
  getTotalPortfolioValue: (marketPrices: Record<string, number>) => number
  getTotalInvested: () => number
}

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      // Initial expenses data
      expenses: [
        {
          id: 1,
          description: "Grocery Store",
          amount: 85.5,
          category: "Food",
          date: "2024-01-15",
          notes: "Weekly groceries",
        },
        {
          id: 2,
          description: "Gas Station",
          amount: 45.0,
          category: "Transportation",
          date: "2024-01-14",
          notes: "Fill up tank",
        },
        { id: 3, description: "Coffee Shop", amount: 12.75, category: "Food", date: "2024-01-14" },
        { id: 4, description: "Netflix Subscription", amount: 15.99, category: "Entertainment", date: "2024-01-13" },
        { id: 5, description: "Uber Ride", amount: 18.5, category: "Transportation", date: "2024-01-12" },
        { id: 6, description: "Restaurant Dinner", amount: 67.25, category: "Food", date: "2024-01-11" },
        { id: 7, description: "Gym Membership", amount: 29.99, category: "Health", date: "2024-01-10" },
        { id: 8, description: "Book Purchase", amount: 24.99, category: "Education", date: "2024-01-09" },
      ],

      // Initial crypto holdings
      cryptoHoldings: [
        {
          id: "bitcoin",
          symbol: "BTC",
          name: "Bitcoin",
          amount: 0.25,
          purchasePrice: 41000.0,
        },
        {
          id: "ethereum",
          symbol: "ETH",
          name: "Ethereum",
          amount: 2.1,
          purchasePrice: 2800.0,
        },
        {
          id: "cardano",
          symbol: "ADA",
          name: "Cardano",
          amount: 1500,
          purchasePrice: 0.48,
        },
        {
          id: "solana",
          symbol: "SOL",
          name: "Solana",
          amount: 15,
          purchasePrice: 85.0,
        },
      ],

      // Expense methods
      addExpense: (expense) =>
        set((state) => ({
          expenses: [{ ...expense, id: Math.max(...state.expenses.map((e) => e.id), 0) + 1 }, ...state.expenses],
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        })),

      getTotalExpenses: () => {
        const { expenses } = get()
        return expenses.reduce((sum, expense) => sum + expense.amount, 0)
      },

      getExpensesByCategory: () => {
        const { expenses } = get()
        return expenses.reduce(
          (acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount
            return acc
          },
          {} as Record<string, number>,
        )
      },

      // Crypto methods
      addCryptoHolding: (holding) =>
        set((state) => ({
          cryptoHoldings: [...state.cryptoHoldings, holding],
        })),

      updateCryptoHolding: (id, updates) =>
        set((state) => ({
          cryptoHoldings: state.cryptoHoldings.map((holding) =>
            holding.id === id ? { ...holding, ...updates } : holding,
          ),
        })),

      getCryptoHolding: (id) => {
        const { cryptoHoldings } = get()
        return cryptoHoldings.find((holding) => holding.id === id)
      },

      getTotalPortfolioValue: (marketPrices) => {
        const { cryptoHoldings } = get()
        return cryptoHoldings.reduce((sum, holding) => {
          const currentPrice = marketPrices[holding.id] || holding.purchasePrice
          return sum + holding.amount * currentPrice
        }, 0)
      },

      getTotalInvested: () => {
        const { cryptoHoldings } = get()
        return cryptoHoldings.reduce((sum, holding) => sum + holding.amount * holding.purchasePrice, 0)
      },
    }),
    {
      name: "finance-app-storage",
    },
  ),
)
