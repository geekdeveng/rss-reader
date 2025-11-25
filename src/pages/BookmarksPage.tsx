import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { FeedService } from '../services/feed.service';
import { BookmarkX, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export const BookmarksPage: React.FC = () => {
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  const bookmarkedArticles = useLiveQuery(
    () =>
      db.articles
        .where('isBookmarked')
        .equals(1)
        .reverse()
        .sortBy('bookmarkedAt'),
    []
  );

  const handleRemoveBookmark = async (articleId: string) => {
    await FeedService.toggleBookmark(articleId);
  };

  const toggleExpanded = (articleId: string) => {
    setExpandedArticles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">북마크</h1>
          <p className="text-gray-600 mt-2">
            {bookmarkedArticles?.length || 0}개의 북마크된 기사
          </p>
        </div>

        {bookmarkedArticles && bookmarkedArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>아직 북마크된 기사가 없습니다.</p>
            <p className="text-sm mt-2">
              피드 페이지에서 기사를 북마크하여 나중에 읽어보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedArticles?.map((article) => {
              const isExpanded = expandedArticles.has(article.id);
              
              return (
                <div
                  key={article.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex-1">
                        {article.title}
                      </h2>
                      <button
                        onClick={() => handleRemoveBookmark(article.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove bookmark"
                      >
                        <BookmarkX className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {article.author && <span>{article.author}</span>}
                      <span>
                        {formatDistanceToNow(article.publishedAt, { addSuffix: true, locale: ko })}
                      </span>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        원문 보기
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full rounded-lg mb-4"
                      />
                    )}

                    <div className={isExpanded ? '' : 'line-clamp-3'}>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: article.content || article.description || '',
                        }}
                      />
                    </div>

                    <button
                      onClick={() => toggleExpanded(article.id)}
                      className="text-blue-600 hover:underline text-sm mt-2"
                    >
                      {isExpanded ? '접기' : '더 보기'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

