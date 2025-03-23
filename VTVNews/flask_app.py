import sys
sys.stdout.reconfigure(encoding='utf-8')  # Ensure Vietnamese characters can be printed

from flask import Flask, render_template, request, jsonify
import requests
import json
from datetime import datetime, timedelta
import os
from pathlib import Path

app = Flask(__name__,
            static_folder=os.path.join(os.path.dirname(__file__), 'public'),
            template_folder=os.path.join(os.path.dirname(__file__), 'flask_templates'))

# Ensure the templates directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), 'flask_templates'), exist_ok=True)

DEFAULT_API_KEY = "c5b161b21da24e449468ad16ec26d492"

# Common Vietnamese terms for news articles
VIETNAMESE_TRANSLATIONS = {
    "read more": "Đọc thêm",
    "breaking news": "Tin mới nhất",
    "latest news": "Tin mới nhất",
    "top stories": "Tin hàng đầu",
    "politics": "Chính trị",
    "economy": "Kinh tế",
    "business": "Kinh doanh",
    "sports": "Thể thao",
    "technology": "Công nghệ",
    "health": "Sức khỏe",
    "entertainment": "Giải trí",
    "world": "Thế giới",
    "science": "Khoa học",
    "vietnam": "Việt Nam",
    "hanoi": "Hà Nội",
    "ho chi minh city": "Thành phố Hồ Chí Minh",
    "saigon": "Sài Gòn"
}

def fetch_news(query="vietnam", from_date=None, sort_by='popularity', api_key=DEFAULT_API_KEY):
    """
    Fetch news from NewsAPI and return a list of articles.
    """
    url = "https://newsapi.org/v2/everything"

    # If from_date is not provided, use the past 15 days (instead of 7)
    if not from_date:
        from_date = (datetime.now() - timedelta(days=15)).strftime('%Y-%m-%d')

    params = {
        'q': query,
        'from': from_date,
        'sortBy': sort_by,
        'apiKey': api_key
    }

    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "ok":
                return data.get("articles", []), None
            else:
                return [], f"API Error: {data.get('message', 'No error message')}"
        else:
            return [], f"HTTP Error: {response.status_code}"
    except Exception as e:
        return [], f"Error: {str(e)}"

def filter_articles(articles, term):
    """
    Filter articles to only keep those containing the term in title, description, or content.
    """
    if not term:
        return articles

    term_lower = term.lower()
    filtered = []
    for article in articles:
        title = (article.get("title") or "").lower()
        description = (article.get("description") or "").lower()
        content = (article.get("content") or "").lower()
        if term_lower in title or term_lower in description or term_lower in content:
            filtered.append(article)
    return filtered

def simple_vietnamese_translation(text):
    """
    A very simple translation function that replaces common English terms with Vietnamese
    """
    if not text:
        return text

    text_lower = text.lower()
    for eng, vie in VIETNAMESE_TRANSLATIONS.items():
        text_lower = text_lower.replace(eng, vie)

    # If the text has changed, we return the modified text
    # Otherwise, return original text but add a note about Vietnam
    if text_lower != text.lower():
        return text_lower.capitalize()
    else:
        return f"{text} (Tin tức Việt Nam)"

def contains_vietnamese(text):
    """
    Check if text contains Vietnamese characters
    """
    if not text:
        return False
    vietnamese_chars = set('ăâàáảãạằắẳẵặầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ')
    text_lower = text.lower()
    return any(char in vietnamese_chars for char in text_lower)

def convert_utc_to_vn(utc_time_str):
    """
    Convert UTC time string to Vietnam time (UTC+7) and return formatted string.
    """
    try:
        utc_time = datetime.strptime(utc_time_str, "%Y-%m-%dT%H:%M:%SZ")
        vn_time = utc_time + timedelta(hours=7)
        return vn_time.strftime("%Y-%m-%d %H:%M:%S") + " (Giờ VN)"
    except Exception as e:
        return utc_time_str

def process_articles(articles, query):
    """
    Process articles: add Vietnamese text, format date, and prepare for display
    """
    processed_articles = []
    for article in articles:
        # Add Vietnamese text where appropriate
        title = article.get("title", "")
        description = article.get("description", "")

        # Only translate if not already in Vietnamese
        if title and not contains_vietnamese(title):
            article["translated_title"] = simple_vietnamese_translation(title)
        else:
            article["translated_title"] = title

        if description and not contains_vietnamese(description):
            article["translated_description"] = simple_vietnamese_translation(description)
        else:
            article["translated_description"] = description

        # Format the source information
        source = article.get("source", {}).get("name", "N/A")

        # Format the author information
        author = article.get("author", "N/A")
        if not author:
            author = "Không có tác giả"

        # Convert the publish date to Vietnam time
        published_at = article.get("publishedAt", "N/A")
        if published_at != "N/A":
            published_at = convert_utc_to_vn(published_at)

        # Get the article URL
        url = article.get("url", "#")

        # Create the processed article object
        processed_article = {
            'title': article.get("translated_title", article.get("title", "")),
            'original_title': article.get("title", ""),
            'source': source,
            'author': author,
            'published_at': published_at,
            'url': url,
            'description': article.get("translated_description", article.get("description", "")),
            'original_description': article.get("description", ""),
            'url_to_image': article.get("urlToImage", "")
        }

        processed_articles.append(processed_article)

    return processed_articles

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/news')
def api_news():
    query = request.args.get('q', 'vietnam')  # Default to 'vietnam'
    from_date = request.args.get('from_date', '')
    sort_by = request.args.get('sort_by', 'popularity')

    # Fetch news from NewsAPI
    articles, error = fetch_news(query, from_date, sort_by)

    if error:
        return jsonify({
            'status': 'error',
            'message': error,
            'articles': []
        })

    # Filter articles if needed
    filtered_articles = filter_articles(articles, query)

    # Process the articles for display
    processed_articles = process_articles(filtered_articles, query)

    return jsonify({
        'status': 'ok',
        'query': query,
        'articles': processed_articles,
        'total': len(processed_articles)
    })

# Create a basic HTML template for displaying the news
@app.route('/news')
def news_page():
    query = request.args.get('q', 'vietnam')  # Default to 'vietnam'
    from_date = request.args.get('from_date', '')
    sort_by = request.args.get('sort_by', 'popularity')

    # Fetch news from NewsAPI
    articles, error = fetch_news(query, from_date, sort_by)

    if error:
        return render_template('error.html', error=error)

    # Filter articles if needed
    filtered_articles = filter_articles(articles, query)

    # Process the articles for display
    processed_articles = process_articles(filtered_articles, query)

    return render_template('news.html',
                          articles=processed_articles,
                          query=query,
                          total=len(processed_articles))

if __name__ == '__main__':
    # Create the template files if they don't exist
    template_dir = os.path.join(os.path.dirname(__file__), 'flask_templates')

    # Create error.html template
    error_template = os.path.join(template_dir, 'error.html')
    if not os.path.exists(error_template):
        with open(error_template, 'w', encoding='utf-8') as f:
            f.write('''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VTV News - Error</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/normalize.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">
</head>
<body>
    <header class="main-header">
        <div class="top-header">
            <div class="inner-container">
                <div class="logo">
                    <a href="/">
                        <img src="{{ url_for('static', filename='images/logo.png') }}" alt="VTV News">
                    </a>
                </div>
            </div>
        </div>
    </header>
    <main class="main-content">
        <div class="inner-container">
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>{{ error }}</h3>
                <button onclick="window.location.href='/news'" class="btn-retry">Thử lại</button>
            </div>
        </div>
    </main>
</body>
</html>''')

    # Create news.html template
    news_template = os.path.join(template_dir, 'news.html')
    if not os.path.exists(news_template):
        with open(news_template, 'w', encoding='utf-8') as f:
            f.write('''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VTV News - {{ query }}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/normalize.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/search.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <header class="main-header">
        <div class="top-header">
            <div class="inner-container">
                <div class="logo">
                    <a href="/">
                        <img src="{{ url_for('static', filename='images/logo.png') }}" alt="VTV News">
                    </a>
                </div>
                <div class="top-right">
                    <div class="search-box">
                        <form action="/news" method="get">
                            <input type="text" name="q" value="{{ query }}" placeholder="Tìm kiếm tin tức Việt Nam..." required>
                            <button type="submit"><i class="fas fa-search"></i></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </header>
    <main class="main-content">
        <div class="inner-container">
            <section class="search-results">
                <h2 class="section-title">Kết quả tìm kiếm: "{{ query }}" ({{ total }} kết quả)</h2>
                <div class="news-list news-list-clean">
                    {% for article in articles %}
                    <div class="news-item clean-style">
                        <h3 class="news-title">{{ article.title }}</h3>

                        <div class="news-meta-details">
                            <div class="news-source-line">
                                <strong>Nguồn:</strong> {{ article.source }}
                            </div>
                            <div class="news-author-line">
                                <strong>Tác giả:</strong> {{ article.author }}
                            </div>
                            <div class="news-date-line">
                                <strong>Thời gian đăng:</strong> {{ article.published_at }}
                            </div>
                            <div class="news-description-line">
                                <strong>Mô tả:</strong> {{ article.description }}
                            </div>
                            <div class="view-original">
                                <a href="{{ article.url }}" target="_blank" class="view-original-link">Xem bài báo gốc</a>
                            </div>
                        </div>
                    </div>
                    {% endfor %}
                </div>
            </section>
        </div>
    </main>
</body>
</html>''')

    # Start the Flask server
    app.run(debug=True, host='0.0.0.0', port=8080)
