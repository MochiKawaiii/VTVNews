import express from 'express';
import {
  getLatestNews,
  getNewsByCategory,
  getArticleById,
  searchNews
} from '../controllers/apiController';

const router = express.Router();

/**
 * @route GET /api/news
 * @desc Get latest news
 * @access Public
 * @query page - Page number (default: 1)
 * @query pageSize - Items per page (default: 10)
 */
router.get('/news', getLatestNews);

/**
 * @route GET /api/news/category/:category
 * @desc Get news by category
 * @access Public
 * @param category - Category ID
 * @query page - Page number (default: 1)
 * @query pageSize - Items per page (default: 10)
 */
router.get('/news/category/:category', getNewsByCategory);

/**
 * @route GET /api/news/search
 * @desc Search news with advanced filtering
 * @access Public
 * @query q - Search query (required)
 * @query page - Page number (default: 1)
 * @query pageSize - Items per page (default: 10)
 * @query fromDate - Start date in YYYY-MM-DD format (optional)
 * @query sortBy - Sorting criterion: 'popularity', 'relevancy', or 'publishedAt' (default: 'popularity')
 * @query filterTerm - Additional filter term (optional)
 */
router.get('/news/search', searchNews);

/**
 * @route GET /api/news/:id
 * @desc Get single article
 * @access Public
 * @param id - Article ID
 */
router.get('/news/:id', getArticleById);

export default router;
