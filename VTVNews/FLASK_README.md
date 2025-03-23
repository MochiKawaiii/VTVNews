# VTV News with NewsAPI Integration

This part of the application provides a Flask-based implementation that uses the NewsAPI to fetch news articles with "vietnam" as the default search keyword.

## Features

- Fetches news from NewsAPI.org with "vietnam" as default keyword
- Provides simple Vietnamese text enhancement for article titles and descriptions
- Displays news in a clean format matching the VTV News design
- Allows searching for different keywords while maintaining the Vietnam focus
- Converts UTC times to Vietnam timezone (UTC+7)

## Requirements

To run this application, you need:

- Python 3.6 or higher
- Flask
- Requests

## How to Run

### Option 1: Run Both Applications Together (Recommended)

```bash
cd VTVNews
bun run start:all
```

This will start both the main VTVNews application and the Flask application.

- Main VTVNews application: http://localhost:3000
- Flask NewsAPI application: http://localhost:8080/news

### Option 2: Run Flask Application Separately

```bash
cd VTVNews
python flask_app.py
```

The Flask application will be available at http://localhost:8080/news

## API Endpoints

### 1. News Search Page

- **URL**: `/news`
- **Method**: GET
- **Query Parameters**:
  - `q` (optional): Search term (default: "vietnam")
  - `from_date` (optional): Date to search from (YYYY-MM-DD)
  - `sort_by` (optional): Sorting method (publishedAt, relevancy, popularity)

### 2. JSON API

- **URL**: `/api/news`
- **Method**: GET
- **Query Parameters**: Same as above
- **Returns**: JSON with article data

## Usage Examples

1. Search for news about Vietnam:
   http://localhost:8080/news

2. Search for news about a specific topic in Vietnam:
   http://localhost:8080/news?q=hanoi

3. Search for news from a specific date:
   http://localhost:8080/news?q=vietnam&from_date=2025-01-01

4. Sort news by relevancy:
   http://localhost:8080/news?q=vietnam&sort_by=relevancy
