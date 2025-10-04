"use client"

import { calculateSummary, generateId, loadData, saveData } from "@/lib/storage"
import { AppData, FinancialSummary, FixedExpense, FixedIncome, Investment, Salary, VariableExpense, VariableIncome } from "@/lib/types"
import { useCallback, useEffect, useState } from "react"

export function useFinancialData() {
  const [data, setData] = useState<AppData>({
    salary: null,
    fixedIncomes: [],
    variableIncomes: [],
    investments: [],
    fixedExpenses: [],
    variableExpenses: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Carregar dados inicial
  useEffect(() => {
    try {
      const loadedData = loadData()
      setData(loadedData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      // Manter dados padrão em caso de erro
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Salvar dados quando state mudar
  useEffect(() => {
    if (!isLoading) {
      saveData(data)
    }
  }, [data, isLoading])

  // Calcular resumo financeiro
  const summary: FinancialSummary = calculateSummary(data)

  // Funções para gerenciar salário
  const updateSalary = useCallback((salary: Omit<Salary, "updatedAt">) => {
    setData(prev => ({
      ...prev,
      salary: {
        ...salary,
        updatedAt: new Date()
      }
    }))
  }, [])

  const clearSalary = useCallback(() => {
    setData(prev => ({
      ...prev,
      salary: null
    }))
  }, [])

  // Funções para gerenciar gastos fixos
  const addFixedExpense = useCallback((expense: Omit<FixedExpense, "id" | "createdAt" | "updatedAt" | "isActive">) => {
    const newExpense: FixedExpense = {
      ...expense,
      isActive: true,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setData(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, newExpense]
    }))
  }, [])

  const updateFixedExpense = useCallback((id: string, updates: Partial<Omit<FixedExpense, "id" | "createdAt">>) => {
    setData(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(expense =>
        expense.id === id
          ? { ...expense, ...updates, updatedAt: new Date() }
          : expense
      )
    }))
  }, [])

  const deleteFixedExpense = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter(expense => expense.id !== id)
    }))
  }, [])

  // Funções para gerenciar gastos variáveis
  const addVariableExpense = useCallback((expense: Omit<VariableExpense, "id" | "createdAt">) => {
    const newExpense: VariableExpense = {
      ...expense,
      id: generateId(),
      createdAt: new Date()
    }

    setData(prev => ({
      ...prev,
      variableExpenses: [...prev.variableExpenses, newExpense]
    }))
  }, [])

  const updateVariableExpense = useCallback((id: string, updates: Partial<Omit<VariableExpense, "id" | "createdAt">>) => {
    setData(prev => ({
      ...prev,
      variableExpenses: prev.variableExpenses.map(expense =>
        expense.id === id
          ? { ...expense, ...updates }
          : expense
      )
    }))
  }, [])

  const deleteVariableExpense = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      variableExpenses: prev.variableExpenses.filter(expense => expense.id !== id)
    }))
  }, [])

  // Funções para gerenciar receitas fixas
  const addFixedIncome = useCallback((income: Omit<FixedIncome, "id" | "createdAt" | "updatedAt" | "isActive">) => {
    const newIncome: FixedIncome = {
      ...income,
      isActive: true,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setData(prev => ({
      ...prev,
      fixedIncomes: [...prev.fixedIncomes, newIncome]
    }))
  }, [])

  const updateFixedIncome = useCallback((id: string, updates: Partial<Omit<FixedIncome, "id" | "createdAt">>) => {
    setData(prev => ({
      ...prev,
      fixedIncomes: prev.fixedIncomes.map(income =>
        income.id === id
          ? { ...income, ...updates, updatedAt: new Date() }
          : income
      )
    }))
  }, [])

  const deleteFixedIncome = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      fixedIncomes: prev.fixedIncomes.filter(income => income.id !== id)
    }))
  }, [])

  // Funções para gerenciar receitas variáveis
  const addVariableIncome = useCallback((income: Omit<VariableIncome, "id" | "createdAt">) => {
    const newIncome: VariableIncome = {
      ...income,
      id: generateId(),
      createdAt: new Date()
    }

    setData(prev => ({
      ...prev,
      variableIncomes: [...prev.variableIncomes, newIncome]
    }))
  }, [])

  const updateVariableIncome = useCallback((id: string, updates: Partial<Omit<VariableIncome, "id" | "createdAt">>) => {
    setData(prev => ({
      ...prev,
      variableIncomes: prev.variableIncomes.map(income =>
        income.id === id
          ? { ...income, ...updates }
          : income
      )
    }))
  }, [])

  const deleteVariableIncome = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      variableIncomes: prev.variableIncomes.filter(income => income.id !== id)
    }))
  }, [])

  // Funções para gerenciar investimentos
  const addInvestment = useCallback((investment: Omit<Investment, "id" | "createdAt" | "updatedAt" | "isActive">) => {
    const newInvestment: Investment = {
      ...investment,
      isActive: true,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setData(prev => ({
      ...prev,
      investments: [...prev.investments, newInvestment]
    }))
  }, [])

  const updateInvestment = useCallback((id: string, updates: Partial<Omit<Investment, "id" | "createdAt">>) => {
    setData(prev => ({
      ...prev,
      investments: prev.investments.map(investment =>
        investment.id === id
          ? { ...investment, ...updates, updatedAt: new Date() }
          : investment
      )
    }))
  }, [])

  const deleteInvestment = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      investments: prev.investments.filter(investment => investment.id !== id)
    }))
  }, [])

  return {
    data,
    summary,
    isLoading,
    // Salary functions (mantido para compatibilidade)
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
    deleteVariableExpense
  }
}
