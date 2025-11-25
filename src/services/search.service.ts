import Fuse, { type FuseResultMatch } from 'fuse.js';
import type { Article, SearchResult } from '../types';
import { db } from '../db/database';
import { EmbeddingService } from './embedding.service';

export class SearchService {
  private static fuse: Fuse<Article> | null = null;

  static initializeFulltextSearch(articles: Article[]) {
    this.fuse = new Fuse(articles, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1.5 },
        { name: 'content', weight: 1 },
        { name: 'author', weight: 0.5 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }

  static async fulltextSearch(
    query: string,
    articles: Article[],
    limit: number = 50
  ): Promise<SearchResult[]> {
    if (!this.fuse) {
      this.initializeFulltextSearch(articles);
    }

    if (!this.fuse) {
      return [];
    }

    const results = this.fuse.search(query, { limit });

    return results.map(result => ({
      article: result.item,
      score: 1 - (result.score || 0),
      highlights: this.extractHighlights(result.matches || [], query),
    }));
  }

  static async embeddingSearch(
    query: string,
    articles: Article[],
    limit: number = 50
  ): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await EmbeddingService.generateEmbedding(query);

    // Get embeddings for all articles
    const embeddings = await db.embeddings.toArray();
    const embeddingMap = new Map(
      embeddings.map(e => [e.articleId, e.embedding])
    );

    // Calculate similarities
    const similarities: { article: Article; score: number }[] = [];

    for (const article of articles) {
      const articleEmbedding = embeddingMap.get(article.id);
      
      if (articleEmbedding) {
        const similarity = EmbeddingService.cosineSimilarity(
          queryEmbedding,
          articleEmbedding
        );
        similarities.push({ article, score: similarity });
      }
    }

    // Sort by similarity and limit
    similarities.sort((a, b) => b.score - a.score);
    const topResults = similarities.slice(0, limit);

    return topResults.map(result => ({
      article: result.article,
      score: result.score,
    }));
  }

  private static extractHighlights(
    matches: readonly FuseResultMatch[],
    query: string
  ): string[] {
    const highlights: string[] = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    for (const match of matches) {
      if (match.value) {
        const text = match.value;
        
        // Find matching positions
        for (const queryWord of queryWords) {
          const index = text.toLowerCase().indexOf(queryWord);
          if (index !== -1) {
            // Extract context around match (50 chars before and after)
            const start = Math.max(0, index - 50);
            const end = Math.min(text.length, index + queryWord.length + 50);
            const snippet = text.slice(start, end);
            const prefix = start > 0 ? '...' : '';
            const suffix = end < text.length ? '...' : '';
            
            highlights.push(`${prefix}${snippet}${suffix}`);
          }
        }
      }
    }

    return highlights.slice(0, 3); // Limit to 3 highlights
  }

  static highlightText(text: string, query: string): string {
    if (!query) return text;

    const words = query.split(/\s+/).filter(w => w.length > 1);
    let highlightedText = text;

    for (const word of words) {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200">$1</mark>'
      );
    }

    return highlightedText;
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

