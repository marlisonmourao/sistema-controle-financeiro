import { AppData, ExpenseCategory, ExpenseCategoryKey, FinancialSummary } from "./types"

const STORAGE_KEY = "financial-control-data"

// Dados padrão
const defaultData: AppData = {
  salary: null,
  fixedExpenses: [],
  variableExpenses: []
}

// Carregar dados do localStorage
export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultData
    
    const parsed = JSON.parse(stored)
    
    // Converter datas de string para Date objects
    if (parsed.salary?.updatedAt) {
      parsed.salary.updatedAt = new Date(parsed.salary.updatedAt)
    }
    
    parsed.fixedExpenses = parsed.fixedExpenses?.map((expense: {
      id: string;
      name: string;
      amount: number;
      category: ExpenseCategoryKey;
      description?: string;
      dueDay: number;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }) => ({
      ...expense,
      createdAt: new Date(expense.createdAt),
      updatedAt: new Date(expense.updatedAt)
    })) || []
    
    parsed.variableExpenses = parsed.variableExpenses?.map((expense: {
      id: string;
      name: string;
      amount: number;
      category: ExpenseCategoryKey;
      description?: string;
      date: string;
      createdAt: string;
    }) => ({
      ...expense,
      date: new Date(expense.date),
      createdAt: new Date(expense.createdAt)
    })) || []
    
    return parsed
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
    return defaultData
  }
}

// Salvar dados no localStorage
export function saveData(data: AppData): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Erro ao salvar dados:", error)
  }
}

// Calcular resumo financeiro
export function calculateSummary(data: AppData): FinancialSummary {
  const totalIncome = data.salary?.amount || 0
  
  const totalFixedExpenses = data.fixedExpenses
    .filter(expense => expense.isActive)
    .reduce((sum, expense) => sum + expense.amount, 0)
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const totalVariableExpenses = data.variableExpenses
    .filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    .reduce((sum, expense) => sum + expense.amount, 0)
  
  const totalExpenses = totalFixedExpenses + totalVariableExpenses
  const remainingBalance = totalIncome - totalExpenses
  
  // Calcular gastos por categoria
  const expensesByCategory: Record<ExpenseCategoryKey, number> = {
    moradia: 0,
    transporte: 0,
    alimentacao: 0,
    saude: 0,
    educacao: 0,
    lazer: 0,
    outros: 0
  }
  
  // Somar gastos fixos por categoria
  data.fixedExpenses
    .filter(expense => expense.isActive)
    .forEach(expense => {
      expensesByCategory[expense.category] += expense.amount
    })
  
  // Somar gastos variáveis do mês atual por categoria
  data.variableExpenses
    .filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    .forEach(expense => {
      expensesByCategory[expense.category] += expense.amount
    })
  
  return {
    totalIncome,
    totalFixedExpenses,
    totalVariableExpenses,
    totalExpenses,
    remainingBalance,
    expensesByCategory
  }
}

// Gerar ID único
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Formatar moeda brasileira
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(amount)
}

// Obter nome da categoria
export function getCategoryName(category: ExpenseCategoryKey): string {
  return ExpenseCategory[category]
}

// Obter cor da categoria para gráficos
export function getCategoryColor(category: ExpenseCategoryKey): string {
  const colors: Record<ExpenseCategoryKey, string> = {
    moradia: "#ef4444",
    transporte: "#f97316", 
    alimentacao: "#eab308",
    saude: "#22c55e",
    educacao: "#3b82f6",
    lazer: "#8b5cf6",
    outros: "#6b7280"
  }
  return colors[category]
}
