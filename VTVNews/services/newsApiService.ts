import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Default API key if not set in environment variables
const DEFAULT_API_KEY = 'c5b161b21da24e449468ad16ec26d492';
const NEWS_API_KEY = process.env.NEWS_API_KEY || DEFAULT_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Interface for Article
interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// Interface for NewsAPIResponse
interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

/**
 * Get the top headlines
 */
export const getTopHeadlines = async (country = 'vn', category = '', pageSize = 10, page = 1): Promise<NewsAPIResponse> => {
  try {
    const params: any = {
      country,
      pageSize,
      page,
      apiKey: NEWS_API_KEY,
    };

    if (category) {
      params.category = category;
    }

    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    return {
      status: 'error',
      totalResults: 0,
      articles: [],
    };
  }
};

/**
 * Search for news articles with support for date range
 * @param query Search query
 * @param fromDate Optional from date in YYYY-MM-DD format
 * @param sortBy Optional sort criterion: 'popularity', 'relevancy', or 'publishedAt'
 * @param language Optional language code, default 'vi'
 * @param pageSize Optional number of results per page
 * @param page Optional page number
 */
export const searchNewsArticles = async (
  query: string,
  fromDate?: string,
  sortBy = 'popularity',
  language = 'vi',
  pageSize = 10,
  page = 1
): Promise<NewsAPIResponse> => {
  try {
    const params: any = {
      q: query,
      language,
      sortBy,
      pageSize,
      page,
      apiKey: NEWS_API_KEY,
    };

    if (fromDate) {
      params.from = fromDate;
    }

    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching news articles:', error);
    return {
      status: 'error',
      totalResults: 0,
      articles: [],
    };
  }
};

/**
 * Get news sources
 */
export const getNewsSources = async (country = 'vn', language = 'vi', category = ''): Promise<any> => {
  try {
    const params: any = {
      language,
      apiKey: NEWS_API_KEY,
    };

    if (country) {
      params.country = country;
    }

    if (category) {
      params.category = category;
    }

    const response = await axios.get(`${NEWS_API_BASE_URL}/sources`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching news sources:', error);
    return {
      status: 'error',
      sources: [],
    };
  }
};

/**
 * Filter articles by a specific term/phrase in title, description, or content
 * @param articles Array of articles to filter
 * @param term The term to search for
 */
export const filterArticles = (articles: Article[], term: string): Article[] => {
  const termLower = term.toLowerCase();
  return articles.filter(article => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = (article.content || '').toLowerCase();

    return title.includes(termLower) ||
           description.includes(termLower) ||
           content.includes(termLower);
  });
};

/**
 * Convert UTC time string to Vietnam time (UTC+7)
 * @param utcTimeStr UTC time string in ISO format (e.g., "2025-02-27T23:05:51Z")
 */
export const convertUtcToVnTime = (utcTimeStr: string): string => {
  try {
    const utcDate = new Date(utcTimeStr);

    // Adjust to Vietnam time (UTC+7)
    const vnDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));

    // Format the date
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    return vnDate.toLocaleString('vi-VN', options) + ' (Giờ VN)';
  } catch (error) {
    return utcTimeStr; // Return original string if there's an error
  }
};
