"use client"

import { useState, useEffect } from "react"

interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
}

export function useNewsData() {
  const [data, setData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/news")

        if (!response.ok) {
          throw new Error("Failed to fetch news data")
        }

        const newsData = await response.json()
        setData(newsData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh news every 30 minutes
    const interval = setInterval(fetchData, 1800000)

    return () => clearInterval(interval)
  }, [])

  return { data, loading, error }
}
