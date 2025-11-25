import Dexie, { type Table } from 'dexie';
import type { Feed, Article, Category, ArticleEmbedding } from '../types';

export class RSSReaderDB extends Dexie {
  feeds!: Table<Feed>;
  articles!: Table<Article>;
  categories!: Table<Category>;
  embeddings!: Table<ArticleEmbedding>;

  constructor() {
    super('RSSReaderDB');
    
    this.version(1).stores({
      feeds: 'id, url, createdAt',
      articles: 'id, feedId, publishedAt, isRead, isBookmarked, bookmarkedAt, categoryId, createdAt',
      categories: 'id, name, priority, createdAt',
      embeddings: 'articleId, createdAt'
    });
  }
}

export const db = new RSSReaderDB();

