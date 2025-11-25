import type { Article, ArticleEmbedding } from '../types';

export interface EmbeddingResponse {
  embedding: number[];
}

export class EmbeddingService {
  private static API_ENDPOINT = 'https://api.openai.com/v1/embeddings';
  private static MODEL = 'text-embedding-3-small';
  private static apiKey: string | null = null;

  static setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  static getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('openai_api_key');
    }
    return this.apiKey;
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      // Return mock embedding if no API key
      console.warn('No API key set. Using mock embedding.');
      return this.generateMockEmbedding(text);
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.MODEL,
          input: text.slice(0, 8000), // Limit text length
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Fallback to mock embedding
      return this.generateMockEmbedding(text);
    }
  }

  static async generateArticleEmbedding(article: Article): Promise<ArticleEmbedding> {
    const text = `${article.title} ${article.description || ''} ${article.content || ''}`;
    const embedding = await this.generateEmbedding(text);
    
    return {
      articleId: article.id,
      embedding,
      createdAt: new Date(),
    };
  }

  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Mock embedding for development/testing
  private static generateMockEmbedding(text: string): number[] {
    const dimension = 1536; // Same as OpenAI's text-embedding-3-small
    const embedding: number[] = [];
    
    // Simple hash-based mock embedding
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    
    const seed = Math.abs(hash);
    for (let i = 0; i < dimension; i++) {
      // Generate deterministic pseudo-random values
      const x = Math.sin(seed + i) * 10000;
      embedding.push(x - Math.floor(x));
    }
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }
}

