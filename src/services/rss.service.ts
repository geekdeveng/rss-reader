import type { Feed, Article } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class RSSService {
  private static CORS_PROXY = 'https://api.allorigins.win/get?url=';

  static async fetchFeed(url: string): Promise<{ feed: Feed; articles: Article[] }> {
    try {
      let xmlText: string;
      
      // Try direct fetch first
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Direct fetch failed');
        xmlText = await response.text();
      } catch {
        // Fallback to CORS proxy
        const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        xmlText = data.contents;
      }

      // Parse XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('XML parsing error');
      }

      // Determine feed type (RSS or Atom)
      const isAtom = xmlDoc.querySelector('feed') !== null;
      
      let feed: Feed;
      let articles: Article[];

      if (isAtom) {
        const result = this.parseAtomFeed(xmlDoc, url);
        feed = result.feed;
        articles = result.articles;
      } else {
        const result = this.parseRSSFeed(xmlDoc, url);
        feed = result.feed;
        articles = result.articles;
      }

      return { feed, articles };
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async refreshFeed(feed: Feed): Promise<Article[]> {
    const { articles } = await this.fetchFeed(feed.url);
    return articles.map(article => ({
      ...article,
      feedId: feed.id, // Use existing feed ID
    }));
  }

  private static parseRSSFeed(xmlDoc: Document, url: string): { feed: Feed; articles: Article[] } {
    const channel = xmlDoc.querySelector('channel');
    if (!channel) throw new Error('Invalid RSS feed');

    const feed: Feed = {
      id: uuidv4(),
      url,
      title: this.getTextContent(channel, 'title') || 'Untitled Feed',
      description: this.getTextContent(channel, 'description'),
      link: this.getTextContent(channel, 'link'),
      imageUrl: this.getTextContent(channel, 'image > url') || 
                channel.querySelector('image')?.getAttribute('url') || undefined,
      lastFetched: new Date(),
      createdAt: new Date(),
    };

    const items = Array.from(xmlDoc.querySelectorAll('item'));
    const articles: Article[] = items.map(item => ({
      id: uuidv4(),
      feedId: feed.id,
      title: this.getTextContent(item, 'title') || 'Untitled',
      description: this.getTextContent(item, 'description') || 
                   this.getTextContent(item, 'content\\:encoded'),
      content: this.getTextContent(item, 'content\\:encoded') || 
               this.getTextContent(item, 'description'),
      link: this.getTextContent(item, 'link') || '',
      author: this.getTextContent(item, 'author') || 
              this.getTextContent(item, 'dc\\:creator') ||
              this.getTextContent(item, 'creator'),
      publishedAt: this.parseDate(
        this.getTextContent(item, 'pubDate') || 
        this.getTextContent(item, 'dc\\:date')
      ),
      imageUrl: this.extractImageUrl(item),
      isRead: false,
      isBookmarked: false,
      createdAt: new Date(),
    }));

    return { feed, articles };
  }

  private static parseAtomFeed(xmlDoc: Document, url: string): { feed: Feed; articles: Article[] } {
    const feedEl = xmlDoc.querySelector('feed');
    if (!feedEl) throw new Error('Invalid Atom feed');

    const feed: Feed = {
      id: uuidv4(),
      url,
      title: this.getTextContent(feedEl, 'title') || 'Untitled Feed',
      description: this.getTextContent(feedEl, 'subtitle'),
      link: feedEl.querySelector('link')?.getAttribute('href') || undefined,
      imageUrl: this.getTextContent(feedEl, 'logo') || 
                this.getTextContent(feedEl, 'icon'),
      lastFetched: new Date(),
      createdAt: new Date(),
    };

    const entries = Array.from(xmlDoc.querySelectorAll('entry'));
    const articles: Article[] = entries.map(entry => {
      const contentEl = entry.querySelector('content');
      const summaryEl = entry.querySelector('summary');
      
      return {
        id: uuidv4(),
        feedId: feed.id,
        title: this.getTextContent(entry, 'title') || 'Untitled',
        description: summaryEl?.textContent?.trim() || undefined,
        content: contentEl?.textContent?.trim() || summaryEl?.textContent?.trim() || undefined,
        link: entry.querySelector('link')?.getAttribute('href') || '',
        author: this.getTextContent(entry, 'author > name'),
        publishedAt: this.parseDate(
          this.getTextContent(entry, 'published') || 
          this.getTextContent(entry, 'updated')
        ),
        imageUrl: this.extractImageUrl(entry),
        isRead: false,
        isBookmarked: false,
        createdAt: new Date(),
      };
    });

    return { feed, articles };
  }

  private static getTextContent(element: Element, selector: string): string | undefined {
    const el = element.querySelector(selector);
    return el?.textContent?.trim() || undefined;
  }

  private static parseDate(dateStr: string | undefined): Date {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private static extractImageUrl(item: Element): string | undefined {
    // Try media:content
    const mediaContent = item.querySelector('media\\:content, [medium="image"]');
    if (mediaContent) {
      const url = mediaContent.getAttribute('url');
      if (url) return url;
    }

    // Try enclosure
    const enclosure = item.querySelector('enclosure[type^="image"]');
    if (enclosure) {
      const url = enclosure.getAttribute('url');
      if (url) return url;
    }

    // Try to extract from content/description
    const content = this.getTextContent(item, 'content\\:encoded') || 
                   this.getTextContent(item, 'description') ||
                   this.getTextContent(item, 'content');
    
    if (content) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
      const match = content.match(imgRegex);
      if (match) return match[1];
    }

    return undefined;
  }
}
