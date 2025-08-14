from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Common cryptocurrency symbols for Yahoo Finance
CRYPTO_SYMBOLS = {
    'bitcoin': 'BTC-USD',
    'ethereum': 'ETH-USD',
    'cardano': 'ADA-USD',
    'solana': 'SOL-USD',
    'dogecoin': 'DOGE-USD',
    'chainlink': 'LINK-USD',
    'polkadot': 'DOT-USD',
    'litecoin': 'LTC-USD',
    'bitcoin-cash': 'BCH-USD',
    'stellar': 'XLM-USD',
    'xrp': 'XRP-USD',
    'matic': 'MATIC-USD',
    'avalanche': 'AVAX-USD',
    'shiba-inu': 'SHIB-USD',
    'uniswap': 'UNI-USD'
}

def get_crypto_symbol(crypto_id):
    """Convert crypto ID to Yahoo Finance symbol"""
    return CRYPTO_SYMBOLS.get(crypto_id.lower(), f"{crypto_id.upper()}-USD")

@app.route('/api/crypto', methods=['GET'])
def get_crypto_list():
    """Get list of popular cryptocurrencies with current prices"""
    try:
        crypto_data = []
        
        # Get current prices for popular cryptos
        symbols = list(CRYPTO_SYMBOLS.values())[:10]  # Get top 10 for performance
        
        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period="1d")
                
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    prev_close = hist['Open'].iloc[0] if len(hist) > 0 else current_price
                    price_change = current_price - prev_close
                    price_change_percent = (price_change / prev_close) * 100 if prev_close != 0 else 0
                    
                    crypto_data.append({
                        'id': symbol.replace('-USD', '').lower(),
                        'symbol': symbol.replace('-USD', ''),
                        'name': info.get('longName', symbol.replace('-USD', '')),
                        'current_price': round(float(current_price), 8),
                        'price_change_24h': round(float(price_change), 8),
                        'price_change_percentage_24h': round(float(price_change_percent), 2),
                        'market_cap': info.get('marketCap', 0),
                        'volume': info.get('volume24Hr', hist['Volume'].iloc[-1] if not hist.empty else 0),
                        'last_updated': datetime.now().isoformat()
                    })
            except Exception as e:
                logger.error(f"Error fetching data for {symbol}: {str(e)}")
                continue
        
        return jsonify(crypto_data)
    
    except Exception as e:
        logger.error(f"Error in get_crypto_list: {str(e)}")
        return jsonify({'error': 'Failed to fetch cryptocurrency data'}), 500

@app.route('/api/crypto/<crypto_id>', methods=['GET'])
def get_crypto_detail(crypto_id):
    """Get detailed information for a specific cryptocurrency"""
    try:
        symbol = get_crypto_symbol(crypto_id)
        ticker = yf.Ticker(symbol)
        
        # Get basic info
        info = ticker.info
        
        # Get historical data
        period = request.args.get('period', '7d')  # Default to 7 days
        hist = ticker.history(period=period)
        
        if hist.empty:
            return jsonify({'error': 'No data found for this cryptocurrency'}), 404
        
        # Calculate price changes
        current_price = hist['Close'].iloc[-1]
        prev_close = hist['Close'].iloc[0] if len(hist) > 1 else current_price
        price_change = current_price - prev_close
        price_change_percent = (price_change / prev_close) * 100 if prev_close != 0 else 0
        
        # Prepare historical data for charts
        historical_data = []
        for index, row in hist.iterrows():
            historical_data.append({
                'timestamp': index.isoformat(),
                'price': round(float(row['Close']), 8),
                'volume': int(row['Volume']) if pd.notna(row['Volume']) else 0,
                'high': round(float(row['High']), 8),
                'low': round(float(row['Low']), 8),
                'open': round(float(row['Open']), 8)
            })
        
        # Calculate additional metrics
        high_52w = hist['High'].max() if len(hist) > 0 else current_price
        low_52w = hist['Low'].min() if len(hist) > 0 else current_price
        avg_volume = hist['Volume'].mean() if len(hist) > 0 else 0
        
        crypto_detail = {
            'id': crypto_id,
            'symbol': symbol.replace('-USD', ''),
            'name': info.get('longName', crypto_id.upper()),
            'current_price': round(float(current_price), 8),
            'price_change_24h': round(float(price_change), 8),
            'price_change_percentage_24h': round(float(price_change_percent), 2),
            'market_cap': info.get('marketCap', 0),
            'volume': int(hist['Volume'].iloc[-1]) if not hist.empty and pd.notna(hist['Volume'].iloc[-1]) else 0,
            'high_24h': round(float(hist['High'].iloc[-1]), 8) if not hist.empty else current_price,
            'low_24h': round(float(hist['Low'].iloc[-1]), 8) if not hist.empty else current_price,
            'high_52w': round(float(high_52w), 8),
            'low_52w': round(float(low_52w), 8),
            'average_volume': int(avg_volume),
            'last_updated': datetime.now().isoformat(),
            'historical_data': historical_data
        }
        
        return jsonify(crypto_detail)
    
    except Exception as e:
        logger.error(f"Error in get_crypto_detail for {crypto_id}: {str(e)}")
        return jsonify({'error': f'Failed to fetch data for {crypto_id}'}), 500

@app.route('/api/crypto/<crypto_id>/history', methods=['GET'])
def get_crypto_history(crypto_id):
    """Get historical price data for a cryptocurrency"""
    try:
        symbol = get_crypto_symbol(crypto_id)
        period = request.args.get('period', '30d')  # Default to 30 days
        interval = request.args.get('interval', '1d')  # Default to daily
        
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            return jsonify({'error': 'No historical data found'}), 404
        
        historical_data = []
        for index, row in hist.iterrows():
            historical_data.append({
                'timestamp': index.isoformat(),
                'open': round(float(row['Open']), 8),
                'high': round(float(row['High']), 8),
                'low': round(float(row['Low']), 8),
                'close': round(float(row['Close']), 8),
                'volume': int(row['Volume']) if pd.notna(row['Volume']) else 0
            })
        
        return jsonify({
            'symbol': symbol,
            'period': period,
            'interval': interval,
            'data': historical_data
        })
    
    except Exception as e:
        logger.error(f"Error in get_crypto_history for {crypto_id}: {str(e)}")
        return jsonify({'error': f'Failed to fetch historical data for {crypto_id}'}), 500

@app.route('/api/search', methods=['GET'])
def search_crypto():
    """Search for cryptocurrency by symbol or name"""
    try:
        query = request.args.get('q', '').lower()
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Search in our predefined symbols
        results = []
        for crypto_id, symbol in CRYPTO_SYMBOLS.items():
            if query in crypto_id or query in symbol.lower():
                try:
                    ticker = yf.Ticker(symbol)
                    info = ticker.info
                    hist = ticker.history(period="1d")
                    
                    if not hist.empty:
                        current_price = hist['Close'].iloc[-1]
                        results.append({
                            'id': crypto_id,
                            'symbol': symbol.replace('-USD', ''),
                            'name': info.get('longName', crypto_id.upper()),
                            'current_price': round(float(current_price), 8)
                        })
                except Exception as e:
                    logger.error(f"Error searching for {symbol}: {str(e)}")
                    continue
        
        return jsonify(results)
    
    except Exception as e:
        logger.error(f"Error in search_crypto: {str(e)}")
        return jsonify({'error': 'Search failed'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'crypto-data-api'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

