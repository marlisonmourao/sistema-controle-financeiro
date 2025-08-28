"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFinancialData } from "@/hooks/useFinancialData"
import { formatCurrency } from "@/lib/storage"
import { salarySchema } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { DollarSign, Edit, Save, Trash2, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const salaryFormSchema = salarySchema.omit({ updatedAt: true })
type SalaryFormData = z.infer<typeof salaryFormSchema>

export default function SalaryPage() {
  const { data, updateSalary, clearSalary, isLoading } = useFinancialData()
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      amount: data.salary?.amount || 0,
      description: data.salary?.description || ""
    }
  })

  const onSubmit = async (formData: SalaryFormData) => {
    updateSalary(formData)
    setIsEditing(false)
  }

  const handleEdit = () => {
    if (data.salary) {
      setValue("amount", data.salary.amount)
      setValue("description", data.salary.description)
    }
    setIsEditing(true)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja remover o salário cadastrado?")) {
      clearSalary()
    }
  }

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
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Salário</h1>
          <p className="text-muted-foreground">
            Configure sua receita mensal
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Cadastro/Edição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {data.salary ? "Editar Salário" : "Cadastrar Salário"}
              </CardTitle>
              <CardDescription>
                {data.salary ? "Atualize as informações do seu salário" : "Informe o valor da sua receita mensal"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor do Salário</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5000.00"
                    {...register("amount", { valueAsNumber: true })}
                    disabled={!!data.salary && !isEditing}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Salário - Empresa XYZ"
                    {...register("description")}
                    disabled={!!data.salary && !isEditing}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {(!data.salary || isEditing) && (
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Salvando..." : "Salvar"}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Informações do Salário Atual */}
          {data.salary && (
            <Card>
              <CardHeader>
                <CardTitle>Salário Atual</CardTitle>
                <CardDescription>
                  Informações do salário cadastrado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Valor</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(data.salary.amount)}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{data.salary.description}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Última Atualização</Label>
                  <p className="text-sm">
                    {data.salary.updatedAt.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>

                {!isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleEdit} size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button onClick={handleDelete} variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dicas e Informações */}
          <Card className={data.salary ? "lg:col-span-2" : ""}>
            <CardHeader>
              <CardTitle>Dicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">💡</Badge>
                  <p>
                    Considere incluir no salário outras receitas fixas como freelances recorrentes, 
                    aluguéis ou investimentos que rendem mensalmente.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">📊</Badge>
                  <p>
                    O valor do salário será usado como base para calcular seu saldo restante 
                    depois de descontar todos os gastos.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">🔒</Badge>
                  <p>
                    Todos os dados são armazenados localmente no seu navegador, 
                    garantindo sua privacidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
