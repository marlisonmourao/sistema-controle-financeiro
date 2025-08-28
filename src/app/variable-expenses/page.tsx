"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinancialData } from "@/hooks/useFinancialData"
import { formatCurrency, getCategoryName } from "@/lib/storage"
import { ExpenseCategory, ExpenseCategoryKey, variableExpenseSchema } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Edit, Filter, Plus, Save, Trash2, TrendingDown, X } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const variableExpenseFormSchema = variableExpenseSchema.omit({ 
  id: true, 
  createdAt: true
})
type VariableExpenseFormData = z.infer<typeof variableExpenseFormSchema>

export default function VariableExpensesPage() {
  const { data, addVariableExpense, updateVariableExpense, deleteVariableExpense, isLoading } = useFinancialData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  const [filterMonth, setFilterMonth] = useState<string>("")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<VariableExpenseFormData>({
    resolver: zodResolver(variableExpenseFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      category: "outros",
      description: "",
      date: new Date()
    }
  })

  // Filtrar gastos
  const filteredExpenses = useMemo(() => {
    let filtered = data.variableExpenses

    if (filterMonth) {
      const [year, month] = filterMonth.split("-")
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getFullYear() === parseInt(year) && 
               expenseDate.getMonth() === parseInt(month) - 1
      })
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(expense => expense.category === filterCategory)
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [data.variableExpenses, filterMonth, filterCategory])

  // Calcular totais
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const thisMonthExpenses = data.variableExpenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const onSubmit = async (formData: VariableExpenseFormData) => {
    if (editingExpense) {
      updateVariableExpense(editingExpense, formData)
      setEditingExpense(null)
    } else {
      addVariableExpense(formData)
    }
    reset()
    setIsDialogOpen(false)
  }

  const handleEdit = (expense: typeof data.variableExpenses[0]) => {
    setValue("name", expense.name)
    setValue("amount", expense.amount)
    setValue("category", expense.category)
    setValue("description", expense.description || "")
    setValue("date", new Date(expense.date))
    setEditingExpense(expense.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este gasto variável?")) {
      deleteVariableExpense(id)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingExpense(null)
    reset()
  }

  // Gerar opções de meses dos últimos 12 meses
  const monthOptions = useMemo(() => {
    const options = []
    const now = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      options.push({ value, label })
    }
    
    return options
  }, [])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gastos Variáveis</h1>
            <p className="text-muted-foreground">
              Registre suas despesas eventuais e esporádicas
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? "Editar Gasto Variável" : "Novo Gasto Variável"}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense 
                    ? "Atualize as informações do gasto" 
                    : "Registre uma nova despesa eventual"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Descrição do Gasto</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Supermercado, Combustível, Restaurante..."
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("amount", { valueAsNumber: true })}
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      {...register("date", { 
                        setValueAs: (value) => value ? new Date(value) : new Date()
                      })}
                    />
                    {errors.date && (
                      <p className="text-sm text-red-600">{errors.date.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(value) => setValue("category", value as ExpenseCategoryKey)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ExpenseCategory).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Observações (Opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Detalhes adicionais..."
                    {...register("description")}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(thisMonthTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {thisMonthExpenses.length} gastos registrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Filtrado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(filteredTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredExpenses.length} gastos encontrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.variableExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.variableExpenses.length} gastos no total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-month">Filtrar por Mês</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger id="filter-month">
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os meses</SelectItem>
                    {monthOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-category">Filtrar por Categoria</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger id="filter-category">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {Object.entries(ExpenseCategory).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilterMonth("")
                    setFilterCategory("all")
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Lista de Gastos Variáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8">
                <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {data.variableExpenses.length === 0 
                    ? "Nenhum gasto variável cadastrado" 
                    : "Nenhum gasto encontrado com os filtros aplicados"
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {data.variableExpenses.length === 0 
                    ? "Registre aqui suas despesas eventuais e compras do dia a dia"
                    : "Tente ajustar os filtros ou adicionar novos gastos"
                  }
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {data.variableExpenses.length === 0 ? "Adicionar Primeiro Gasto" : "Novo Gasto"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 rounded-lg border bg-white hover:bg-muted/25 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{expense.name}</h3>
                          <Badge variant="outline">
                            {getCategoryName(expense.category)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span>Valor: <strong className="text-orange-600">{formatCurrency(expense.amount)}</strong></span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(expense.date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground">{expense.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(expense)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(expense.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
