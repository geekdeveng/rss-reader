import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { SearchService } from '../services/search.service';
import type { Article, SearchResult } from '../types';
import { Search, ExternalLink, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'fulltext' | 'embedding'>('fulltext');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const allArticles = useLiveQuery(() => db.articles.toArray(), []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !allArticles) return;

    setSearching(true);
    try {
      if (searchType === 'fulltext') {
        const searchResults = await SearchService.fulltextSearch(query, allArticles);
        setResults(searchResults);
      } else {
        const searchResults = await SearchService.embeddingSearch(query, allArticles);
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Search Panel */}
      <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-4">검색</h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="기사 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSearchType('fulltext')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  searchType === 'fulltext'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  전문검색
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSearchType('embedding')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  searchType === 'embedding'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  시맨틱
                </div>
              </button>
            </div>

            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {searching ? '검색 중...' : '검색'}
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>전문검색:</strong> 빠른 키워드 기반 검색
            </p>
            <p className="mt-1">
              <strong>시맨틱:</strong> AI 기반 의미 검색
            </p>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto">
          {results.length > 0 ? (
            <>
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  {results.length}개의 결과 발견
                </p>
              </div>
              {results.map((result) => (
                <div
                  key={result.article.id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedArticle?.id === result.article.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedArticle(result.article)}
                >
                  <h3 className="font-medium text-gray-900">{result.article.title}</h3>
                  {result.highlights && result.highlights.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      {result.highlights[0]}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>
                      점수: {(result.score * 100).toFixed(1)}%
                    </span>
                    <span>
                      {formatDistanceToNow(result.article.publishedAt, { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : query && !searching ? (
            <div className="p-8 text-center text-gray-500">
              검색 결과가 없습니다
            </div>
          ) : null}
        </div>
      </div>

      {/* Article Detail */}
      <div className="flex-1 bg-white overflow-y-auto">
        {selectedArticle ? (
          <article className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedArticle.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              {selectedArticle.author && <span>{selectedArticle.author}</span>}
              <span>
                {formatDistanceToNow(selectedArticle.publishedAt, { addSuffix: true, locale: ko })}
              </span>
              <a
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                새 탭에서 열기
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {selectedArticle.imageUrl && (
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full rounded-lg mb-6"
              />
            )}

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: SearchService.highlightText(
                  selectedArticle.content || selectedArticle.description || '',
                  query
                ),
              }}
            />
          </article>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            검색어를 입력하여 기사를 찾아보세요
          </div>
        )}
      </div>
    </div>
  );
};

