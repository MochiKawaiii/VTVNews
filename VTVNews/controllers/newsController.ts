import { Request, Response } from 'express';
import { getTopHeadlines, searchNewsArticles, filterArticles, convertUtcToVnTime } from '../services/newsApiService';
import { transformArticle } from '../models/Article';
import { categories, getCategoryBySlug } from '../models/Category';

/**
 * Get home page
 */
export const getHomePage = async (req: Request, res: Response) => {
  try {
    // Get the top headlines for the home page
    const result = await getTopHeadlines('vn', '', 15, 1);

    // Transform articles
    const articles = result.articles.map((article, index) =>
      transformArticle(article, index)
    );

    // Get featured articles (first 4)
    const featuredArticles = articles.slice(0, 4);

    // Get recent articles (next 6)
    const recentArticles = articles.slice(4, 10);

    // Get additional articles (rest)
    const additionalArticles = articles.slice(10);

    // Render the home page
    res.render('home', {
      title: 'VTV News - Trang chủ',
      description: 'Tin tức mới nhất, nhanh nhất tại Việt Nam và thế giới',
      featuredArticles,
      recentArticles,
      additionalArticles,
      categories,
      activeCategory: 'home'
    });
  } catch (error) {
    console.error('Error rendering home page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the home page'
    });
  }
};

/**
 * Get category page
 */
export const getCategoryPage = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;

    // Find the category by slug
    const categoryObj = getCategoryBySlug(category);

    if (!categoryObj) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Category not found'
      });
    }

    // Get the news for this category
    const result = await getTopHeadlines('vn', categoryObj.id, 12, page);

    // Transform articles
    const articles = result.articles.map((article, index) => {
      const articleWithCategory = { ...article, category: categoryObj.id };
      return transformArticle(articleWithCategory, index);
    });

    // Get top articles (first 3)
    const topArticles = articles.slice(0, 3);

    // Get the rest of the articles
    const otherArticles = articles.slice(3);

    // Render the category page
    res.render('category', {
      title: `${categoryObj.name} - VTV News`,
      description: `Tin tức ${categoryObj.name} mới nhất, nhanh nhất tại Việt Nam và thế giới`,
      category: categoryObj,
      topArticles,
      articles: otherArticles,
      categories,
      activeCategory: category,
      pagination: {
        current: page,
        total: Math.ceil(result.totalResults / 12),
        hasNext: page * 12 < result.totalResults,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error rendering category page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the category page'
    });
  }
};

/**
 * Get article page
 */
export const getArticlePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // In a real application, we would fetch the article from a database
    // Since we're using NewsAPI, we don't have persistent articles with IDs
    // This is just a placeholder implementation

    // Decompose the ID to get the index (assuming format: index_timestamp)
    const [index] = id.split('_');
    const indexNum = parseInt(index);

    if (isNaN(indexNum)) {
      return res.status(400).render('error', {
        title: 'Error',
        message: 'Invalid article ID'
      });
    }

    // Fetch the latest news and try to find the article at the index
    const result = await getTopHeadlines('vn', '', 20, 1);

    if (indexNum >= result.articles.length) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Article not found'
      });
    }

    // Format the article's publish date to Vietnam time
    const articleData = {...result.articles[indexNum]};
    if (articleData.publishedAt) {
      articleData.publishedAt = convertUtcToVnTime(articleData.publishedAt);
    }

    const article = transformArticle(articleData, indexNum);

    // Get related articles (articles except the current one)
    const relatedArticles = result.articles
      .filter((_, i) => i !== indexNum)
      .slice(0, 5)
      .map((relatedArticle, i) => {
        // Format each related article's publish date
        if (relatedArticle.publishedAt) {
          relatedArticle.publishedAt = convertUtcToVnTime(relatedArticle.publishedAt);
        }
        return transformArticle(relatedArticle, i);
      });

    // Render the article page
    res.render('article', {
      title: `${article.title} - VTV News`,
      description: article.description || 'Read the full article on VTV News',
      article,
      relatedArticles,
      categories,
      activeCategory: article.category || 'home'
    });
  } catch (error) {
    console.error('Error rendering article page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the article'
    });
  }
};

/**
 * Get search results
 */
export const getSearchResults = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.redirect('/');
    }

    const page = parseInt(req.query.page as string) || 1;
    const fromDate = req.query.fromDate as string;
    const sortBy = (req.query.sortBy as string) || 'popularity';
    const filterTerm = req.query.filterTerm as string;

    // Search for articles
    const result = await searchNewsArticles(query, fromDate, sortBy, 'vi', 12, page);

    // Apply additional filtering if needed
    let filteredArticles = result.articles;
    if (filterTerm) {
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

    // Transform articles
    const articles = filteredArticles.map((article, index) =>
      transformArticle(article, index)
    );

    // Render the search results page
    res.render('search', {
      title: `Tìm kiếm: ${query} - VTV News`,
      description: `Kết quả tìm kiếm cho "${query}" trên VTV News`,
      query,
      fromDate,
      sortBy,
      filterTerm,
      articles,
      totalResults: filteredArticles.length,
      categories,
      activeCategory: 'search',
      pagination: {
        current: page,
        total: Math.ceil(filteredArticles.length / 12),
        hasNext: page * 12 < filteredArticles.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error rendering search results:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load search results'
    });
  }
};
