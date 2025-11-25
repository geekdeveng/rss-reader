import { db } from '../db/database';
import type { Feed, Article } from '../types';
import { RSSService } from './rss.service';
import { EmbeddingService } from './embedding.service';

export class FeedService {
  static async addFeed(url: string): Promise<Feed> {
    // Check if feed already exists
    const existing = await db.feeds.where('url').equals(url).first();
    if (existing) {
      throw new Error('This feed is already subscribed');
    }

    // Fetch feed data
    const { feed, articles } = await RSSService.fetchFeed(url);

    // Save feed
    await db.feeds.add(feed);

    // Save articles
    await db.articles.bulkAdd(articles);

    // Generate embeddings in background
    this.generateEmbeddingsInBackground(articles);

    return feed;
  }

  static async deleteFeed(feedId: string): Promise<void> {
    // Delete all articles from this feed
    await db.articles.where('feedId').equals(feedId).delete();
    
    // Delete feed
    await db.feeds.delete(feedId);
  }

  static async refreshFeed(feedId: string): Promise<number> {
    const feed = await db.feeds.get(feedId);
    if (!feed) {
      throw new Error('Feed not found');
    }

    // Fetch new articles
    const newArticles = await RSSService.refreshFeed(feed);

    // Get existing article links
    const existingArticles = await db.articles
      .where('feedId')
      .equals(feedId)
      .toArray();
    
    const existingLinks = new Set(existingArticles.map(a => a.link));

    // Filter out duplicates
    const uniqueNewArticles = newArticles.filter(a => !existingLinks.has(a.link));

    if (uniqueNewArticles.length > 0) {
      // Add new articles
      await db.articles.bulkAdd(uniqueNewArticles);
      
      // Generate embeddings in background
      this.generateEmbeddingsInBackground(uniqueNewArticles);
    }

    // Update last fetched time
    await db.feeds.update(feedId, { lastFetched: new Date() });

    return uniqueNewArticles.length;
  }

  static async refreshAllFeeds(): Promise<Map<string, number>> {
    const feeds = await db.feeds.toArray();
    const results = new Map<string, number>();

    for (const feed of feeds) {
      try {
        const count = await this.refreshFeed(feed.id);
        results.set(feed.id, count);
      } catch (error) {
        console.error(`Error refreshing feed ${feed.id}:`, error);
        results.set(feed.id, 0);
      }
    }

    return results;
  }

  static async markAsRead(articleId: string, isRead: boolean = true): Promise<void> {
    await db.articles.update(articleId, { isRead });
  }

  static async toggleBookmark(articleId: string): Promise<boolean> {
    const article = await db.articles.get(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    const newBookmarkState = !article.isBookmarked;
    await db.articles.update(articleId, {
      isBookmarked: newBookmarkState,
      bookmarkedAt: newBookmarkState ? new Date() : undefined,
    });

    return newBookmarkState;
  }

  static async getArticlesByFeed(feedId: string): Promise<Article[]> {
    return db.articles
      .where('feedId')
      .equals(feedId)
      .reverse()
      .sortBy('publishedAt');
  }

  static async getBookmarkedArticles(): Promise<Article[]> {
    return db.articles
      .where('isBookmarked')
      .equals(1)
      .reverse()
      .sortBy('bookmarkedAt');
  }

  static async getUnreadArticles(): Promise<Article[]> {
    return db.articles
      .where('isRead')
      .equals(0)
      .reverse()
      .sortBy('publishedAt');
  }

  private static async generateEmbeddingsInBackground(articles: Article[]): Promise<void> {
    // Don't await, run in background
    setTimeout(async () => {
      for (const article of articles) {
        try {
          const existing = await db.embeddings.get(article.id);
          if (!existing) {
            const embedding = await EmbeddingService.generateArticleEmbedding(article);
            await db.embeddings.put(embedding);
          }
        } catch (error) {
          console.error(`Error generating embedding for article ${article.id}:`, error);
        }
      }
    }, 100);
  }
}

