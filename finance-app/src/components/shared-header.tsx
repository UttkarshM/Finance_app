"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { usePathname } from "next/navigation"

interface SharedHeaderProps {
  isLoading?: boolean
}

export function SharedHeader({ isLoading }: SharedHeaderProps) {
  const pathname = usePathname()

  const getActiveButton = (path: string) => {
    return pathname === path ? "default" : "ghost"
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">FinanceTracker</h1>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-xs text-muted-foreground">Live data</span>
              </div>
            )}
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant={getActiveButton("/")} asChild>
              <a href="/">Dashboard</a>
            </Button>
            <Button variant={getActiveButton("/expenses")} asChild>
              <a href="/expenses">Expenses</a>
            </Button>
            <Button variant={getActiveButton("/portfolio")} asChild>
              <a href="/portfolio">Portfolio</a>
            </Button>
            <Button variant="ghost">Settings</Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
