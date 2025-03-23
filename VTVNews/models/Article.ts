// Article interface
export interface Article {
  id: string;
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
  category?: string;
}

// Function to transform NewsAPI article to our format
export const transformArticle = (article: any, index: number): Article => {
  return {
    id: `${index}_${Date.now()}`, // Create a unique ID
    source: article.source,
    author: article.author,
    title: article.title,
    description: article.description,
    url: article.url,
    urlToImage: article.urlToImage,
    publishedAt: article.publishedAt,
    content: article.content,
    category: article.category || ''
  };
};
