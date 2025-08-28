"use client"

import { calculateSummary, generateId, loadData, saveData } from "@/lib/storage"
import { AppData, FinancialSummary, FixedExpense, Salary, VariableExpense } from "@/lib/types"
import { useCallback, useEffect, useState } from "react"

export function useFinancialData() {
  const [data, setData] = useState<AppData>({
    salary: null,
    fixedExpenses: [],
    variableExpenses: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Carregar dados inicial
  useEffect(() => {
    const loadedData = loadData()
    setData(loadedData)
    setIsLoading(false)
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

  return {
    data,
    summary,
    isLoading,
    // Salary functions
    updateSalary,
    clearSalary,
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
