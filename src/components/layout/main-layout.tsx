"use client"

import { MobileSidebar, Sidebar } from "@/components/navigation/sidebar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useFinancialData } from "@/hooks/useFinancialData"
import { formatCurrency } from "@/lib/storage"


interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { summary, isLoading } = useFinancialData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center px-4">
          <MobileSidebar />
          
          {/* Header Summary - Visible on larger screens */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
              </>
            ) : (
              <>
                <Card className="px-4 py-2 shadow-sm border-0 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
                  <CardContent className="p-0">
                    <div className="text-xs text-muted-foreground font-medium">Saldo</div>
                    <div className={`text-sm font-bold ${
                      summary.remainingBalance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                    }`}>
                      {formatCurrency(summary.remainingBalance)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="px-4 py-2 shadow-sm border-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                  <CardContent className="p-0">
                    <div className="text-xs text-muted-foreground font-medium">Receita</div>
                    <div className="text-sm font-bold text-blue-700 dark:text-blue-400">
                      {formatCurrency(summary.totalIncome)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="px-4 py-2 shadow-sm border-0 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50">
                  <CardContent className="p-0">
                    <div className="text-xs text-muted-foreground font-medium">Gastos</div>
                    <div className="text-sm font-bold text-red-700 dark:text-red-400">
                      {formatCurrency(summary.totalExpenses)}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          <div className="container p-4 md:p-6 lg:p-8">
            {/* Mobile Summary Cards */}
            <div className="lg:hidden mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">Saldo Restante</div>
                    <div className={`text-xl font-bold ${
                      summary.remainingBalance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                    }`}>
                      {formatCurrency(summary.remainingBalance)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">Total de Gastos</div>
                    <div className="text-xl font-bold text-red-700 dark:text-red-400">
                      {formatCurrency(summary.totalExpenses)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Theme toggle for mobile */}
              <div className="flex justify-end mt-4">
                <ThemeToggle />
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
