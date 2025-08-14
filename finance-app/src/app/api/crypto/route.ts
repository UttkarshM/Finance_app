import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch cryptocurrency data from CoinGecko API
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h",
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch crypto data")
    }

    const data = await response.json()

    // Transform the data to match our interface
    const transformedData = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      currentPrice: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      image: coin.image,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching crypto data:", error)
    return NextResponse.json({ error: "Failed to fetch cryptocurrency data" }, { status: 500 })
  }
}
