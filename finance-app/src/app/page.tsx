"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, Wallet, PieChart } from "lucide-react"
import { useCryptoData } from "@/hooks/use-crypto-data"
import { useNewsData } from "@/hooks/use-news-data"
import { useDataStore } from "@/lib/data-store"
import { SharedHeader } from "@/components/shared-header"

export default function HomePage() {
  const { data: cryptoData, loading: cryptoLoading } = useCryptoData()
  const { data: newsData, loading: newsLoading } = useNewsData()

  const { expenses, cryptoHoldings, getTotalExpenses, getTotalPortfolioValue, getTotalInvested } = useDataStore()

  // Calculate real values from stored data
  const totalExpenses = getTotalExpenses()
  const monthlyExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      const currentDate = new Date()
      return (
        expenseDate.getMonth() === currentDate.getMonth() && expenseDate.getFullYear() === currentDate.getFullYear()
      )
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  // Create market prices map for portfolio calculation
  const marketPrices = cryptoData.reduce(
    (acc, coin) => {
      acc[coin.id] = coin.currentPrice
      return acc
    },
    {} as Record<string, number>,
  )

  const totalPortfolioValue = getTotalPortfolioValue(marketPrices)
  const totalInvested = getTotalInvested()
  const totalBalance = totalPortfolioValue + 5000 // Add some cash balance

  const cryptoValue = totalPortfolioValue

  // Get recent transactions from expenses
  const recentTransactions = expenses.slice(0, 4).map((expense) => ({
    id: expense.id,
    description: expense.description,
    amount: -expense.amount, // Expenses are negative
    date: expense.date,
    category: expense.category,
  }))

  // Calculate crypto holdings with live prices
  const cryptoHoldingsWithPrices = cryptoHoldings.map((holding) => {
    const marketCoin = cryptoData.find((coin) => coin.id === holding.id)
    const currentPrice = marketCoin?.currentPrice || holding.purchasePrice
    const change24h = marketCoin?.change24h || 0

    return {
      symbol: holding.symbol,
      name: holding.name,
      amount: holding.amount,
      value: holding.amount * currentPrice,
      change: change24h,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader isLoading={cryptoLoading || newsLoading} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Here's your financial overview with live market data.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  +5.2%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600 flex items-center">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  -2.1%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crypto Portfolio</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cryptoValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={`flex items-center ${totalPortfolioValue > totalInvested ? "text-green-600" : "text-red-600"}`}
                >
                  {totalPortfolioValue > totalInvested ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {totalInvested > 0 ? (((totalPortfolioValue - totalInvested) / totalInvested) * 100).toFixed(1) : 0}%
                </span>
                {cryptoLoading ? "Updating..." : "Live prices"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBalance > 0 ? (((totalBalance - monthlyExpenses) / totalBalance) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  +1.2%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{transaction.category}</Badge>
                      <span
                        className={`text-sm font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <a href="/expenses">View All Transactions</a>
              </Button>
            </CardContent>
          </Card>

          {/* Crypto Holdings */}
          <Card>
            <CardHeader>
              <CardTitle>Crypto Holdings</CardTitle>
              <CardDescription>Your cryptocurrency portfolio with live prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cryptoHoldingsWithPrices.slice(0, 3).map((crypto) => (
                  <div key={crypto.symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{crypto.symbol}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{crypto.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {crypto.amount} {crypto.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${crypto.value.toLocaleString()}</p>
                      <p className={`text-xs ${crypto.change > 0 ? "text-green-600" : "text-red-600"}`}>
                        {crypto.change > 0 ? "+" : ""}
                        {crypto.change.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <a href="/portfolio">View Full Portfolio</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your finances quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col space-y-2" asChild>
                  <a href="/expenses">
                    <DollarSign className="h-6 w-6" />
                    <span>Add Expense</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent" asChild>
                  <a href="/portfolio">
                    <Wallet className="h-6 w-6" />
                    <span>Buy Crypto</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
                  <PieChart className="h-6 w-6" />
                  <span>Budget Planner</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {newsData.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Financial News</CardTitle>
                <CardDescription>Latest cryptocurrency and financial news</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsData.slice(0, 3).map((article) => (
                    <div key={article.id} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{article.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{article.source}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
