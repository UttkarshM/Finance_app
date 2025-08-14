"use client"

import { useState, useEffect } from "react"

interface CryptoData {
  id: string
  symbol: string
  name: string
  currentPrice: number
  change24h: number
  marketCap: number
  volume24h: number
  image?: string
}

export function useCryptoData() {
  const [data, setData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/crypto")

        if (!response.ok) {
          throw new Error("Failed to fetch crypto data")
        }

        const cryptoData = await response.json()
        setData(cryptoData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        // Fallback to mock data on error
        setData([
          {
            id: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
            currentPrice: 43200.0,
            change24h: 2.5,
            marketCap: 847000000000,
            volume24h: 15600000000,
          },
          {
            id: "ethereum",
            symbol: "ETH",
            name: "Ethereum",
            currentPrice: 2650.0,
            change24h: -1.2,
            marketCap: 318000000000,
            volume24h: 8900000000,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data every 60 seconds
    const interval = setInterval(fetchData, 60000)

    return () => clearInterval(interval)
  }, [])

  return { data, loading, error, refetch: () => setLoading(true) }
}
