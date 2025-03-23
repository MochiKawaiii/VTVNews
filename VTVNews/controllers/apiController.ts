import { Request, Response } from 'express';
import {
  getTopHeadlines,
  searchNewsArticles,
  filterArticles,
  convertUtcToVnTime
} from '../services/newsApiService';
import { transformArticle } from '../models/Article';
import { getCategoryById } from '../models/Category';

/**
 * Get latest news
 */
export const getLatestNews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await getTopHeadlines('vn', '', pageSize, page);

    const transformedArticles = result.articles.map((article, index) =>
      transformArticle(article, index)
    );

    res.json({
      status: 'success',
      totalResults: result.totalResults,
      page,
      pageSize,
      articles: transformedArticles
    });
  } catch (error) {
    console.error('Error getting latest news:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch latest news'
    });
  }
};

/**
 * Get news by category
 */
export const getNewsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const categoryObj = getCategoryById(category);

    if (!categoryObj) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    const result = await getTopHeadlines('vn', category, pageSize, page);

    const transformedArticles = result.articles.map((article, index) => {
      const articleWithCategory = { ...article, category };
      return transformArticle(articleWithCategory, index);
    });

    res.json({
      status: 'success',
      totalResults: result.totalResults,
      page,
      pageSize,
      category: categoryObj,
      articles: transformedArticles
    });
  } catch (error) {
    console.error('Error getting news by category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news by category'
    });
  }
};

/**
 * Get article by ID
 */
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // In a real application, we would fetch the article from a database
    // Since we're using NewsAPI, we don't have persistent articles with IDs
    // This is just a placeholder implementation

    // Decompose the ID to get the index (assuming format: index_timestamp)
    const [index] = id.split('_');
    const indexNum = parseInt(index);

    if (isNaN(indexNum)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid article ID'
      });
    }

    // Fetch the latest news and try to find the article at the index
    const result = await getTopHeadlines('vn', '', 20, 1);

    if (indexNum >= result.articles.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }

    const article = transformArticle(result.articles[indexNum], indexNum);

    // Format the publishedAt date to Vietnam time
    if (article.publishedAt) {
      article.publishedAt = convertUtcToVnTime(article.publishedAt);
    }

    res.json({
      status: 'success',
      article
    });
  } catch (error) {
    console.error('Error getting article by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch article'
    });
  }
};

/**
 * Search news with advanced filtering
 */
export const searchNews = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const fromDate = req.query.fromDate as string;
    const sortBy = (req.query.sortBy as string) || 'popularity';

    // Validate sortBy parameter
    const validSortOptions = ['popularity', 'relevancy', 'publishedAt'];
    if (!validSortOptions.includes(sortBy)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid sort parameter. Valid options are: popularity, relevancy, publishedAt'
      });
    }

    const result = await searchNewsArticles(query, fromDate, sortBy, 'vi', pageSize, page);

    // Apply additional filtering if needed
    let filteredArticles = result.articles;
    if (req.query.filterTerm) {
      const filterTerm = req.query.filterTerm as string;
      filteredArticles = filterArticles(filteredArticles, filterTerm);
    }

    // Convert times to Vietnam time zone
    filteredArticles = filteredArticles.map(article => {
      if (article.publishedAt) {
        return {
          ...article,
          publishedAt: convertUtcToVnTime(article.publishedAt)
        };
      }
      return article;
    });

    const transformedArticles = filteredArticles.map((article, index) =>
      transformArticle(article, index)
    );

    res.json({
      status: 'success',
      totalResults: filteredArticles.length,
      page,
      pageSize,
      query,
      sortBy,
      fromDate: fromDate || 'not specified',
      articles: transformedArticles
    });
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search news'
    });
  }
};
