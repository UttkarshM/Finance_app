import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Using a free news API (you can replace with your preferred news service)
    const response = await fetch(
      "https://newsapi.org/v2/everything?q=cryptocurrency+bitcoin+ethereum&sortBy=publishedAt&pageSize=10&apiKey=demo", // Replace with actual API key
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 1800 }, // Cache for 30 minutes
      },
    )

    if (!response.ok) {
      // Return mock data if API fails
      return NextResponse.json([
        {
          id: "1",
          title: "Bitcoin Reaches New Heights",
          description: "Bitcoin continues its upward trend as institutional adoption grows.",
          url: "#",
          publishedAt: new Date().toISOString(),
          source: "Crypto News",
        },
        {
          id: "2",
          title: "Ethereum 2.0 Updates",
          description: "Latest developments in Ethereum network improvements.",
          url: "#",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: "Blockchain Today",
        },
      ])
    }

    const data = await response.json()

    const transformedData =
      data.articles?.slice(0, 10).map((article: any, index: number) => ({
        id: index.toString(),
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
      })) || []

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching news:", error)
    // Return mock data on error
    return NextResponse.json([
      {
        id: "1",
        title: "Bitcoin Market Analysis",
        description: "Current market trends and analysis for Bitcoin.",
        url: "#",
        publishedAt: new Date().toISOString(),
        source: "Finance News",
      },
    ])
  }
}
