"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinancialDataAPI } from "@/hooks/useFinancialDataAPI"
import { formatCurrency, getIncomeTypeName } from "@/lib/storage"
import { variableIncomeSchema } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, DollarSign, Edit, Filter, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function VariableIncomesPage() {
  const { data, addVariableIncome, updateVariableIncome, deleteVariableIncome } = useFinancialDataAPI()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterMonth, setFilterMonth] = useState<string>("current")

  const form = useForm({
    resolver: zodResolver(variableIncomeSchema.omit({ id: true, createdAt: true })),
    defaultValues: {
      name: "",
      amount: 0,
      type: "freelance" as "freelance" | "business" | "investment" | "other",
      description: "",
      date: new Date(),
    }
  })

  const onSubmit = (values: {
    name: string;
    amount: number;
    type: "freelance" | "business" | "investment" | "other";
    description?: string;
    date: Date;
  }) => {
    if (editingIncome) {
      updateVariableIncome(editingIncome, values)
      setEditingIncome(null)
    } else {
      addVariableIncome(values)
    }
    form.reset()
    setIsDialogOpen(false)
  }

  const handleEdit = (income: {
    id: string;
    name: string;
    amount: number;
    type: "freelance" | "business" | "investment" | "other";
    description?: string;
    date: Date;
    createdAt: Date;
  }) => {
    setEditingIncome(income.id)
    form.reset({
      name: income.name,
      amount: income.amount,
      type: income.type,
      description: income.description || "",
      date: income.date,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta receita variável?")) {
      deleteVariableIncome(id)
    }
  }

  const handleCancel = () => {
    setEditingIncome(null)
    form.reset()
    setIsDialogOpen(false)
  }

  // Filtrar receitas
  const filteredIncomes = data.variableIncomes.filter(income => {
    const incomeDate = new Date(income.date)
    const now = new Date()
    
    // Filtro por tipo
    if (filterType !== "all" && income.type !== filterType) {
      return false
    }
    
    // Filtro por mês
    if (filterMonth === "current") {
      return incomeDate.getMonth() === now.getMonth() && 
             incomeDate.getFullYear() === now.getFullYear()
    } else if (filterMonth === "last") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      return incomeDate.getMonth() === lastMonth.getMonth() && 
             incomeDate.getFullYear() === lastMonth.getFullYear()
    }
    
    return true
  })

  // Calcular total filtrado
  const totalFiltered = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Receitas Variáveis</h1>
            <p className="text-muted-foreground">
              Registre suas receitas esporádicas e variáveis
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCancel()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita Variável
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIncome ? "Editar Receita Variável" : "Nova Receita Variável"}
                </DialogTitle>
                <DialogDescription>
                  {editingIncome 
                    ? "Atualize as informações da receita variável."
                    : "Registre uma receita esporádica ou variável."
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Freelance, Venda, Bônus..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="freelance">Freelance</SelectItem>
                            <SelectItem value="business">Negócio</SelectItem>
                            <SelectItem value="investment">Investimento</SelectItem>
                            <SelectItem value="other">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Detalhes adicionais..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingIncome ? "Atualizar" : "Adicionar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="business">Negócio</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Este mês</SelectItem>
                    <SelectItem value="last">Mês passado</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Receitas Variáveis */}
        {filteredIncomes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {data.variableIncomes.length === 0 
                  ? "Nenhuma receita variável cadastrada"
                  : "Nenhuma receita encontrada com os filtros aplicados"
                }
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {data.variableIncomes.length === 0
                  ? "Comece registrando suas receitas esporádicas"
                  : "Tente ajustar os filtros ou adicionar uma nova receita"
                }
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Receita
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredIncomes.map((income) => (
              <Card key={income.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{income.name}</h3>
                        <Badge variant="secondary">
                          {getIncomeTypeName(income.type)}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(income.amount)}
                      </p>
                      {income.description && (
                        <p className="text-sm text-muted-foreground">
                          {income.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(income.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(income)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(income.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Resumo */}
        {filteredIncomes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo das Receitas Variáveis</CardTitle>
              <CardDescription>
                Total das receitas variáveis filtradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalFiltered)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredIncomes.length} receitas encontradas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
