// Core Entity Types
export interface Feed {
  id: string;
  url: string;
  title: string;
  description?: string;
  link?: string;
  imageUrl?: string;
  lastFetched?: Date;
  createdAt: Date;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  description?: string;
  content?: string;
  link: string;
  author?: string;
  publishedAt: Date;
  imageUrl?: string;
  isRead: boolean;
  isBookmarked: boolean;
  bookmarkedAt?: Date;
  categoryId?: string;
  categoryConfidence?: number;
  embedding?: number[];
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  priority: number;
  exampleArticleIds: string[];
  createdAt: Date;
}

export interface ArticleEmbedding {
  articleId: string;
  embedding: number[];
  createdAt: Date;
}

// Configuration Types
export interface EmbeddingConfig {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  confidenceThreshold: number;
}

// Search Types
export interface SearchResult {
  article: Article;
  score: number;
  highlights?: string[];
}

export interface SearchOptions {
  type: 'fulltext' | 'embedding';
  limit?: number;
  feedIds?: string[];
  includeBookmarked?: boolean;
}

// UI State Types
export interface AppState {
  feeds: Feed[];
  articles: Article[];
  categories: Category[];
  selectedFeedId?: string;
  selectedArticleId?: string;
  searchQuery: string;
  isLoading: boolean;
}

