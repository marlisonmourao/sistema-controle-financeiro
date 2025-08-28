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
import { ExpenseCategory, ExpenseCategoryKey } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, Plus, Receipt, Save, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const fixedExpenseFormSchema = z.object({
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
  dueDay: z.number().min(1).max(31, "Dia deve estar entre 1 e 31")
})
type FixedExpenseFormData = z.infer<typeof fixedExpenseFormSchema>

export default function FixedExpensesPage() {
  const { data, addFixedExpense, updateFixedExpense, deleteFixedExpense, isLoading } = useFinancialData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<FixedExpenseFormData>({
    resolver: zodResolver(fixedExpenseFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      category: "outros" as ExpenseCategoryKey,
      description: "",
      dueDay: 1
    }
  })

  const onSubmit = async (formData: FixedExpenseFormData) => {
    if (editingExpense) {
      updateFixedExpense(editingExpense, formData)
      setEditingExpense(null)
    } else {
      addFixedExpense(formData)
    }
    reset()
    setIsDialogOpen(false)
  }

  const handleEdit = (expense: typeof data.fixedExpenses[0]) => {
    setValue("name", expense.name)
    setValue("amount", expense.amount)
    setValue("category", expense.category)
    setValue("description", expense.description || "")
    setValue("dueDay", expense.dueDay)
    setEditingExpense(expense.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este gasto fixo?")) {
      deleteFixedExpense(id)
    }
  }

  const toggleActive = (id: string, isActive: boolean) => {
    updateFixedExpense(id, { isActive: !isActive })
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingExpense(null)
    reset()
  }

  const totalActiveExpenses = data.fixedExpenses
    .filter(expense => expense.isActive)
    .reduce((sum, expense) => sum + expense.amount, 0)

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
            <h1 className="text-3xl font-bold tracking-tight">Gastos Fixos</h1>
            <p className="text-muted-foreground">
              Gerencie suas despesas mensais recorrentes
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Gasto Fixo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? "Editar Gasto Fixo" : "Novo Gasto Fixo"}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense 
                    ? "Atualize as informações do gasto fixo" 
                    : "Adicione uma nova despesa mensal recorrente"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Gasto</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Aluguel, Internet, Academia..."
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
                    <Label htmlFor="dueDay">Dia de Vencimento</Label>
                    <Input
                      id="dueDay"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="5"
                      {...register("dueDay", { valueAsNumber: true })}
                    />
                    {errors.dueDay && (
                      <p className="text-sm text-red-600">{errors.dueDay.message}</p>
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
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Observações adicionais..."
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
              <CardTitle className="text-sm font-medium">Total de Gastos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalActiveExpenses)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gastos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.fixedExpenses.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gastos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.fixedExpenses.filter(e => e.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Lista de Gastos Fixos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.fixedExpenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum gasto fixo cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando suas despesas mensais recorrentes
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Gasto
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.fixedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className={`p-4 rounded-lg border ${
                      expense.isActive ? "bg-white" : "bg-muted/50"
                    } hover:bg-muted/25 transition-colors`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${!expense.isActive ? "line-through text-muted-foreground" : ""}`}>
                            {expense.name}
                          </h3>
                          <Badge variant="outline">
                            {getCategoryName(expense.category)}
                          </Badge>
                          {!expense.isActive && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span>Valor: <strong className="text-red-600">{formatCurrency(expense.amount)}</strong></span>
                          <span>Vencimento: dia <strong>{expense.dueDay}</strong></span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground">{expense.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => toggleActive(expense.id, expense.isActive)}
                          variant="ghost"
                          size="sm"
                          title={expense.isActive ? "Desativar" : "Ativar"}
                        >
                          {expense.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
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
