# Crypto Data API Server

A Flask-based API server that provides cryptocurrency data using the yfinance library.

## Features

- Real-time cryptocurrency prices
- Historical price data
- Market data (volume, market cap, etc.)
- Search functionality
- CORS enabled for web applications
- Comprehensive error handling
- Health check endpoint

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server**:
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Get Crypto List
**GET** `/api/crypto`

Returns a list of popular cryptocurrencies with current prices.

**Response Example**:
```json
[
  {
    "id": "btc",
    "symbol": "BTC",
    "name": "Bitcoin USD",
    "current_price": 45000.123456,
    "price_change_24h": 1000.12,
    "price_change_percentage_24h": 2.27,
    "market_cap": 850000000000,
    "volume": 25000000000,
    "last_updated": "2024-01-15T10:30:00.000000"
  }
]
```

### 2. Get Crypto Details
**GET** `/api/crypto/{crypto_id}?period=7d`

Returns detailed information for a specific cryptocurrency.

**Parameters**:
- `crypto_id`: Cryptocurrency identifier (e.g., "bitcoin", "ethereum")
- `period`: Time period for historical data (1d, 7d, 30d, 1y)

**Response Example**:
```json
{
  "id": "bitcoin",
  "symbol": "BTC",
  "name": "Bitcoin USD",
  "current_price": 45000.123456,
  "price_change_24h": 1000.12,
  "price_change_percentage_24h": 2.27,
  "market_cap": 850000000000,
  "volume": 25000000000,
  "high_24h": 46000.0,
  "low_24h": 44000.0,
  "high_52w": 69000.0,
  "low_52w": 15500.0,
  "average_volume": 20000000000,
  "last_updated": "2024-01-15T10:30:00.000000",
  "historical_data": [
    {
      "timestamp": "2024-01-08T00:00:00+00:00",
      "price": 44000.0,
      "volume": 18000000000,
      "high": 44500.0,
      "low": 43500.0,
      "open": 44000.0
    }
  ]
}
```

### 3. Get Historical Data
**GET** `/api/crypto/{crypto_id}/history?period=30d&interval=1d`

Returns historical price data for charting.

**Parameters**:
- `crypto_id`: Cryptocurrency identifier
- `period`: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
- `interval`: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)

### 4. Search Cryptocurrencies
**GET** `/api/search?q=bitcoin`

Search for cryptocurrencies by name or symbol.

**Parameters**:
- `q`: Search query

### 5. Health Check
**GET** `/health`

Returns server health status.

## Supported Cryptocurrencies

The server supports the following cryptocurrencies by default:
- Bitcoin (BTC)
- Ethereum (ETH)
- Cardano (ADA)
- Solana (SOL)
- Dogecoin (DOGE)
- Chainlink (LINK)
- Polkadot (DOT)
- Litecoin (LTC)
- Bitcoin Cash (BCH)
- Stellar (XLM)
- XRP (XRP)
- Polygon (MATIC)
- Avalanche (AVAX)
- Shiba Inu (SHIB)
- Uniswap (UNI)

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a JSON object with an `error` field describing the issue.

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all origins to allow web applications to consume the API.

## Development

The server runs in debug mode by default. For production deployment:

1. Set environment variables:
   ```bash
   export FLASK_ENV=production
   export SECRET_KEY=your-secret-key
   ```

2. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn app:app
   ```

## Notes

- The API uses Yahoo Finance data through the yfinance library
- Data is fetched in real-time (no caching implemented yet)
- Rate limiting is not implemented but can be added using Flask-Limiter
- The server includes comprehensive logging for debugging

