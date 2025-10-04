import { z } from "zod"

// Schema para salário (mantido para compatibilidade)
export const salarySchema = z.object({
  amount: z.number().min(0, "Salário deve ser maior que zero"),
  description: z.string().min(1, "Descrição é obrigatória"),
  updatedAt: z.date().default(() => new Date()),
})

// Schema para tipos de receita
export const IncomeType = {
  salary: "Salário",
  freelance: "Freelance",
  business: "Negócio",
  investment: "Investimento",
  other: "Outros"
} as const

export type IncomeTypeKey = keyof typeof IncomeType

// Schema para receitas fixas (salário, aposentadoria, etc.)
export const fixedIncomeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number().min(0, "Valor deve ser maior que zero"),
  type: z.enum(["salary", "other"]),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

// Schema para receitas variáveis (freelance, vendas, etc.)
export const variableIncomeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number().min(0, "Valor deve ser maior que zero"),
  type: z.enum(["freelance", "business", "investment", "other"]),
  description: z.string().optional(),
  date: z.date(),
  createdAt: z.date().default(() => new Date()),
})

// Schema para investimentos
export const investmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["stocks", "bonds", "funds", "crypto", "real_estate", "other"]),
  initialAmount: z.number().min(0, "Valor inicial deve ser maior que zero"),
  currentAmount: z.number().min(0, "Valor atual deve ser maior que zero"),
  purchaseDate: z.date(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

// Schema para gastos fixos
export const fixedExpenseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number().min(0, "Valor deve ser maior que zero"),
  category: z.enum([
    "moradia",
    "transporte",
    "alimentacao",
    "saude",
    "educacao",
    "lazer",
    "outros"
  ]),
  description: z.string().optional(),
  dueDay: z.number().min(1).max(31, "Dia deve estar entre 1 e 31"),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

// Schema para gastos variáveis
export const variableExpenseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number().min(0, "Valor deve ser maior que zero"),
  category: z.enum([
    "moradia",
    "transporte",
    "alimentacao",
    "saude",
    "educacao",
    "lazer",
    "outros"
  ]),
  description: z.string().optional(),
  date: z.date(),
  createdAt: z.date().default(() => new Date()),
})

// Tipos derivados dos schemas
export type Salary = z.infer<typeof salarySchema>
export type FixedIncome = z.infer<typeof fixedIncomeSchema>
export type VariableIncome = z.infer<typeof variableIncomeSchema>
export type Investment = z.infer<typeof investmentSchema>
export type FixedExpense = z.infer<typeof fixedExpenseSchema>
export type VariableExpense = z.infer<typeof variableExpenseSchema>

// Enum para categorias (para uso em componentes)
export const ExpenseCategory = {
  moradia: "Moradia",
  transporte: "Transporte",
  alimentacao: "Alimentação",
  saude: "Saúde",
  educacao: "Educação",
  lazer: "Lazer",
  outros: "Outros"
} as const

export type ExpenseCategoryKey = keyof typeof ExpenseCategory

// Tipo para dados da aplicação
export interface AppData {
  salary: Salary | null // Mantido para compatibilidade
  fixedIncomes: FixedIncome[]
  variableIncomes: VariableIncome[]
  investments: Investment[]
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
}

// Tipo para resumo financeiro
export interface FinancialSummary {
  totalFixedIncome: number
  totalVariableIncome: number
  totalInvestmentValue: number
  totalIncome: number
  totalFixedExpenses: number
  totalVariableExpenses: number
  totalExpenses: number
  remainingBalance: number
  expensesByCategory: Record<ExpenseCategoryKey, number>
  incomeByType: Record<IncomeTypeKey, number>
  investmentPerformance: number // Percentual de ganho/perda
}
