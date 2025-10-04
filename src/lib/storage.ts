import { AppData, ExpenseCategory, ExpenseCategoryKey, FinancialSummary, IncomeType, IncomeTypeKey } from "./types"

const STORAGE_KEY = "financial-control-data"

// Dados padrão
const defaultData: AppData = {
  salary: null, // Mantido para compatibilidade
  fixedIncomes: [],
  variableIncomes: [],
  investments: [],
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

    // Inicializar arrays se não existirem (compatibilidade)
    parsed.fixedIncomes = parsed.fixedIncomes || []
    parsed.variableIncomes = parsed.variableIncomes || []
    parsed.investments = parsed.investments || []

    // Converter receitas fixas
    parsed.fixedIncomes = parsed.fixedIncomes.map((income: {
      id: string;
      name: string;
      amount: number;
      type: string;
      description?: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }) => ({
      ...income,
      createdAt: new Date(income.createdAt),
      updatedAt: new Date(income.updatedAt)
    }))

    // Converter receitas variáveis
    parsed.variableIncomes = parsed.variableIncomes.map((income: {
      id: string;
      name: string;
      amount: number;
      type: string;
      description?: string;
      date: string;
      createdAt: string;
    }) => ({
      ...income,
      date: new Date(income.date),
      createdAt: new Date(income.createdAt)
    }))

    // Converter investimentos
    parsed.investments = parsed.investments.map((investment: {
      id: string;
      name: string;
      type: string;
      initialAmount: number;
      currentAmount: number;
      purchaseDate: string;
      description?: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }) => ({
      ...investment,
      purchaseDate: new Date(investment.purchaseDate),
      createdAt: new Date(investment.createdAt),
      updatedAt: new Date(investment.updatedAt)
    }))

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
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Calcular receitas fixas
  const totalFixedIncome = data.fixedIncomes
    .filter(income => income.isActive)
    .reduce((sum, income) => sum + income.amount, 0)

  // Calcular receitas variáveis do mês atual
  const totalVariableIncome = data.variableIncomes
    .filter(income => {
      const incomeDate = new Date(income.date)
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear
    })
    .reduce((sum, income) => sum + income.amount, 0)

  // Calcular valor total dos investimentos
  const totalInvestmentValue = data.investments
    .filter(investment => investment.isActive)
    .reduce((sum, investment) => sum + investment.currentAmount, 0)

  // Calcular performance dos investimentos
  const totalInitialInvestment = data.investments
    .filter(investment => investment.isActive)
    .reduce((sum, investment) => sum + investment.initialAmount, 0)

  const investmentPerformance = totalInitialInvestment > 0
    ? ((totalInvestmentValue - totalInitialInvestment) / totalInitialInvestment) * 100
    : 0

  // Receita total (incluindo salário para compatibilidade)
  const salaryIncome = data.salary?.amount || 0
  const totalIncome = salaryIncome + totalFixedIncome + totalVariableIncome

  // Calcular gastos
  const totalFixedExpenses = data.fixedExpenses
    .filter(expense => expense.isActive)
    .reduce((sum, expense) => sum + expense.amount, 0)

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

  // Calcular receitas por tipo
  const incomeByType: Record<IncomeTypeKey, number> = {
    salary: salaryIncome,
    freelance: 0,
    business: 0,
    investment: 0,
    other: 0
  }

  // Somar receitas fixas por tipo
  data.fixedIncomes
    .filter(income => income.isActive)
    .forEach(income => {
      incomeByType[income.type] += income.amount
    })

  // Somar receitas variáveis do mês atual por tipo
  data.variableIncomes
    .filter(income => {
      const incomeDate = new Date(income.date)
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear
    })
    .forEach(income => {
      incomeByType[income.type] += income.amount
    })

  return {
    totalFixedIncome,
    totalVariableIncome,
    totalInvestmentValue,
    totalIncome,
    totalFixedExpenses,
    totalVariableExpenses,
    totalExpenses,
    remainingBalance,
    expensesByCategory,
    incomeByType,
    investmentPerformance
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

// Obter nome do tipo de receita
export function getIncomeTypeName(type: IncomeTypeKey): string {
  return IncomeType[type]
}

// Obter cor do tipo de receita para gráficos
export function getIncomeTypeColor(type: IncomeTypeKey): string {
  const colors: Record<IncomeTypeKey, string> = {
    salary: "#22c55e",
    freelance: "#3b82f6",
    business: "#f97316",
    investment: "#8b5cf6",
    other: "#6b7280"
  }
  return colors[type]
}
