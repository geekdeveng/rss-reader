import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { FeedService } from '../services/feed.service';
import type { Article } from '../types';
import { Plus, Trash2, RefreshCw, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export const FeedsPage: React.FC = () => {
  const [feedUrl, setFeedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const feeds = useLiveQuery(() => db.feeds.toArray(), []);
  const articles = useLiveQuery(
    async () => {
      if (selectedFeedId) {
        return await db.articles
          .where('feedId')
          .equals(selectedFeedId)
          .reverse()
          .sortBy('publishedAt');
      }
      return [] as Article[];
    },
    [selectedFeedId]
  );

  useEffect(() => {
    if (feeds && feeds.length > 0 && !selectedFeedId) {
      setSelectedFeedId(feeds[0].id);
    }
  }, [feeds, selectedFeedId]);

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const feed = await FeedService.addFeed(feedUrl);
      setFeedUrl('');
      setSelectedFeedId(feed.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add feed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm('이 피드를 삭제하시겠습니까?')) return;

    try {
      await FeedService.deleteFeed(feedId);
      if (selectedFeedId === feedId) {
        setSelectedFeedId(feeds && feeds.length > 1 ? feeds[0].id : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '피드 삭제 실패');
    }
  };

  const handleRefreshFeed = async (feedId: string) => {
    try {
      const count = await FeedService.refreshFeed(feedId);
      alert(`${count}개의 새 기사가 추가되었습니다`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '피드 새로고침 실패');
    }
  };

  const handleArticleClick = async (article: Article) => {
    setSelectedArticle(article);
    if (!article.isRead) {
      await FeedService.markAsRead(article.id);
    }
  };

  const handleToggleBookmark = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await FeedService.toggleBookmark(articleId);
  };

  const selectedFeed = feeds?.find(f => f.id === selectedFeedId);

  return (
    <div className="flex h-full">
      {/* Feed List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-3">RSS 피드</h2>
          <form onSubmit={handleAddFeed} className="space-y-2">
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="RSS 피드 URL을 입력하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              피드 추가
            </button>
          </form>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto">
          {feeds?.map((feed) => (
            <div
              key={feed.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedFeedId === feed.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedFeedId(feed.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{feed.title}</h3>
                  {feed.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {feed.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRefreshFeed(feed.id);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFeed(feed.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article List */}
      <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
        {selectedFeed && (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{selectedFeed.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {articles?.length || 0}개의 기사
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {articles?.map((article) => (
                <div
                  key={article.id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedArticle?.id === article.id ? 'bg-blue-50' : ''
                  } ${!article.isRead ? 'bg-blue-50/30' : ''}`}
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium ${!article.isRead ? 'text-blue-600' : 'text-gray-900'}`}>
                      {article.title}
                    </h3>
                    <button
                      onClick={(e) => handleToggleBookmark(article.id, e)}
                      className="text-gray-400 hover:text-yellow-500"
                    >
                      {article.isBookmarked ? (
                        <BookmarkCheck className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {article.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {article.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(article.publishedAt, { addSuffix: true, locale: ko })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
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
              <span>{formatDistanceToNow(selectedArticle.publishedAt, { addSuffix: true, locale: ko })}</span>
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
              dangerouslySetInnerHTML={{ __html: selectedArticle.content || selectedArticle.description || '' }}
            />
          </article>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            기사를 선택하여 읽어보세요
          </div>
        )}
      </div>
    </div>
  );
};

