/**
 * NewsAPI Client for VTV News
 * Fetches news from NewsAPI.org with 'vietnam' as the default keyword
 */

// Common Vietnamese terms for news articles
const VIETNAMESE_TRANSLATIONS = {
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
};

/**
 * A simple function to enhance text with Vietnamese terms
 * @param {string} text - The text to enhance
 * @returns {string} - Enhanced text
 */
function enhanceWithVietnamese(text) {
    if (!text) return text;

    let textLower = text.toLowerCase();
    for (const [eng, vie] of Object.entries(VIETNAMESE_TRANSLATIONS)) {
        if (textLower.includes(eng)) {
            textLower = textLower.replace(new RegExp(eng, 'gi'), vie);
        }
    }

    // If the text has changed, return the modified text
    // Otherwise, return original text but add a note about Vietnam
    if (textLower !== text.toLowerCase()) {
        return textLower.charAt(0).toUpperCase() + textLower.slice(1);
    } else {
        return `${text} (Tin tức Việt Nam)`;
    }
}

/**
 * Check if text contains Vietnamese characters
 * @param {string} text - The text to check
 * @returns {boolean} - True if text contains Vietnamese characters
 */
function containsVietnamese(text) {
    if (!text) return false;
    const vietnameseChars = 'ăâàáảãạằắẳẵặầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ';
    text = text.toLowerCase();
    for (let i = 0; i < text.length; i++) {
        if (vietnameseChars.includes(text[i])) {
            return true;
        }
    }
    return false;
}

/**
 * Convert UTC time string to Vietnam time (UTC+7)
 * @param {string} utcTimeStr - UTC time string in ISO format
 * @returns {string} - Formatted date string
 */
function convertUtcToVnTime(utcTimeStr) {
    try {
        const utcDate = new Date(utcTimeStr);
        // Add 7 hours for Vietnam time (UTC+7)
        const vnDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));

        // Format: YYYY-MM-DD HH:MM:SS (Giờ VN)
        const year = vnDate.getFullYear();
        const month = String(vnDate.getMonth() + 1).padStart(2, '0');
        const day = String(vnDate.getDate()).padStart(2, '0');
        const hours = String(vnDate.getHours()).padStart(2, '0');
        const minutes = String(vnDate.getMinutes()).padStart(2, '0');
        const seconds = String(vnDate.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (Giờ VN)`;
    } catch (error) {
        console.error('Date conversion error:', error);
        return utcTimeStr;
    }
}

/**
 * Fetch news from NewsAPI with vietnam as default keyword
 * @param {Object} options - Search options
 * @param {string} options.query - Search query (default: "vietnam")
 * @param {string} options.fromDate - Start date in YYYY-MM-DD format
 * @param {string} options.sortBy - Sort by (popularity, relevancy, publishedAt)
 * @returns {Promise<Object>} - Promise with news data
 */
async function fetchNewsWithVietnamDefault(options = {}) {
    try {
        // Ensure 'vietnam' is included in the query if not already present
        let query = options.query || 'vietnam';
        if (!query.toLowerCase().includes('vietnam') && query.toLowerCase() !== 'vietnam') {
            query = `${query} vietnam`;
        }

        // Set default fromDate to 15 days ago if not provided
        let fromDate = options.fromDate;
        if (!fromDate) {
            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
            fromDate = fifteenDaysAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }

        // Use the Netlify function instead of the proxy
        // This is more reliable as it goes through our server
        const params = new URLSearchParams({
            q: query,
            from: fromDate,
            sortBy: options.sortBy || 'popularity',
        });

        // Multiple retry attempts with backoff
        let attempts = 0;
        const maxAttempts = 3;
        let lastError = null;

        while (attempts < maxAttempts) {
            try {
                // Call the serve-news Netlify function
                const response = await fetch(`/.netlify/functions/serve-news?${params.toString()}`);

                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                if (data.status !== 'ok') {
                    throw new Error(`NewsAPI error: ${data.message || 'Unknown error'}`);
                }

                // Process the articles
                if (data.articles && data.articles.length > 0) {
                    data.articles = data.articles.map(article => {
                        // Add Vietnamese text enhancement if not already Vietnamese
                        const title = article.title || '';
                        const description = article.description || '';

                        if (!containsVietnamese(title)) {
                            article.enhancedTitle = enhanceWithVietnamese(title);
                        } else {
                            article.enhancedTitle = title;
                        }

                        if (!containsVietnamese(description)) {
                            article.enhancedDescription = enhanceWithVietnamese(description);
                        } else {
                            article.enhancedDescription = description;
                        }

                        // Format the date
                        if (article.publishedAt) {
                            article.formattedDate = convertUtcToVnTime(article.publishedAt);
                        }

                        // Format author
                        if (!article.author) {
                            article.author = 'Không có tác giả';
                        }

                        return article;
                    });
                }

                return data;
            } catch (error) {
                console.error(`Attempt ${attempts + 1} failed:`, error);
                lastError = error;
                attempts++;

                if (attempts < maxAttempts) {
                    // Exponential backoff (wait longer between each retry)
                    const delay = Math.pow(2, attempts) * 500;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // If we get here, all attempts failed
        throw lastError || new Error('Failed to fetch news after multiple attempts');
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
}

/**
 * Render news articles in the VTV style
 * @param {Array} articles - Array of news articles
 * @param {string} query - Search query
 * @param {Element} container - Container to render the articles in
 */
function renderNewsArticles(articles, query, container) {
    if (!container) {
        container = document.createElement('div');
        container.className = 'news-container';
        document.body.appendChild(container);
    }

    // Create search results section
    const searchResults = document.createElement('section');
    searchResults.className = 'search-results';

    // Add title
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = `Kết quả tìm kiếm: "${query}" (${articles.length} kết quả)`;
    searchResults.appendChild(sectionTitle);

    // Create news list
    const newsList = document.createElement('div');
    newsList.className = 'news-list news-list-clean';

    // Add articles
    articles.forEach(article => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item clean-style';

        // Article title
        const title = document.createElement('h3');
        title.className = 'news-title';
        title.textContent = article.enhancedTitle || article.title;
        newsItem.appendChild(title);

        // Article metadata
        const metaDetails = document.createElement('div');
        metaDetails.className = 'news-meta-details';

        // Source line
        const sourceLine = document.createElement('div');
        sourceLine.className = 'news-source-line';
        sourceLine.innerHTML = `<strong>Nguồn:</strong> ${article.source.name}`;
        metaDetails.appendChild(sourceLine);

        // Author line
        const authorLine = document.createElement('div');
        authorLine.className = 'news-author-line';
        authorLine.innerHTML = `<strong>Tác giả:</strong> ${article.author}`;
        metaDetails.appendChild(authorLine);

        // Date line
        const dateLine = document.createElement('div');
        dateLine.className = 'news-date-line';
        dateLine.innerHTML = `<strong>Thời gian đăng:</strong> ${article.formattedDate || article.publishedAt}`;
        metaDetails.appendChild(dateLine);

        // Description line
        const descLine = document.createElement('div');
        descLine.className = 'news-description-line';
        descLine.innerHTML = `<strong>Mô tả:</strong> ${article.enhancedDescription || article.description || 'Không có mô tả'}`;
        metaDetails.appendChild(descLine);

        // View original link
        const viewOriginal = document.createElement('div');
        viewOriginal.className = 'view-original';
        const link = document.createElement('a');
        link.href = article.url;
        link.target = '_blank';
        link.className = 'view-original-link';
        link.textContent = 'Xem bài báo gốc';
        viewOriginal.appendChild(link);
        metaDetails.appendChild(viewOriginal);

        newsItem.appendChild(metaDetails);
        newsList.appendChild(newsItem);
    });

    searchResults.appendChild(newsList);
    container.innerHTML = '';
    container.appendChild(searchResults);
}

// Export the functions
window.vtvNewsApiClient = {
    fetchNewsWithVietnamDefault,
    renderNewsArticles,
    enhanceWithVietnamese,
    containsVietnamese,
    convertUtcToVnTime
};
