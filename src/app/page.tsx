"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinancialData } from "@/hooks/useFinancialData"
import { formatCurrency, getCategoryColor, getCategoryName } from "@/lib/storage"
import { ExpenseCategoryKey } from "@/lib/types"
import { AlertCircle, DollarSign, Plus, Receipt, TrendingDown, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function Dashboard() {
  const { data, summary, isLoading } = useFinancialData()

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

  // Preparar dados para gráfico de pizza (categorias)
  const pieData = Object.entries(summary.expensesByCategory)
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      name: getCategoryName(category as ExpenseCategoryKey),
      value,
      color: getCategoryColor(category as ExpenseCategoryKey)
    }))

  // Preparar dados para gráfico de barras (comparativo)
  const barData = [
    {
      name: "Receita",
      valor: summary.totalIncome,
      fill: "#22c55e"
    },
    {
      name: "Gastos Fixos",
      valor: summary.totalFixedExpenses,
      fill: "#ef4444"
    },
    {
      name: "Gastos Variáveis",
      valor: summary.totalVariableExpenses,
      fill: "#f97316"
    }
  ]

  const hasData = data.salary || data.fixedExpenses.length > 0 || data.variableExpenses.length > 0

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças pessoais
          </p>
        </div>

        {/* Quick Actions - Mobile Only */}
        <div className="md:hidden">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild size="sm" className="h-auto p-3">
                  <Link href="/salary" className="flex flex-col items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-xs">Salário</span>
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="h-auto p-3">
                  <Link href="/fixed-expenses" className="flex flex-col items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    <span className="text-xs">G. Fixos</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {!hasData ? (
          // Estado inicial - sem dados
          <div className="text-center space-y-6 py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Bem-vindo ao seu Controle Financeiro!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Para começar, cadastre seu salário e seus gastos fixos e variáveis
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/salary">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Cadastrar Salário
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/fixed-expenses">
                  <Receipt className="mr-2 h-4 w-4" />
                  Adicionar Gastos Fixos
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalIncome)}
                  </div>
                  {!data.salary && (
                    <Badge variant="outline" className="mt-2">
                      <Link href="/salary" className="text-xs">
                        + Cadastrar salário
                      </Link>
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gastos Fixos</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalFixedExpenses)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.fixedExpenses.filter(e => e.isActive).length} gastos ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gastos Variáveis</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(summary.totalVariableExpenses)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Restante</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    summary.remainingBalance >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatCurrency(summary.remainingBalance)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.remainingBalance >= 0 ? "Você está no azul!" : "Atenção aos gastos"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Barras - Comparativo */}
              <Card>
                <CardHeader>
                  <CardTitle>Receitas vs Gastos</CardTitle>
                  <CardDescription>
                    Comparativo entre sua receita e gastos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="valor" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Pizza - Gastos por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Gastos por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição dos seus gastos por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center space-y-2">
                        <AlertCircle className="h-12 w-12 mx-auto" />
                        <p>Nenhum gasto cadastrado ainda</p>
                        <Button asChild size="sm">
                          <Link href="/fixed-expenses">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Gastos
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Últimas Atividades */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Rápido</CardTitle>
                <CardDescription>
                  Status atual das suas finanças
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total de gastos fixos cadastrados:</span>
                    <Badge variant="secondary">{data.fixedExpenses.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gastos variáveis este mês:</span>
                    <Badge variant="secondary">{data.variableExpenses.filter(e => {
                      const now = new Date()
                      const expenseDate = new Date(e.date)
                      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
                    }).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maior categoria de gastos:</span>
                    <Badge variant="outline">
                      {pieData.length > 0 
                        ? pieData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name
                        : "Nenhuma"
                      }
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  )
}