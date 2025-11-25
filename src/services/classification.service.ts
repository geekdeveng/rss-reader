import type { Article, Category } from '../types';
import { db } from '../db/database';
import { EmbeddingService } from './embedding.service';

export interface ClassificationResult {
  categoryId: string;
  confidence: number;
}

export class ClassificationService {
  private static CONFIDENCE_THRESHOLD = 0.6;

  static setConfidenceThreshold(threshold: number) {
    this.CONFIDENCE_THRESHOLD = threshold;
    localStorage.setItem('confidence_threshold', threshold.toString());
  }

  static getConfidenceThreshold(): number {
    const stored = localStorage.getItem('confidence_threshold');
    return stored ? parseFloat(stored) : this.CONFIDENCE_THRESHOLD;
  }

  static async classifyArticle(
    article: Article,
    categories: Category[],
    embeddings: Map<string, number[]>
  ): Promise<ClassificationResult | null> {
    // Get article embedding
    let articleEmbedding = embeddings.get(article.id);
    
    if (!articleEmbedding) {
      const embeddingData = await db.embeddings.get(article.id);
      if (!embeddingData) {
        // Generate embedding if not exists
        const newEmbedding = await EmbeddingService.generateArticleEmbedding(article);
        await db.embeddings.put(newEmbedding);
        articleEmbedding = newEmbedding.embedding;
      } else {
        articleEmbedding = embeddingData.embedding;
      }
    }

    let bestMatch: ClassificationResult | null = null;
    let bestSimilarity = 0;

    for (const category of categories) {
      if (category.exampleArticleIds.length < 3) {
        continue; // Skip categories with insufficient examples
      }

      const similarities: number[] = [];

      for (const exampleId of category.exampleArticleIds) {
        let exampleEmbedding = embeddings.get(exampleId);
        
        if (!exampleEmbedding) {
          const embeddingData = await db.embeddings.get(exampleId);
          if (embeddingData) {
            exampleEmbedding = embeddingData.embedding;
          }
        }

        if (exampleEmbedding) {
          const similarity = EmbeddingService.cosineSimilarity(
            articleEmbedding,
            exampleEmbedding
          );
          similarities.push(similarity);
        }
      }

      if (similarities.length > 0) {
        // Use average similarity
        const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
        
        if (avgSimilarity > bestSimilarity) {
          bestSimilarity = avgSimilarity;
          bestMatch = {
            categoryId: category.id,
            confidence: avgSimilarity,
          };
        }
      }
    }

    // Apply confidence threshold
    const threshold = this.getConfidenceThreshold();
    if (bestMatch && bestMatch.confidence >= threshold) {
      return bestMatch;
    }

    return null;
  }

  static async reclassifyArticles(
    articles: Article[],
    categories: Category[]
  ): Promise<Map<string, ClassificationResult | null>> {
    const results = new Map<string, ClassificationResult | null>();
    
    // Preload all embeddings
    const allEmbeddings = await db.embeddings.toArray();
    const embeddingMap = new Map(
      allEmbeddings.map(e => [e.articleId, e.embedding])
    );

    for (const article of articles) {
      const result = await this.classifyArticle(article, categories, embeddingMap);
      results.set(article.id, result);

      // Update article in database
      if (result) {
        await db.articles.update(article.id, {
          categoryId: result.categoryId,
          categoryConfidence: result.confidence,
        });
      } else {
        await db.articles.update(article.id, {
          categoryId: undefined,
          categoryConfidence: undefined,
        });
      }
    }

    return results;
  }

  static async generateEmbeddingsForArticles(articles: Article[]): Promise<void> {
    for (const article of articles) {
      const existing = await db.embeddings.get(article.id);
      if (!existing) {
        const embedding = await EmbeddingService.generateArticleEmbedding(article);
        await db.embeddings.put(embedding);
      }
    }
  }
}

