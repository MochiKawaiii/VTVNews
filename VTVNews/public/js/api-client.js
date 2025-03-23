/**
 * VTV News API Client
 * This file contains functions to interact with the serverless API functions
 * with a specific focus on Vietnamese news content
 */

/**
 * Get top headlines from Vietnam
 * @param {Object} options - Optional parameters
 * @param {string} options.category - News category
 * @param {number} options.pageSize - Number of results to return
 * @param {number} options.page - Page number
 * @returns {Promise} - Promise with the response data
 */
async function getTopHeadlines(options = {}) {
  try {
    // Set up query parameters
    const params = new URLSearchParams({
      topHeadlines: 'true',
      pageSize: options.pageSize || 20,
      page: options.page || 1
    });

    // Add category if specified
    if (options.category) {
      params.append('category', options.category);
    }

    // Add retry logic with a maximum of 3 attempts
    let attempts = 0;
    let lastError = null;

    while (attempts < 3) {
      try {
        const response = await fetch(`/.netlify/functions/serve-news?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Check if we got articles back
        if (!data.articles || data.articles.length === 0) {
          console.warn('No articles returned from API, will retry');
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }

        return data;
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        lastError = error;
        attempts++;

        if (attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    // If we get here, all attempts failed
    console.error('All API call attempts failed:', lastError);
    throw lastError;
  } catch (error) {
    console.error('Error fetching Vietnam top headlines:', error);
    throw error;
  }
}

/**
 * Search for Vietnamese news
 * @param {Object} options - Search options
 * @param {string} options.query - Search query (will be combined with Vietnam terms)
 * @param {string} options.fromDate - Start date in YYYY-MM-DD format
 * @param {string} options.sortBy - Sort criterion (publishedAt, relevancy, popularity)
 * @param {number} options.pageSize - Number of results
 * @param {number} options.page - Page number
 * @returns {Promise} - Promise with the response data
 */
async function searchVietnameseNews(options = {}) {
  try {
    // Set up query parameters
    const params = new URLSearchParams({
      pageSize: options.pageSize || 20,
      page: options.page || 1,
      sortBy: options.sortBy || 'publishedAt'
    });

    // Add query if provided and ensure it includes 'vietnam' if not already present
    if (options.query) {
      let query = options.query;
      if (query.toLowerCase() !== 'vietnam' && !query.toLowerCase().includes('vietnam')) {
        query = `${query} vietnam`;
      }
      params.append('q', query);
    } else {
      // Default to 'vietnam' if no query provided
      params.append('q', 'vietnam');
    }

    // Add from date if provided
    if (options.fromDate) {
      params.append('from', options.fromDate);
    }

    // Add retry logic with a maximum of 3 attempts
    let attempts = 0;
    let lastError = null;

    while (attempts < 3) {
      try {
        const response = await fetch(`/.netlify/functions/serve-news?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Check if we got articles back
        if (!data.articles || data.articles.length === 0) {
          console.warn('No articles returned from API, will retry');
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }

        return data;
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        lastError = error;
        attempts++;

        if (attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    // If we get here, all attempts failed
    console.error('All API call attempts failed:', lastError);
    throw lastError;
  } catch (error) {
    console.error('Error searching Vietnamese news:', error);
    throw error;
  }
}

/**
 * Filter articles by term in title, description, or content
 * @param {Array} articles - Articles to filter
 * @param {string} term - Term to search for
 * @returns {Array} - Filtered articles
 */
function filterArticles(articles, term) {
  if (!term) return articles;

  const termLower = term.toLowerCase();
  return articles.filter(article => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = (article.content || '').toLowerCase();

    return title.includes(termLower) ||
           description.includes(termLower) ||
           content.includes(termLower);
  });
}

/**
 * Get a placeholder image URL for Vietnamese news if the article image is missing
 * @returns {string} - Placeholder image URL
 */
function getPlaceholderImage() {
  // Array of Vietnam-related placeholder images
  const placeholders = [
    '/images/default-news.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Flag_of_North_Vietnam_%281955%E2%80%931976%29.svg/800px-Flag_of_North_Vietnam_%281955%E2%80%931976%29.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/7/78/Ho_Chi_Minh_City_Skyline_%28Unsplash%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Hanoi_panorama_2020.jpg/1024px-Hanoi_panorama_2020.jpg'
  ];

  // Return a random placeholder
  return placeholders[Math.floor(Math.random() * placeholders.length)];
}

/**
 * Detect if text contains Vietnamese characters
 * @param {string} text - The text to check
 * @returns {boolean} - True if text contains Vietnamese characters
 */
function containsVietnamese(text) {
  if (!text) return false;
  // Regex for Vietnamese-specific characters
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnamesePattern.test(text);
}

/**
 * Format article date in Vietnamese style
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
function formatVietnameseDate(dateString) {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Format to match screenshot: YYYY-MM-DD HH:MM:SS (Giờ VN)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (Giờ VN)`;
  } catch (error) {
    // Fallback format
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} (Giờ VN)`;
  }
}

// Export the functions as a global object
window.vtvNewsApi = {
  getTopHeadlines,
  searchVietnameseNews,
  filterArticles,
  getPlaceholderImage,
  containsVietnamese,
  formatVietnameseDate
};
