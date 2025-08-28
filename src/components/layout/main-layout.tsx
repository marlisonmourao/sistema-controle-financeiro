"use client"

import { MobileSidebar, Sidebar } from "@/components/navigation/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { useFinancialData } from "@/hooks/useFinancialData"
import { formatCurrency } from "@/lib/storage"


interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { summary, isLoading } = useFinancialData()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <MobileSidebar />
          
          {/* Header Summary - Visible on larger screens */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            {!isLoading && (
              <>
                <Card className="px-3 py-1">
                  <CardContent className="p-0">
                    <div className="text-xs text-muted-foreground">Saldo</div>
                    <div className={`text-sm font-medium ${
                      summary.remainingBalance >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatCurrency(summary.remainingBalance)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="px-3 py-1">
                  <CardContent className="p-0">
                    <div className="text-xs text-muted-foreground">Receita</div>
                    <div className="text-sm font-medium text-blue-600">
                      {formatCurrency(summary.totalIncome)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="px-3 py-1">
                  <CardContent className="p-0">
                    <div className="text-xs text-muted-foreground">Gastos</div>
                    <div className="text-sm font-medium text-red-600">
                      {formatCurrency(summary.totalExpenses)}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col fixed left-0 top-14 h-[calc(100vh-3.5rem)] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          <div className="container p-4 md:p-6 lg:p-8">
            {/* Mobile Summary Cards */}
            <div className="lg:hidden mb-6">
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Saldo Restante</div>
                    <div className={`text-lg font-bold ${
                      summary.remainingBalance >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatCurrency(summary.remainingBalance)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Total de Gastos</div>
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(summary.totalExpenses)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
