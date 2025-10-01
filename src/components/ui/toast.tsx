"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { createContext, useContext, useEffect, useState } from "react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Auto dismiss after duration
    setTimeout(() => {
      dismiss(id)
    }, toast.duration || 5000)
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(toast.id), 150)
  }

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
      case "error":
        return "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
      default:
        return "border-gray-200 bg-white text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
        getToastStyles(toast.type),
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-medium">{toast.title}</h4>
          {toast.description && (
            <p className="mt-1 text-sm opacity-90">{toast.description}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
