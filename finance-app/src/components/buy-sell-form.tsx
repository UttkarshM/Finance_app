"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

interface BuySellFormProps {
  coin: CryptoHolding
  type: "buy" | "sell"
  onSubmit: (amount: number, price: number) => void
}

export function BuySellForm({ coin, type, onSubmit }: BuySellFormProps) {
  const [amount, setAmount] = useState("")
  const [useUSD, setUseUSD] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return

    const numAmount = Number.parseFloat(amount)
    const coinAmount = useUSD ? numAmount / coin.currentPrice : numAmount

    onSubmit(coinAmount, coin.currentPrice)
    setAmount("")
  }

  const totalValue = useUSD ? Number.parseFloat(amount || "0") : Number.parseFloat(amount || "0") * coin.currentPrice

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="font-medium">{coin.name}</p>
          <p className="text-sm text-muted-foreground">{coin.symbol}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">${coin.currentPrice.toLocaleString()}</p>
          <p className={`text-sm ${coin.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
            {coin.change24h >= 0 ? "+" : ""}
            {coin.change24h.toFixed(2)}%
          </p>
        </div>
      </div>

      {type === "sell" && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Available: {coin.amount} {coin.symbol}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="flex space-x-2">
          <Button type="button" variant={useUSD ? "default" : "outline"} size="sm" onClick={() => setUseUSD(true)}>
            USD
          </Button>
          <Button type="button" variant={!useUSD ? "default" : "outline"} size="sm" onClick={() => setUseUSD(false)}>
            {coin.symbol}
          </Button>
        </div>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder={useUSD ? "0.00" : `0.00 ${coin.symbol}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {amount && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Total {useUSD ? coin.symbol : "USD"}:</span>
            <span className="font-medium">
              {useUSD ? `${(totalValue / coin.currentPrice).toFixed(6)} ${coin.symbol}` : `$${totalValue.toFixed(2)}`}
            </span>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!amount}>
        {type === "buy" ? "Buy" : "Sell"} {coin.symbol}
      </Button>
    </form>
  )
}
