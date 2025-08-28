import { z } from "zod"

// Schema para salário
export const salarySchema = z.object({
  amount: z.number().min(0, "Salário deve ser maior que zero"),
  description: z.string().min(1, "Descrição é obrigatória"),
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
  salary: Salary | null
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
}

// Tipo para resumo financeiro
export interface FinancialSummary {
  totalIncome: number
  totalFixedExpenses: number
  totalVariableExpenses: number
  totalExpenses: number
  remainingBalance: number
  expensesByCategory: Record<ExpenseCategoryKey, number>
}
