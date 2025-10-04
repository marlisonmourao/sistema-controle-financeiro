"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinancialDataAPI } from "@/hooks/useFinancialDataAPI"
import { formatCurrency } from "@/lib/storage"
import { investmentSchema } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Edit, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

const InvestmentType = {
  stocks: "Ações",
  bonds: "Títulos",
  funds: "Fundos",
  crypto: "Criptomoedas",
  real_estate: "Imóveis",
  other: "Outros"
} as const

type InvestmentTypeKey = keyof typeof InvestmentType

export default function InvestmentsPage() {
  const { data, addInvestment, updateInvestment, deleteInvestment } = useFinancialDataAPI()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(investmentSchema.omit({ id: true, createdAt: true, updatedAt: true, isActive: true })),
    defaultValues: {
      name: "",
      type: "stocks" as InvestmentTypeKey,
      initialAmount: 0,
      currentAmount: 0,
      purchaseDate: new Date(),
      description: "",
    }
  })

  const onSubmit = (values: {
    name: string;
    type: InvestmentTypeKey;
    initialAmount: number;
    currentAmount: number;
    purchaseDate: Date;
    description?: string;
  }) => {
    if (editingInvestment) {
      updateInvestment(editingInvestment, values)
      setEditingInvestment(null)
    } else {
      addInvestment(values)
    }
    form.reset()
    setIsDialogOpen(false)
  }

  const handleEdit = (investment: {
    id: string;
    name: string;
    type: InvestmentTypeKey;
    initialAmount: number;
    currentAmount: number;
    purchaseDate: Date;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) => {
    setEditingInvestment(investment.id)
    form.reset({
      name: investment.name,
      type: investment.type,
      initialAmount: investment.initialAmount,
      currentAmount: investment.currentAmount,
      purchaseDate: investment.purchaseDate,
      description: investment.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este investimento?")) {
      deleteInvestment(id)
    }
  }

  const handleCancel = () => {
    setEditingInvestment(null)
    form.reset()
    setIsDialogOpen(false)
  }

  const calculatePerformance = (initial: number, current: number) => {
    if (initial === 0) return 0
    return ((current - initial) / initial) * 100
  }

  const getPerformanceColor = (performance: number) => {
    if (performance > 0) return "text-green-600"
    if (performance < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const getPerformanceIcon = (performance: number) => {
    if (performance > 0) return <TrendingUp className="h-4 w-4" />
    if (performance < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  const totalInitialValue = data.investments
    .filter(inv => inv.isActive)
    .reduce((sum, inv) => sum + inv.initialAmount, 0)

  const totalCurrentValue = data.investments
    .filter(inv => inv.isActive)
    .reduce((sum, inv) => sum + inv.currentAmount, 0)

  const totalPerformance = calculatePerformance(totalInitialValue, totalCurrentValue)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho dos seus investimentos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCancel()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingInvestment ? "Editar Investimento" : "Novo Investimento"}
                </DialogTitle>
                <DialogDescription>
                  {editingInvestment 
                    ? "Atualize as informações do investimento."
                    : "Registre um novo investimento para acompanhar seu desempenho."
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
                        <FormLabel>Nome do Investimento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ações da Petrobras, CDB..." {...field} />
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
                            <SelectItem value="stocks">Ações</SelectItem>
                            <SelectItem value="bonds">Títulos</SelectItem>
                            <SelectItem value="funds">Fundos</SelectItem>
                            <SelectItem value="crypto">Criptomoedas</SelectItem>
                            <SelectItem value="real_estate">Imóveis</SelectItem>
                            <SelectItem value="other">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="initialAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Inicial</FormLabel>
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
                      name="currentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Atual</FormLabel>
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
                  </div>
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Compra</FormLabel>
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
                      {editingInvestment ? "Atualizar" : "Adicionar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo Geral */}
        {data.investments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total Investido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalInitialValue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalCurrentValue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Performance Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center gap-2 ${getPerformanceColor(totalPerformance)}`}>
                  {getPerformanceIcon(totalPerformance)}
                  {totalPerformance.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(totalCurrentValue - totalInitialValue)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Investimentos */}
        {data.investments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum investimento cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece registrando seus investimentos para acompanhar o desempenho
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Investimento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {data.investments.map((investment) => {
              const performance = calculatePerformance(investment.initialAmount, investment.currentAmount)
              const gainLoss = investment.currentAmount - investment.initialAmount
              
              return (
                <Card key={investment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{investment.name}</h3>
                          <Badge variant="secondary">
                            {InvestmentType[investment.type]}
                          </Badge>
                          {!investment.isActive && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Valor Inicial</p>
                            <p className="font-semibold">{formatCurrency(investment.initialAmount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Valor Atual</p>
                            <p className="font-semibold">{formatCurrency(investment.currentAmount)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center gap-1 ${getPerformanceColor(performance)}`}>
                            {getPerformanceIcon(performance)}
                            <span className="font-semibold">
                              {performance.toFixed(2)}%
                            </span>
                          </div>
                          <div className={`text-sm ${getPerformanceColor(performance)}`}>
                            {formatCurrency(gainLoss)}
                          </div>
                        </div>
                        {investment.description && (
                          <p className="text-sm text-muted-foreground">
                            {investment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Comprado em {new Date(investment.purchaseDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(investment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(investment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
