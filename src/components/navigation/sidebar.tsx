"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    DollarSign,
    LayoutDashboard,
    Menu,
    Receipt,
    TrendingDown,
    TrendingUp,
    Wallet,
    X
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard
  },
  {
    title: "Salário",
    href: "/salary",
    icon: DollarSign
  },
  {
    title: "Receitas Fixas",
    href: "/fixed-incomes",
    icon: DollarSign
  },
  {
    title: "Receitas Variáveis",
    href: "/variable-incomes",
    icon: TrendingUp
  },
  {
    title: "Investimentos",
    href: "/investments",
    icon: TrendingUp
  },
  {
    title: "Gastos Fixos",
    href: "/fixed-expenses",
    icon: Receipt
  },
  {
    title: "Gastos Variáveis",
    href: "/variable-expenses",
    icon: TrendingDown
  }
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-6 py-6">
        <div className="px-4 py-2">
          <div className="flex items-center mb-8">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 mr-3">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Controle
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Financeiro
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-11 transition-all duration-300 group",
                    isActive 
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border border-primary/20" 
                      : "hover:bg-muted/50 hover:translate-x-1"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className={cn(
                      "mr-3 h-4 w-4 transition-all duration-300",
                      isActive ? "text-primary" : "group-hover:scale-110"
                    )} />
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile Sidebar com overlay
export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Abrir menu</span>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 border-r shadow-xl transform transition-all duration-300 ease-out md:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 mr-2">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Controle Financeiro
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="hover:bg-muted/50 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-2">
          <Sidebar />
        </div>
      </div>
    </>
  )
}
