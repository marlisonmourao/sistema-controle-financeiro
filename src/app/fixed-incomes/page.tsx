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
import { fixedIncomeSchema } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, DollarSign, Edit, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export default function FixedIncomesPage() {
  const { data, addFixedIncome, updateFixedIncome, deleteFixedIncome } = useFinancialDataAPI()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<string | null>(null)

  const formSchema = fixedIncomeSchema.omit({ id: true, createdAt: true, updatedAt: true, isActive: true }).extend({
    amount: z.number().min(0, "Valor deve ser maior que zero").optional()
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: undefined as number | undefined,
      type: "salary" as "salary" | "other",
      description: "",
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.amount === undefined || values.amount < 0) {
      return; // Não enviar se o valor for inválido
    }
    
    if (editingIncome) {
      updateFixedIncome(editingIncome, { ...values, amount: values.amount })
      setEditingIncome(null)
    } else {
      addFixedIncome({ ...values, amount: values.amount })
    }
    form.reset()
    setIsDialogOpen(false)
  }

  const handleEdit = (income: {
    id: string;
    name: string;
    amount: number;
    type: "salary" | "other";
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) => {
    setEditingIncome(income.id)
    form.reset({
      name: income.name,
      amount: income.amount,
      type: income.type,
      description: income.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta receita fixa?")) {
      deleteFixedIncome(id)
    }
  }

  const handleCancel = () => {
    setEditingIncome(null)
    form.reset()
    setIsDialogOpen(false)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Receitas Fixas</h1>
            <p className="text-muted-foreground">
              Gerencie suas receitas mensais recorrentes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCancel()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita Fixa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIncome ? "Editar Receita Fixa" : "Nova Receita Fixa"}
                </DialogTitle>
                <DialogDescription>
                  {editingIncome 
                    ? "Atualize as informações da receita fixa."
                    : "Adicione uma nova receita que se repete mensalmente."
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
                          <Input placeholder="Ex: Salário, Aposentadoria..." {...field} />
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
                        <FormLabel>Valor Mensal</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === "") {
                                field.onChange(undefined)
                              } else {
                                const numValue = parseFloat(value)
                                if (!isNaN(numValue)) {
                                  field.onChange(numValue)
                                }
                              }
                            }}
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
                            <SelectItem value="salary">Salário</SelectItem>
                            <SelectItem value="other">Outros</SelectItem>
                          </SelectContent>
                        </Select>
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

        {/* Lista de Receitas Fixas */}
        {data.fixedIncomes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma receita fixa cadastrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece adicionando suas receitas mensais recorrentes
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeira Receita
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {data.fixedIncomes.map((income) => (
              <Card key={income.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{income.name}</h3>
                        <Badge variant="secondary">
                          {getIncomeTypeName(income.type)}
                        </Badge>
                        {!income.isActive && (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inativo
                          </Badge>
                        )}
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
                          Criado em {new Date(income.createdAt).toLocaleDateString("pt-BR")}
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
        {data.fixedIncomes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo das Receitas Fixas</CardTitle>
              <CardDescription>
                Total de receitas fixas ativas este mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  data.fixedIncomes
                    .filter(income => income.isActive)
                    .reduce((sum, income) => sum + income.amount, 0)
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {data.fixedIncomes.filter(income => income.isActive).length} receitas ativas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
