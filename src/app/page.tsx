"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useFinancialDataAPI } from "@/hooks/useFinancialDataAPI"
import { formatCurrency, getCategoryColor, getCategoryName, getIncomeTypeColor, getIncomeTypeName } from "@/lib/storage"
import { ExpenseCategoryKey, IncomeTypeKey } from "@/lib/types"
import { AlertCircle, DollarSign, Plus, Receipt, Sparkles, Target, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function Dashboard() {
  const { data, summary, isLoading } = useFinancialDataAPI()

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Preparar dados para gráfico de pizza (categorias de gastos)
  const expensesPieData = Object.entries(summary.expensesByCategory)
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      name: getCategoryName(category as ExpenseCategoryKey),
      value,
      color: getCategoryColor(category as ExpenseCategoryKey)
    }))

  // Preparar dados para gráfico de pizza (tipos de receita)
  const incomePieData = Object.entries(summary.incomeByType)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({
      name: getIncomeTypeName(type as IncomeTypeKey),
      value,
      color: getIncomeTypeColor(type as IncomeTypeKey)
    }))

  // Preparar dados para gráfico de barras (comparativo)
  const barData = [
    {
      name: "Receita Total",
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

  const hasData = data.salary || data.fixedIncomes.length > 0 || data.variableIncomes.length > 0 || data.investments.length > 0 || data.fixedExpenses.length > 0 || data.variableExpenses.length > 0

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Visão geral das suas finanças pessoais
              </p>
            </div>
          </div>
        </div>


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

          <div className="text-center space-y-8 py-16">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-sm">
              <Wallet className="w-16 h-16 text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Bem-vindo ao seu Controle Financeiro!
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                Para começar, cadastre seu salário e seus gastos fixos e variáveis. 
                Vamos ajudá-lo a ter controle total das suas finanças.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="shadow-sm hover:shadow-md transition-all duration-300">
                <Link href="/salary">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Cadastrar Salário
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-all duration-300">
                <Link href="/fixed-expenses">
                  <Receipt className="mr-2 h-5 w-5" />
                  Adicionar Gastos Fixos
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 via-green-50 to-green-100 dark:from-green-950/50 dark:via-green-950/30 dark:to-green-900/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-green-800 dark:text-green-200">Receita Total</CardTitle>
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                    <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                    {formatCurrency(summary.totalIncome)}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                    <div>Fixa: {formatCurrency(summary.totalFixedIncome)}</div>
                    <div>Variável: {formatCurrency(summary.totalVariableIncome)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950/50 dark:via-blue-950/30 dark:to-blue-900/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-200">Investimentos</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <TrendingUp className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                    {formatCurrency(summary.totalInvestmentValue)}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {summary.investmentPerformance >= 0 ? "+" : ""}{summary.investmentPerformance.toFixed(2)}% performance
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 via-red-50 to-red-100 dark:from-red-950/50 dark:via-red-950/30 dark:to-red-900/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-red-800 dark:text-red-200">Gastos Fixos</CardTitle>
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                    <Receipt className="h-4 w-4 text-red-700 dark:text-red-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
                    {formatCurrency(summary.totalFixedExpenses)}
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {data.fixedExpenses.filter(e => e.isActive).length} gastos ativos
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 dark:from-orange-950/50 dark:via-orange-950/30 dark:to-orange-900/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-orange-800 dark:text-orange-200">Gastos Variáveis</CardTitle>
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                    <TrendingDown className="h-4 w-4 text-orange-700 dark:text-orange-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-400 mb-2">
                    {formatCurrency(summary.totalVariableExpenses)}
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Este mês
                  </p>
                </CardContent>
              </Card>

              <Card className={`shadow-sm border-0 transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                summary.remainingBalance >= 0 
                  ? "bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950/50 dark:via-blue-950/30 dark:to-blue-900/50"
                  : "bg-gradient-to-br from-red-50 via-red-50 to-red-100 dark:from-red-950/50 dark:via-red-950/30 dark:to-red-900/50"
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className={`text-sm font-semibold ${
                    summary.remainingBalance >= 0 
                      ? "text-blue-800 dark:text-blue-200" 
                      : "text-red-800 dark:text-red-200"
                  }`}>
                    Saldo Restante
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${
                    summary.remainingBalance >= 0 
                      ? "bg-blue-100 dark:bg-blue-900/50" 
                      : "bg-red-100 dark:bg-red-900/50"
                  }`}>
                    <Target className={`h-4 w-4 ${
                      summary.remainingBalance >= 0 
                        ? "text-blue-700 dark:text-blue-300" 
                        : "text-red-700 dark:text-red-300"
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold mb-2 ${
                    summary.remainingBalance >= 0 
                      ? "text-blue-700 dark:text-blue-400" 
                      : "text-red-700 dark:text-red-400"
                  }`}>
                    {formatCurrency(summary.remainingBalance)}
                  </div>
                  <p className={`text-xs font-medium ${
                    summary.remainingBalance >= 0 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {summary.remainingBalance >= 0 ? "Você está no azul! 🎉" : "Atenção aos gastos ⚠️"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Barras - Comparativo */}
              <Card className="shadow-sm border-0 bg-gradient-to-br from-card to-card/50 transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Receitas vs Gastos</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Comparativo entre sua receita e gastos mensais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)} 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="valor" 
                        radius={[4, 4, 0, 0]}
                        className="drop-shadow-sm"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Pizza - Receitas por Tipo */}
              <Card className="shadow-sm border-0 bg-gradient-to-br from-card to-card/50 transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Receitas por Tipo</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Distribuição das suas receitas por tipo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {incomePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={incomePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        >
                          {incomePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                          <AlertCircle className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">Nenhuma receita cadastrada ainda</p>
                          <p className="text-sm text-muted-foreground">Adicione suas receitas para ver a distribuição</p>
                        </div>
                        <Button asChild size="sm" className="shadow-sm">
                          <Link href="/fixed-incomes">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Receitas
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Pizza - Gastos por Categoria */}
            {expensesPieData.length > 0 && (
              <Card className="shadow-sm border-0 bg-gradient-to-br from-card to-card/50 transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Receipt className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Gastos por Categoria</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Distribuição dos seus gastos por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expensesPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      >
                        {expensesPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Resumo Rápido */}
            <Card className="shadow-sm border-0 bg-gradient-to-br from-card to-card/50 transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Resumo Rápido</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Status atual das suas finanças pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-medium">Receitas fixas</span>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {data.fixedIncomes.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium">Investimentos</span>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {data.investments.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                        <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-sm font-medium">Gastos fixos</span>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {data.fixedExpenses.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50">
                        <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-sm font-medium">Gastos variáveis</span>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {data.variableExpenses.filter(e => {
                        const now = new Date()
                        const expenseDate = new Date(e.date)
                        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
                      }).length}
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