import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Fetch detailed coin data and price history
    const [coinResponse, historyResponse] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 }, // Cache for 5 minutes
        },
      ),
      fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      }),
    ])

    if (!coinResponse.ok || !historyResponse.ok) {
      throw new Error("Failed to fetch coin data")
    }

    const coinData = await coinResponse.json()
    const historyData = await historyResponse.json()

    const transformedData = {
      id: coinData.id,
      symbol: coinData.symbol.toUpperCase(),
      name: coinData.name,
      currentPrice: coinData.market_data.current_price.usd,
      change24h: coinData.market_data.price_change_percentage_24h || 0,
      marketCap: coinData.market_data.market_cap.usd,
      volume24h: coinData.market_data.total_volume.usd,
      image: coinData.image.large,
      description: coinData.description.en,
      priceHistory: historyData.prices.map((price: [number, number]) => ({
        timestamp: price[0],
        price: price[1],
        date: new Date(price[0]).toLocaleDateString(),
      })),
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching coin data:", error)
    return NextResponse.json({ error: "Failed to fetch coin data" }, { status: 500 })
  }
}
