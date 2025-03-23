// Serverless function for the News API
const axios = require('axios');

// Default API key if not set in environment
const DEFAULT_API_KEY = 'c5b161b21da24e449468ad16ec26d492';
const NEWS_API_KEY = process.env.NEWS_API_KEY || DEFAULT_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS enabled' }),
    };
  }

  // Parse the path and query parameters
  const path = event.path.replace('/.netlify/functions/api', '');
  const queryParams = event.queryStringParameters || {};

  try {
    let apiUrl = '';
    let params = { apiKey: NEWS_API_KEY };

    // Determine which API endpoint to call based on the path
    if (path === '/top-headlines') {
      apiUrl = `${NEWS_API_BASE_URL}/top-headlines`;

      // Add the query parameters
      params = {
        ...params,
        country: queryParams.country || 'vn',
        category: queryParams.category || '',
        pageSize: queryParams.pageSize || 10,
        page: queryParams.page || 1,
      };
    } else if (path === '/everything') {
      apiUrl = `${NEWS_API_BASE_URL}/everything`;

      // Add the query parameters
      params = {
        ...params,
        q: queryParams.q || '',
        language: queryParams.language || 'vi',
        sortBy: queryParams.sortBy || 'publishedAt',
        pageSize: queryParams.pageSize || 10,
        page: queryParams.page || 1,
      };

      // Add optional from date parameter
      if (queryParams.from) {
        params.from = queryParams.from;
      }
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Endpoint not found' }),
      };
    }

    // Make the request to NewsAPI
    const response = await axios.get(apiUrl, { params });

    // Format dates to Vietnam time if specified
    if (queryParams.convertDates === 'true' && response.data.articles) {
      response.data.articles = response.data.articles.map(article => {
        if (article.publishedAt) {
          const utcDate = new Date(article.publishedAt);
          // Add 7 hours for Vietnam time (UTC+7)
          const vnDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
          article.publishedAt = vnDate.toISOString();
        }
        return article;
      });
    }

    // Return the response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('API Error:', error);

    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data?.message || 'Internal Server Error',
      }),
    };
  }
};
