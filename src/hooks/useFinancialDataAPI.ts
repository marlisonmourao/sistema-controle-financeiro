"use client"

import { AppData, FinancialSummary, FixedExpense, FixedIncome, Investment, Salary, VariableExpense, VariableIncome } from "@/lib/types"
import { useCallback, useEffect, useState } from "react"

export function useFinancialDataAPI() {
  const [data, setData] = useState<AppData>({
    salary: null,
    fixedIncomes: [],
    variableIncomes: [],
    investments: [],
    fixedExpenses: [],
    variableExpenses: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Carregar todos os dados
  const loadData = useCallback(async () => {
    try {
      const [salaryRes, fixedIncomesRes, variableIncomesRes, investmentsRes, fixedExpensesRes, variableExpensesRes] = await Promise.all([
        fetch('/api/salary'),
        fetch('/api/fixed-incomes'),
        fetch('/api/variable-incomes'),
        fetch('/api/investments'),
        fetch('/api/fixed-expenses'),
        fetch('/api/variable-expenses')
      ])

      const [salary, fixedIncomes, variableIncomes, investments, fixedExpenses, variableExpenses] = await Promise.all([
        salaryRes.json(),
        fixedIncomesRes.json(),
        variableIncomesRes.json(),
        investmentsRes.json(),
        fixedExpensesRes.json(),
        variableExpensesRes.json()
      ])

      setData({
        salary: salary || null,
        fixedIncomes: fixedIncomes || [],
        variableIncomes: variableIncomes || [],
        investments: investments || [],
        fixedExpenses: fixedExpenses || [],
        variableExpenses: variableExpenses || []
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar dados inicial
  useEffect(() => {
    loadData()
  }, [loadData])

  // Calcular resumo financeiro
  const summary: FinancialSummary = {
    totalFixedIncome: data.fixedIncomes
      .filter(income => income.isActive)
      .reduce((sum, income) => sum + income.amount, 0),

    totalVariableIncome: data.variableIncomes
      .filter(income => {
        const incomeDate = new Date(income.date)
        const now = new Date()
        return incomeDate.getMonth() === now.getMonth() && incomeDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, income) => sum + income.amount, 0),

    totalInvestmentValue: data.investments
      .filter(investment => investment.isActive)
      .reduce((sum, investment) => sum + investment.currentAmount, 0),

    totalIncome: (data.salary?.amount || 0) +
      data.fixedIncomes.filter(income => income.isActive).reduce((sum, income) => sum + income.amount, 0) +
      data.variableIncomes.filter(income => {
        const incomeDate = new Date(income.date)
        const now = new Date()
        return incomeDate.getMonth() === now.getMonth() && incomeDate.getFullYear() === now.getFullYear()
      }).reduce((sum, income) => sum + income.amount, 0),

    totalFixedExpenses: data.fixedExpenses
      .filter(expense => expense.isActive)
      .reduce((sum, expense) => sum + expense.amount, 0),

    totalVariableExpenses: data.variableExpenses
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        const now = new Date()
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, expense) => sum + expense.amount, 0),

    totalExpenses: 0, // Será calculado abaixo
    remainingBalance: 0, // Será calculado abaixo
    expensesByCategory: {
      moradia: 0,
      transporte: 0,
      alimentacao: 0,
      saude: 0,
      educacao: 0,
      lazer: 0,
      outros: 0
    },
    incomeByType: {
      salary: data.salary?.amount || 0,
      freelance: 0,
      business: 0,
      investment: 0,
      other: 0
    },
    investmentPerformance: 0
  }

  // Calcular totais
  summary.totalExpenses = summary.totalFixedExpenses + summary.totalVariableExpenses
  summary.remainingBalance = summary.totalIncome - summary.totalExpenses

  // Calcular performance dos investimentos
  const totalInitialInvestment = data.investments
    .filter(investment => investment.isActive)
    .reduce((sum, investment) => sum + investment.initialAmount, 0)

  summary.investmentPerformance = totalInitialInvestment > 0
    ? ((summary.totalInvestmentValue - totalInitialInvestment) / totalInitialInvestment) * 100
    : 0

  // Calcular gastos por categoria
  data.fixedExpenses
    .filter(expense => expense.isActive)
    .forEach(expense => {
      summary.expensesByCategory[expense.category as keyof typeof summary.expensesByCategory] += expense.amount
    })

  data.variableExpenses
    .filter(expense => {
      const expenseDate = new Date(expense.date)
      const now = new Date()
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
    })
    .forEach(expense => {
      summary.expensesByCategory[expense.category as keyof typeof summary.expensesByCategory] += expense.amount
    })

  // Calcular receitas por tipo
  data.fixedIncomes
    .filter(income => income.isActive)
    .forEach(income => {
      summary.incomeByType[income.type as keyof typeof summary.incomeByType] += income.amount
    })

  data.variableIncomes
    .filter(income => {
      const incomeDate = new Date(income.date)
      const now = new Date()
      return incomeDate.getMonth() === now.getMonth() && incomeDate.getFullYear() === now.getFullYear()
    })
    .forEach(income => {
      summary.incomeByType[income.type as keyof typeof summary.incomeByType] += income.amount
    })

  // Funções para gerenciar salário
  const updateSalary = useCallback(async (salary: Omit<Salary, "updatedAt">) => {
    try {
      const response = await fetch('/api/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salary)
      })

      if (response.ok) {
        const updatedSalary = await response.json()
        setData(prev => ({ ...prev, salary: updatedSalary }))
      }
    } catch (error) {
      console.error('Erro ao atualizar salário:', error)
    }
  }, [])

  const clearSalary = useCallback(async () => {
    try {
      await fetch('/api/salary', { method: 'DELETE' })
      setData(prev => ({ ...prev, salary: null }))
    } catch (error) {
      console.error('Erro ao limpar salário:', error)
    }
  }, [])

  // Funções para gerenciar receitas fixas
  const addFixedIncome = useCallback(async (income: Omit<FixedIncome, "id" | "createdAt" | "updatedAt" | "isActive">) => {
    try {
      const response = await fetch('/api/fixed-incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(income)
      })

      if (response.ok) {
        const newIncome = await response.json()
        setData(prev => ({ ...prev, fixedIncomes: [...prev.fixedIncomes, newIncome] }))
      }
    } catch (error) {
      console.error('Erro ao adicionar receita fixa:', error)
    }
  }, [])

  const updateFixedIncome = useCallback(async (id: string, updates: Partial<Omit<FixedIncome, "id" | "createdAt">>) => {
    try {
      const response = await fetch(`/api/fixed-incomes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedIncome = await response.json()
        setData(prev => ({
          ...prev,
          fixedIncomes: prev.fixedIncomes.map(income =>
            income.id === id ? updatedIncome : income
          )
        }))
      }
    } catch (error) {
      console.error('Erro ao atualizar receita fixa:', error)
    }
  }, [])

  const deleteFixedIncome = useCallback(async (id: string) => {
    try {
      await fetch(`/api/fixed-incomes/${id}`, { method: 'DELETE' })
      setData(prev => ({
        ...prev,
        fixedIncomes: prev.fixedIncomes.filter(income => income.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar receita fixa:', error)
    }
  }, [])

  // Funções para gerenciar receitas variáveis
  const addVariableIncome = useCallback(async (income: Omit<VariableIncome, "id" | "createdAt">) => {
    try {
      const response = await fetch('/api/variable-incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(income)
      })

      if (response.ok) {
        const newIncome = await response.json()
        setData(prev => ({ ...prev, variableIncomes: [...prev.variableIncomes, newIncome] }))
      }
    } catch (error) {
      console.error('Erro ao adicionar receita variável:', error)
    }
  }, [])

  const updateVariableIncome = useCallback(async (id: string, updates: Partial<Omit<VariableIncome, "id" | "createdAt">>) => {
    try {
      const response = await fetch(`/api/variable-incomes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedIncome = await response.json()
        setData(prev => ({
          ...prev,
          variableIncomes: prev.variableIncomes.map(income =>
            income.id === id ? updatedIncome : income
          )
        }))
      }
    } catch (error) {
      console.error('Erro ao atualizar receita variável:', error)
    }
  }, [])

  const deleteVariableIncome = useCallback(async (id: string) => {
    try {
      await fetch(`/api/variable-incomes/${id}`, { method: 'DELETE' })
      setData(prev => ({
        ...prev,
        variableIncomes: prev.variableIncomes.filter(income => income.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar receita variável:', error)
    }
  }, [])

  // Funções para gerenciar investimentos
  const addInvestment = useCallback(async (investment: Omit<Investment, "id" | "createdAt" | "updatedAt" | "isActive">) => {
    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investment)
      })

      if (response.ok) {
        const newInvestment = await response.json()
        setData(prev => ({ ...prev, investments: [...prev.investments, newInvestment] }))
      }
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error)
    }
  }, [])

  const updateInvestment = useCallback(async (id: string, updates: Partial<Omit<Investment, "id" | "createdAt">>) => {
    try {
      const response = await fetch(`/api/investments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedInvestment = await response.json()
        setData(prev => ({
          ...prev,
          investments: prev.investments.map(investment =>
            investment.id === id ? updatedInvestment : investment
          )
        }))
      }
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error)
    }
  }, [])

  const deleteInvestment = useCallback(async (id: string) => {
    try {
      await fetch(`/api/investments/${id}`, { method: 'DELETE' })
      setData(prev => ({
        ...prev,
        investments: prev.investments.filter(investment => investment.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar investimento:', error)
    }
  }, [])

  // Funções para gerenciar gastos fixos
  const addFixedExpense = useCallback(async (expense: Omit<FixedExpense, "id" | "createdAt" | "updatedAt" | "isActive">) => {
    try {
      const response = await fetch('/api/fixed-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      })

      if (response.ok) {
        const newExpense = await response.json()
        setData(prev => ({ ...prev, fixedExpenses: [...prev.fixedExpenses, newExpense] }))
      }
    } catch (error) {
      console.error('Erro ao adicionar gasto fixo:', error)
    }
  }, [])

  const updateFixedExpense = useCallback(async (id: string, updates: Partial<Omit<FixedExpense, "id" | "createdAt">>) => {
    try {
      const response = await fetch(`/api/fixed-expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedExpense = await response.json()
        setData(prev => ({
          ...prev,
          fixedExpenses: prev.fixedExpenses.map(expense =>
            expense.id === id ? updatedExpense : expense
          )
        }))
      }
    } catch (error) {
      console.error('Erro ao atualizar gasto fixo:', error)
    }
  }, [])

  const deleteFixedExpense = useCallback(async (id: string) => {
    try {
      await fetch(`/api/fixed-expenses/${id}`, { method: 'DELETE' })
      setData(prev => ({
        ...prev,
        fixedExpenses: prev.fixedExpenses.filter(expense => expense.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar gasto fixo:', error)
    }
  }, [])

  // Funções para gerenciar gastos variáveis
  const addVariableExpense = useCallback(async (expense: Omit<VariableExpense, "id" | "createdAt">) => {
    try {
      const response = await fetch('/api/variable-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      })

      if (response.ok) {
        const newExpense = await response.json()
        setData(prev => ({ ...prev, variableExpenses: [...prev.variableExpenses, newExpense] }))
      }
    } catch (error) {
      console.error('Erro ao adicionar gasto variável:', error)
    }
  }, [])

  const updateVariableExpense = useCallback(async (id: string, updates: Partial<Omit<VariableExpense, "id" | "createdAt">>) => {
    try {
      const response = await fetch(`/api/variable-expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedExpense = await response.json()
        setData(prev => ({
          ...prev,
          variableExpenses: prev.variableExpenses.map(expense =>
            expense.id === id ? updatedExpense : expense
          )
        }))
      }
    } catch (error) {
      console.error('Erro ao atualizar gasto variável:', error)
    }
  }, [])

  const deleteVariableExpense = useCallback(async (id: string) => {
    try {
      await fetch(`/api/variable-expenses/${id}`, { method: 'DELETE' })
      setData(prev => ({
        ...prev,
        variableExpenses: prev.variableExpenses.filter(expense => expense.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar gasto variável:', error)
    }
  }, [])

  return {
    data,
    summary,
    isLoading,
    // Salary functions
    updateSalary,
    clearSalary,
    // Fixed incomes functions
    addFixedIncome,
    updateFixedIncome,
    deleteFixedIncome,
    // Variable incomes functions
    addVariableIncome,
    updateVariableIncome,
    deleteVariableIncome,
    // Investments functions
    addInvestment,
    updateInvestment,
    deleteInvestment,
    // Fixed expenses functions
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    // Variable expenses functions
    addVariableExpense,
    updateVariableExpense,
    deleteVariableExpense,
    // Refresh function
    refreshData: loadData
  }
}
