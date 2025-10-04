"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { useFinancialDataAPI } from "@/hooks/useFinancialDataAPI"
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
  const { data, addFixedExpense, updateFixedExpense, deleteFixedExpense, isLoading } = useFinancialDataAPI()
  const { toast } = useToast()
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
    try {
      if (editingExpense) {
        updateFixedExpense(editingExpense, formData)
        toast({
          type: "success",
          title: "Gasto fixo atualizado!",
          description: `${formData.name} foi atualizado com sucesso.`
        })
        setEditingExpense(null)
      } else {
        addFixedExpense(formData)
        toast({
          type: "success",
          title: "Gasto fixo adicionado!",
          description: `${formData.name} foi adicionado aos seus gastos fixos.`
        })
      }
      reset()
      setIsDialogOpen(false)
    } catch {
      toast({
        type: "error",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o gasto fixo. Tente novamente."
      })
    }
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
    const expense = data.fixedExpenses.find(e => e.id === id)
    if (confirm("Tem certeza que deseja excluir este gasto fixo?")) {
      deleteFixedExpense(id)
      toast({
        type: "success",
        title: "Gasto fixo removido!",
        description: expense ? `${expense.name} foi removido dos seus gastos fixos.` : "Gasto fixo removido com sucesso."
      })
    }
  }

  const toggleActive = (id: string, isActive: boolean) => {
    const expense = data.fixedExpenses.find(e => e.id === id)
    updateFixedExpense(id, { isActive: !isActive })
    toast({
      type: "info",
      title: !isActive ? "Gasto ativado!" : "Gasto desativado!",
      description: expense ? `${expense.name} foi ${!isActive ? 'ativado' : 'desativado'}.` : "Status alterado com sucesso."
    })
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10">
              <Receipt className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Gastos Fixos
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas despesas mensais recorrentes
              </p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-sm hover:shadow-md transition-all duration-300">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 via-red-50 to-red-100 dark:from-red-950/50 dark:via-red-950/30 dark:to-red-900/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-red-800 dark:text-red-200">Total de Gastos Ativos</CardTitle>
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                <Receipt className="h-4 w-4 text-red-700 dark:text-red-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {formatCurrency(totalActiveExpenses)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950/50 dark:via-blue-950/30 dark:to-blue-900/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-200">Gastos Cadastrados</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Receipt className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {data.fixedExpenses.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 via-green-50 to-green-100 dark:from-green-950/50 dark:via-green-950/30 dark:to-green-900/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-800 dark:text-green-200">Gastos Ativos</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <Receipt className="h-4 w-4 text-green-700 dark:text-green-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {data.fixedExpenses.filter(e => e.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Gastos */}
        <Card className="shadow-sm border-0 bg-gradient-to-br from-card to-card/50 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Receipt className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Lista de Gastos Fixos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {data.fixedExpenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <Receipt className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">Nenhum gasto fixo cadastrado</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Comece adicionando suas despesas mensais recorrentes como aluguel, financiamentos, assinaturas, etc.
                  </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} size="lg" className="mt-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Gasto
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.fixedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className={`p-6 rounded-xl border-0 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
                      expense.isActive 
                        ? "bg-gradient-to-r from-card via-card to-card/80" 
                        : "bg-gradient-to-r from-muted/30 via-muted/20 to-muted/10"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className={`font-semibold text-lg ${!expense.isActive ? "line-through text-muted-foreground" : ""}`}>
                            {expense.name}
                          </h3>
                          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-medium">
                            {getCategoryName(expense.category)}
                          </Badge>
                          {!expense.isActive && (
                            <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Valor:</span>
                            <span className="font-bold text-red-600 dark:text-red-400 text-base">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Vencimento:</span>
                            <span className="font-semibold">dia {expense.dueDay}</span>
                          </div>
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
                          className="hover:bg-muted/50 transition-all duration-200"
                        >
                          {expense.isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleEdit(expense)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(expense.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
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
