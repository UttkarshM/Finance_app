"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Wallet, Plus, Minus } from "lucide-react"
import { PortfolioChart } from "@/components/portfolio-chart"
import { CoinChart } from "@/components/coin-chart"
import { BuySellForm } from "@/components/buy-sell-form"
import { useCryptoData } from "@/hooks/use-crypto-data"
import { useDataStore } from "@/lib/data-store"
import { SharedHeader } from "@/components/shared-header"

interface CryptoHolding {
  id: string
  symbol: string
  name: string
  amount: number
  currentPrice: number
  purchasePrice: number
  change24h: number
  marketCap: number
  volume24h: number
}

export default function PortfolioPage() {
  const { data: marketData, loading: marketLoading, error: marketError } = useCryptoData()

  const { cryptoHoldings: storedHoldings, updateCryptoHolding } = useDataStore()

  const [holdings, setHoldings] = useState<CryptoHolding[]>([])
  const [selectedCoin, setSelectedCoin] = useState<CryptoHolding | null>(null)
  const [isBuySellOpen, setIsBuySellOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<"buy" | "sell">("buy")

  useEffect(() => {
    // Merge stored holdings with market data
    const updatedHoldings = storedHoldings.map((holding) => {
      const marketCoin = marketData.find((coin) => coin.id === holding.id)
      return {
        id: holding.id,
        symbol: holding.symbol,
        name: holding.name,
        amount: holding.amount,
        currentPrice: marketCoin?.currentPrice || holding.purchasePrice,
        purchasePrice: holding.purchasePrice,
        change24h: marketCoin?.change24h || 0,
        marketCap: marketCoin?.marketCap || 0,
        volume24h: marketCoin?.volume24h || 0,
      }
    })
    setHoldings(updatedHoldings)
  }, [marketData, storedHoldings])

  const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.amount * holding.currentPrice, 0)
  const totalInvested = holdings.reduce((sum, holding) => sum + holding.amount * holding.purchasePrice, 0)
  const totalGainLoss = totalPortfolioValue - totalInvested
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  const handleBuySell = (coinId: string, type: "buy" | "sell", amount: number, price: number) => {
    const holding = storedHoldings.find((h) => h.id === coinId)
    if (holding) {
      const newAmount = type === "buy" ? holding.amount + amount : Math.max(0, holding.amount - amount)
      updateCryptoHolding(coinId, { amount: newAmount })
    }
    setIsBuySellOpen(false)
  }

  const openBuySell = (coin: CryptoHolding, type: "buy" | "sell") => {
    setSelectedCoin(coin)
    setTransactionType(type)
    setIsBuySellOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader isLoading={marketLoading} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Crypto Portfolio</h2>
          <p className="text-muted-foreground">Track your cryptocurrency investments and performance</p>
          {marketError && <p className="text-sm text-red-600 mt-2">Using cached data - {marketError}</p>}
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Current portfolio value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Amount invested</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {totalGainLoss >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toFixed(2)}
              </div>
              <p className={`text-xs ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalGainLoss >= 0 ? "+" : ""}
                {totalGainLossPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings</CardTitle>
              <Badge variant="secondary">{holdings.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{holdings.length}</div>
              <p className="text-xs text-muted-foreground">Different coins</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
                <CardDescription>Current cryptocurrency positions with live prices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {holdings.map((holding) => {
                    const currentValue = holding.amount * holding.currentPrice
                    const investedValue = holding.amount * holding.purchasePrice
                    const gainLoss = currentValue - investedValue
                    const gainLossPercentage = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0

                    return (
                      <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-sm">{holding.symbol}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{holding.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {holding.amount} {holding.symbol}
                            </p>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Current Price</p>
                          <p className="font-medium">${holding.currentPrice.toLocaleString()}</p>
                          <p className={`text-xs ${holding.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {holding.change24h >= 0 ? "+" : ""}
                            {holding.change24h.toFixed(2)}%
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Holdings Value</p>
                          <p className="font-medium">${currentValue.toLocaleString()}</p>
                          <p className={`text-xs ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)} ({gainLoss >= 0 ? "+" : ""}
                            {gainLossPercentage.toFixed(2)}%)
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openBuySell(holding, "buy")}
                            className="bg-transparent"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openBuySell(holding, "sell")}
                            className="bg-transparent"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Sell
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PortfolioChart holdings={holdings} />
              <Card>
                <CardHeader>
                  <CardTitle>Individual Performance</CardTitle>
                  <CardDescription>Performance by coin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {holdings.map((holding) => {
                      const currentValue = holding.amount * holding.currentPrice
                      const investedValue = holding.amount * holding.purchasePrice
                      const gainLoss = currentValue - investedValue
                      const gainLossPercentage = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0

                      return (
                        <div key={holding.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">{holding.symbol}</span>
                            </div>
                            <span className="font-medium">{holding.name}</span>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)}
                            </p>
                            <p className={`text-xs ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {gainLoss >= 0 ? "+" : ""}
                              {gainLossPercentage.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Data</CardTitle>
                  <CardDescription>Current market information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {holdings.map((holding) => (
                      <div key={holding.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{holding.name}</span>
                          <Badge variant="secondary">{holding.symbol}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Market Cap</p>
                            <p className="font-medium">${(holding.marketCap / 1000000000).toFixed(1)}B</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">24h Volume</p>
                            <p className="font-medium">${(holding.volume24h / 1000000000).toFixed(1)}B</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <CoinChart />
            </div>
          </TabsContent>
        </Tabs>

        {/* Buy/Sell Dialog */}
        <Dialog open={isBuySellOpen} onOpenChange={setIsBuySellOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {transactionType === "buy" ? "Buy" : "Sell"} {selectedCoin?.name}
              </DialogTitle>
              <DialogDescription>
                {transactionType === "buy" ? "Purchase" : "Sell"} {selectedCoin?.symbol} at current market price
              </DialogDescription>
            </DialogHeader>
            {selectedCoin && (
              <BuySellForm
                coin={selectedCoin}
                type={transactionType}
                onSubmit={(amount, price) => handleBuySell(selectedCoin.id, transactionType, amount, price)}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
