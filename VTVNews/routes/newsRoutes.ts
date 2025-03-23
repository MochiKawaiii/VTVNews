import express from 'express';
import {
  getHomePage,
  getCategoryPage,
  getArticlePage,
  getSearchResults
} from '../controllers/newsController';

const router = express.Router();

// Home page
router.get('/', getHomePage);

// Category pages
router.get('/category/:category', getCategoryPage);

// Single article
router.get('/article/:id', getArticlePage);

// Search results
router.get('/search', getSearchResults);

export default router;
