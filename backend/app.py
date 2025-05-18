from flask import Flask, request, jsonify, make_response, g
import yfinance as yf
from flask_cors import CORS
import pandas as pd
from functools import lru_cache
from datetime import datetime, timedelta
import logging
import json
import requests
import os
import time
from dotenv import load_dotenv
import sys
import traceback
import re
import feedparser
from bs4 import BeautifulSoup

# Tambahkan path parsers ke sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'parsers'))

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

PORT = int(os.environ.get('PORT', 5000))
# Cache for stock data to reduce API calls
# Cache timeout in seconds (1 hour)
CACHE_TIMEOUT = 3600

# Finnhub API Key
FINNHUB_API_KEY = os.environ.get('FINNHUB_API_KEY', '')

# Daftar sumber berita Indonesia yang tersedia
INDONESIA_NEWS_SOURCES = {
    'antara': 'Antara News',
    'cnbc': 'CNBC Indonesia',
    'cnn': 'CNN Indonesia',
    'jpnn': 'JPNN',
    'republika': 'Republika',
    'sindonews': 'SINDOnews',
    'tempo': 'Tempo',
    'tribun': 'Tribun News',
}

# RSS feeds untuk sumber berita Indonesia
RSS_FEEDS = {
    'cnn': {
        'terbaru': 'https://www.cnnindonesia.com/rss',
        'nasional': 'https://www.cnnindonesia.com/nasional/rss',
        'ekonomi': 'https://www.cnnindonesia.com/ekonomi/rss',
        'olahraga': 'https://www.cnnindonesia.com/olahraga/rss',
        'teknologi': 'https://www.cnnindonesia.com/teknologi/rss',
        'hiburan': 'https://www.cnnindonesia.com/hiburan/rss',
        'internasional': 'https://www.cnnindonesia.com/internasional/rss'
    },
    'tribun': {
        'terbaru': 'https://www.tribunnews.com/rss',
        'bisnis': 'https://www.tribunnews.com/bisnis/rss',
        'sport': 'https://www.tribunnews.com/sport/rss',
        'seleb': 'https://www.tribunnews.com/seleb/rss',
        'lifestyle': 'https://www.tribunnews.com/lifestyle/rss',
        'travel': 'https://www.tribunnews.com/travel/rss',
        'otomotif': 'https://www.tribunnews.com/otomotif/rss',
        'techno': 'https://www.tribunnews.com/techno/rss'
    },
    'tempo': {
        'terbaru': 'https://rss.tempo.co/',
        'nasional': 'https://rss.tempo.co/nasional',
        'bisnis': 'https://rss.tempo.co/bisnis',
        'metro': 'https://rss.tempo.co/metro',
        'dunia': 'https://rss.tempo.co/dunia',
        'bola': 'https://rss.tempo.co/bola',
        'cantik': 'https://rss.tempo.co/cantik',
        'tekno': 'https://rss.tempo.co/tekno',
        'otomotif': 'https://rss.tempo.co/otomotif',
        'seleb': 'https://rss.tempo.co/seleb',
        'gaya': 'https://rss.tempo.co/gaya'
    },
    'republika': {
        'terbaru': 'https://www.republika.co.id/rss',
        'news': 'https://www.republika.co.id/rss/nasional',
        'daerah': 'https://www.republika.co.id/rss/daerah',
        'internasional': 'https://www.republika.co.id/rss/internasional',
        'ekonomi': 'https://www.republika.co.id/rss/ekonomi',
        'sepakbola': 'https://www.republika.co.id/rss/sepakbola',
        'leisure': 'https://www.republika.co.id/rss/leisure'
    },
    'jpnn': {
        'terbaru': 'https://www.jpnn.com/rss',
        'news': 'https://www.jpnn.com/kanal/news/feed',
        'politik': 'https://www.jpnn.com/kanal/politik/feed',
        'hukum': 'https://www.jpnn.com/kanal/hukum/feed',
        'ekonomi': 'https://www.jpnn.com/kanal/ekonomi/feed',
        'lifestyle': 'https://www.jpnn.com/kanal/lifestyle/feed',
        'entertainment': 'https://www.jpnn.com/kanal/entertainment/feed'
    },
    'antara': {
        'terbaru': 'https://www.antaranews.com/rss/terkini.xml',
        'ekonomi': 'https://www.antaranews.com/rss/ekonomi.xml',
        'olahraga': 'https://www.antaranews.com/rss/olahraga.xml',
        'humaniora': 'https://www.antaranews.com/rss/humaniora.xml',
        'lifestyle': 'https://www.antaranews.com/rss/lifestyle.xml',
        'hiburan': 'https://www.antaranews.com/rss/hiburan.xml',
        'dunia': 'https://www.antaranews.com/rss/dunia.xml',
        'teknologi': 'https://www.antaranews.com/rss/teknologi.xml'
    },
    'sindonews': {
        'terbaru': 'https://www.sindonews.com/feed',
        'nasional': 'https://nasional.sindonews.com/rss',
        'metro': 'https://metro.sindonews.com/rss',
        'ekbis': 'https://ekbis.sindonews.com/rss',
        'international': 'https://international.sindonews.com/rss',
        'sports': 'https://sports.sindonews.com/rss',
        'lifestyle': 'https://lifestyle.sindonews.com/rss',
        'otomotif': 'https://otomotif.sindonews.com/rss',
        'teknologi': 'https://teknologi.sindonews.com/rss'
    },
    'cnbc': {
        'terbaru': 'https://www.cnbcindonesia.com/rss',
        'news': 'https://www.cnbcindonesia.com/news/rss',
        'market': 'https://www.cnbcindonesia.com/market/rss',
        'tech': 'https://www.cnbcindonesia.com/tech/rss',
        'lifestyle': 'https://www.cnbcindonesia.com/lifestyle/rss'
    }
}

@lru_cache(maxsize=100)
def get_stock_history(symbol, period, interval, timestamp):
    """
    Fetch stock data and cache results.
    The timestamp parameter is used to invalidate cache after CACHE_TIMEOUT.
    """
    logger.info(f"Fetching data for {symbol} from yfinance API")
    stock = yf.Ticker(symbol)
    return stock.history(period=period, interval=interval)

def get_current_timestamp_bucket():
    """Return current time rounded to cache timeout intervals"""
    now = datetime.now()
    seconds = (now.hour * 3600) + (now.minute * 60) + now.second
    bucket = seconds // CACHE_TIMEOUT
    return int(bucket)

def extract_image_from_html(html_content):
    """Extract first image URL from HTML content"""
    if not html_content:
        return None
    
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        img_tag = soup.find('img')
        if img_tag and img_tag.has_attr('src'):
            return img_tag['src']
        
        # Coba cari dengan regex jika BeautifulSoup gagal
        img_regex = re.compile(r'<img[^>]+src="([^">]+)"')
        match = img_regex.search(html_content)
        if match:
            return match.group(1)
    except Exception as e:
        logger.warning(f"Error extracting image from HTML: {str(e)}")
    
    return None

@lru_cache(maxsize=50)
def get_indonesia_news(source, category=None, timestamp_bucket=None):
    """Fetch news from Indonesian news sources via RSS feed"""
    try:
        # Validate source
        if source not in RSS_FEEDS:
            logger.warning(f"Invalid news source: {source}")
            return None
        
        # Set default category if not provided or if 'all' is selected
        if not category or category == 'all':
            category = 'terbaru'  # Default category
        
        # Check if the requested category exists for this source
        if category not in RSS_FEEDS[source]:
            logger.warning(f"Category {category} not found for {source}, using 'terbaru' instead")
            category = 'terbaru'
        
        # Get the RSS URL
        rss_url = RSS_FEEDS[source][category]
        logger.info(f"Fetching RSS feed from {rss_url}")
        
        # Headers to avoid blocking by some servers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Parse the RSS feed
        try:
            feed = feedparser.parse(rss_url, request_headers=headers)
        except Exception as e:
            logger.error(f"Error parsing RSS feed: {str(e)}")
            # Try direct request
            response = requests.get(rss_url, headers=headers, timeout=10)
            feed = feedparser.parse(response.content)
        
        if not feed.entries:
            logger.warning(f"No entries found in RSS feed for {source}/{category}")
            return None
        
        # Format the data for frontend
        news_items = []
        for entry in feed.entries:
            # Extract image from content or summary if available
            image_url = None
            
            # Check for media:content
            if hasattr(entry, 'media_content') and entry.media_content:
                for media in entry.media_content:
                    if 'url' in media:
                        image_url = media['url']
                        break
            
            # Check for enclosure
            if not image_url and hasattr(entry, 'enclosures') and entry.enclosures:
                for enclosure in entry.enclosures:
                    if 'url' in enclosure and enclosure.get('type', '').startswith('image/'):
                        image_url = enclosure['url']
                        break
            
            # Try to extract from content
            if not image_url and hasattr(entry, 'content') and entry.content:
                for content in entry.content:
                    if 'value' in content:
                        image_url = extract_image_from_html(content['value'])
                        if image_url:
                            break
            
            # Try to extract from summary
            if not image_url and hasattr(entry, 'summary'):
                image_url = extract_image_from_html(entry.summary)
            
            # Try to extract from description
            if not image_url and hasattr(entry, 'description'):
                image_url = extract_image_from_html(entry.description)
            
            # Create cleaned snippet
            snippet = ''
            if hasattr(entry, 'summary'):
                snippet = BeautifulSoup(entry.summary, 'html.parser').get_text()
            elif hasattr(entry, 'description'):
                snippet = BeautifulSoup(entry.description, 'html.parser').get_text()
            
            # Limit to reasonable length
            if snippet and len(snippet) > 200:
                snippet = snippet[:197] + "..."
            
            # Get published date or use current time
            published = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published = datetime(*entry.published_parsed[:6]).isoformat()
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                published = datetime(*entry.updated_parsed[:6]).isoformat()
            else:
                published = datetime.now().isoformat()
            
            # Format news item
            news_item = {
                'title': entry.title if hasattr(entry, 'title') else '',
                'contentSnippet': snippet,
                'description': snippet,
                'link': entry.link if hasattr(entry, 'link') else '',
                'url': entry.link if hasattr(entry, 'link') else '',
                'isoDate': published,
                'publishedAt': published,
                'urlToImage': image_url,
                'image': {'url': image_url} if image_url else None,
                'creator': entry.author if hasattr(entry, 'author') else '',
                'source': {'name': INDONESIA_NEWS_SOURCES.get(source, source)},
                'category': category
            }
            
            news_items.append(news_item)
        
        logger.info(f"Successfully fetched {len(news_items)} news items from {source}/{category}")
        return news_items
    
    except Exception as e:
        logger.error(f"Error getting news from {source}/{category}: {str(e)}")
        logger.error(traceback.format_exc())
        return None

@app.route('/stock', methods=['GET'])
def get_stock_data():
    symbol = request.args.get('symbol', 'AAPL')
    period = request.args.get('period', '1mo')
    interval = request.args.get('interval', '1d')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Validate inputs
    valid_periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']
    valid_intervals = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo']

    # Validasi hanya jika period digunakan (bukan rentang tanggal kustom)
    if not (start_date and end_date) and period not in valid_periods:
        return jsonify({'error': f'Invalid period. Use one of: {", ".join(valid_periods)}'}), 400

    if interval not in valid_intervals:
        return jsonify({'error': f'Invalid interval. Use one of: {", ".join(valid_intervals)}'}), 400

    try:
        # Gunakan rentang tanggal atau period
        if start_date and end_date:
            try:
                # Konversi string tanggal ke objek datetime
                start = datetime.strptime(start_date, '%Y-%m-%d')
                end = datetime.strptime(end_date, '%Y-%m-%d')

                # Tambahkan satu hari ke end_date untuk mendapatkan data hingga akhir hari
                end = end + timedelta(days=1)

                logger.info(f"Fetching data for {symbol} from {start_date} to {end_date}")
                stock = yf.Ticker(symbol)
                data = stock.history(start=start, end=end, interval=interval)
            except ValueError as e:
                return jsonify({'error': f'Invalid date format. Use YYYY-MM-DD: {str(e)}'}), 400
        else:
            # Use cache with timestamp bucket for expiration
            timestamp_bucket = get_current_timestamp_bucket()
            data = get_stock_history(symbol, period, interval, timestamp_bucket)

        if data.empty:
            return jsonify({'error': f'No data found for symbol: {symbol}'}), 404

        # Process data efficiently
        data_list = []
        for index, row in data.iterrows():
            item = {
                'Date': index.strftime('%Y-%m-%d'),
                'Open': round(float(row['Open']), 2),
                'High': round(float(row['High']), 2),
                'Low': round(float(row['Low']), 2),
                'Close': round(float(row['Close']), 2),
                'Volume': int(row['Volume'])
            }
            data_list.append(item)

        response = {
            'symbol': symbol.upper(),
            'period': period,
            'interval': interval,
            'count': len(data_list),
            'data': data_list
        }

        # Add cache control headers
        resp = make_response(jsonify(response))
        resp.headers['Cache-Control'] = f'public, max-age={CACHE_TIMEOUT}'

        return resp

    except Exception as e:
        logger.error(f"Error fetching {symbol}: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'Failed to fetch data for {symbol}',
            'message': str(e)
        }), 500

@lru_cache(maxsize=20)
def get_finnhub_news(category, timestamp_bucket):
    """Fetch and cache news from Finnhub API"""
    if not FINNHUB_API_KEY:
        logger.warning("Finnhub API key not found, falling back to Yahoo Finance")
        return None
        
    url = f"https://finnhub.io/api/v1/news?category={category}&token={FINNHUB_API_KEY}"
    logger.info(f"Fetching news from Finnhub API for category: {category}")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching news from Finnhub: {str(e)}", exc_info=True)
        return None

@lru_cache(maxsize=50)
def get_finnhub_company_news(symbol, timestamp_bucket):
    """Fetch and cache company specific news from Finnhub API"""
    if not FINNHUB_API_KEY:
        logger.warning("Finnhub API key not found, falling back to Yahoo Finance")
        return None
    
    # Get current date and date from a week ago
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    # Format dates as YYYY-MM-DD
    from_date = start_date.strftime('%Y-%m-%d')
    to_date = end_date.strftime('%Y-%m-%d')
    
    url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={from_date}&to={to_date}&token={FINNHUB_API_KEY}"
    logger.info(f"Fetching company news from Finnhub API for: {symbol}")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching company news from Finnhub: {str(e)}", exc_info=True)
        return None

@app.route('/news', methods=['GET'])
def get_news():
    """Fetch financial news with priority: Indonesia News > Finnhub API > Yahoo Finance"""
    try:
        # Get query parameters
        limit = request.args.get('limit', default=20, type=int)
        category = request.args.get('category', default='general', type=str)
        symbol = request.args.get('symbol')
        source = request.args.get('source')  # Parameter for news source
        
        logger.info(f"Fetching news with params: category={category}, symbol={symbol}, limit={limit}, source={source}")
        
        # --- INDONESIA NEWS SOURCES using direct RSS ---
        if source and source in INDONESIA_NEWS_SOURCES:
            logger.info(f"Fetching news from Indonesian source: {source}")
            timestamp_bucket = get_current_timestamp_bucket()
            
            # Convert category 'all' to 'terbaru' for Indonesian sources
            api_category = category if category != 'all' else 'terbaru'
            
            # Get news from RSS feed
            indo_news = get_indonesia_news(source, api_category, timestamp_bucket)
            
            if indo_news and len(indo_news) > 0:
                logger.info(f"Successfully fetched {len(indo_news)} news items from {source}")
                
                # Format Indonesian news to match expected frontend structure
                formatted_news = []
                
                for item in indo_news[:limit]:
                    # Create news item with Indonesian news structure
                    news_item = {
                        'title': item.get('title', ''),
                        'description': item.get('contentSnippet', item.get('title', '')),
                        'url': item.get('link', ''),
                        'urlToImage': item.get('urlToImage', ''),
                        'publishedAt': item.get('publishedAt', datetime.now().isoformat()),
                        'source': {'name': INDONESIA_NEWS_SOURCES.get(source, source)},
                        'category': api_category,
                        'related': symbol if symbol else ''
                    }
                    formatted_news.append(news_item)
                
                logger.info(f"Returning {len(formatted_news)} formatted Indonesian news items")
                return jsonify(formatted_news)
            else:
                logger.warning(f"No news found from {source}, falling back to Finnhub/Yahoo")
        
        # Use Finnhub API if API key is available
        if FINNHUB_API_KEY:
            logger.info(f"Using Finnhub API with key: {FINNHUB_API_KEY[:4]}...")
            timestamp_bucket = get_current_timestamp_bucket()
            
            finnhub_news = None
            
            if symbol:
                # Process symbol for Finnhub format if needed (remove .JK suffix for Indonesian stocks)
                finnhub_symbol = symbol.replace('.JK', '') if symbol.endswith('.JK') else symbol
                logger.info(f"Fetching company news for symbol: {finnhub_symbol}")
                
                # Try to get company specific news
                finnhub_news = get_finnhub_company_news(finnhub_symbol, timestamp_bucket)
                if not finnhub_news or len(finnhub_news) == 0:
                    logger.info(f"No company news found for {finnhub_symbol}, falling back to general news")
                    finnhub_news = get_finnhub_news(category, timestamp_bucket)
            else:
                # Get news by category
                logger.info(f"Fetching news by category: {category}")
                finnhub_news = get_finnhub_news(category, timestamp_bucket)
            
            # Check if we got any news from Finnhub
            if finnhub_news and len(finnhub_news) > 0:
                logger.info(f"Successfully fetched {len(finnhub_news)} news items from Finnhub")
                
                # Format Finnhub news to match expected structure by frontend
                formatted_news = []
                
                for item in finnhub_news[:limit]:
                    # Debug logging for item structure
                    if 'datetime' not in item:
                        logger.warning(f"Missing datetime field in item: {item}")
                    
                    # Convert Finnhub timestamp to datetime
                    publish_date = datetime.fromtimestamp(item.get('datetime', 0)).strftime('%Y-%m-%d %H:%M:%S')
                    
                    # Create properly formatted news item for frontend
                    news_item = {
                        'title': item.get('headline', ''),
                        'description': item.get('summary', ''),
                        'url': item.get('url', ''),
                        'urlToImage': item.get('image', ''),
                        'publishedAt': publish_date,
                        'source': {'name': item.get('source', '')},
                        'category': item.get('category', category),
                        'related': item.get('related', '')
                    }
                    formatted_news.append(news_item)
                
                # Return news data in the format expected by frontend
                logger.info(f"Returning {len(formatted_news)} formatted news items")
                return jsonify(formatted_news)
            else:
                logger.warning("No news found in Finnhub response, falling back to Yahoo Finance")
        else:
            logger.warning("Finnhub API key not available")
        
        # Fallback to Yahoo Finance if Finnhub fails or API key not available
        logger.info("Using Yahoo Finance as fallback for news")
        
        # List of tickers for global economic news
        tickers = [
            '^GSPC',  # S&P 500
            '^DJI',   # Dow Jones Industrial Average
            '^IXIC',  # NASDAQ Composite
            '^FTSE',  # FTSE 100
            '^N225',  # Nikkei 225
            'EURUSD=X',  # EUR/USD
            'GC=F',   # Gold Futures
            'CL=F',   # Crude Oil Futures
            '^JKSE'   # Jakarta Composite Index
        ]
        
        # If symbol is provided, prioritize it
        if symbol:
            tickers.insert(0, symbol)
        
        all_news = []
        
        # Fetch news for each ticker (limit to 4 tickers to improve performance)
        for ticker_symbol in tickers[:4]:
            try:
                logger.info(f"Fetching Yahoo news for ticker: {ticker_symbol}")
                ticker = yf.Ticker(ticker_symbol)
                ticker_news = ticker.news
                
                if ticker_news:
                    # Add ticker info to each news item
                    for news_item in ticker_news:
                        if 'ticker' not in news_item:
                            news_item['ticker'] = ticker_symbol
                    
                    all_news.extend(ticker_news)
            except Exception as e:
                logger.warning(f"Error fetching news for {ticker_symbol}: {str(e)}")
                continue
        
        if not all_news:
            logger.warning("No news found from Yahoo Finance")
            # Return empty array as fallback
            return jsonify([])
        
        # Sort news by publish time (newest first)
        all_news.sort(key=lambda x: x.get('providerPublishTime', 0), reverse=True)
        
        # Remove duplicates based on title
        unique_news = []
        seen_titles = set()
        
        for news in all_news:
            title = news.get('title', '')
            if title and title not in seen_titles:
                seen_titles.add(title)
                unique_news.append(news)
        
        # Limit the number of news items
        limited_news = unique_news[:limit]
        
        # Format the response to match frontend expectations
        formatted_news = []
        for news in limited_news:
            # Convert timestamp to datetime
            publish_time = news.get('providerPublishTime', 0)
            if publish_time:
                publish_date = datetime.fromtimestamp(publish_time).strftime('%Y-%m-%d %H:%M:%S')
            else:
                publish_date = None
            
            # Extract thumbnail URL from Yahoo's nested structure
            thumbnail_url = None
            if news.get('thumbnail'):
                resolutions = news.get('thumbnail', {}).get('resolutions', [])
                if resolutions and len(resolutions) > 0:
                    thumbnail_url = resolutions[0].get('url', None)
            
            # Format news item according to frontend expectations
            news_item = {
                'title': news.get('title', ''),
                'description': news.get('title', ''),  # Yahoo doesn't provide separate description
                'url': news.get('link', ''),
                'urlToImage': thumbnail_url,
                'publishedAt': publish_date,
                'source': {'name': news.get('publisher', '')},
                'category': news.get('type', 'general'),
                'related': ','.join(news.get('relatedTickers', []))
            }
            formatted_news.append(news_item)
        
        logger.info(f"Returning {len(formatted_news)} Yahoo news items")
        return jsonify(formatted_news)

    except Exception as e:
        logger.error(f"Error fetching news: {str(e)}", exc_info=True)
        return jsonify([])  # Return empty array on error for better frontend handling

# Endpoint to get available Indonesian news sources
@app.route('/news/sources', methods=['GET'])
def get_news_sources():
    """Get available Indonesian news sources and categories"""
    try:
        sources = []
        
        # Add all RSS sources
        for source_id, categories_dict in RSS_FEEDS.items():
            if source_id in INDONESIA_NEWS_SOURCES:
                source_info = {
                    'id': source_id,
                    'name': INDONESIA_NEWS_SOURCES[source_id],
                    'categories': ['all'] + list(categories_dict.keys())  # Add 'all' as the first option
                }
                sources.append(source_info)
        
        # Add Finnhub as a special source
        if FINNHUB_API_KEY:
            sources.append({
                'id': 'finnhub',
                'name': 'Finnhub Financial News',
                'categories': ['general', 'forex', 'crypto', 'merger', 'stock']
            })
        
        return jsonify({
            'count': len(sources),
            'sources': sources
        })
    
    except Exception as e:
        logger.error(f"Error getting news sources: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch news sources',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple endpoint to check if API is running"""
    return jsonify({
        'status': 'ok',
        'service': 'stock-api'
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)