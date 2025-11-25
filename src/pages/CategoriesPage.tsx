import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { ClassificationService } from '../services/classification.service';
import type { Category } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Tag, PlayCircle, CheckCircle2 } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());

  const categories = useLiveQuery(() => db.categories.orderBy('priority').toArray(), []);
  const allArticles = useLiveQuery(() => db.articles.toArray(), []);
  
  const categorizedArticles = useLiveQuery(
    async () => {
      if (selectedCategoryId) {
        return await db.articles
          .where('categoryId')
          .equals(selectedCategoryId)
          .reverse()
          .sortBy('publishedAt');
      }
      return [];
    },
    [selectedCategoryId]
  );

  const unassignedArticles = useLiveQuery(
    () => db.articles.filter(a => !a.categoryId).toArray(),
    []
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const category: Category = {
      id: uuidv4(),
      name: categoryName,
      color: categoryColor,
      priority: (categories?.length || 0) + 1,
      exampleArticleIds: [],
      createdAt: new Date(),
    };

    await db.categories.add(category);
    setCategoryName('');
    setCategoryColor('#3B82F6');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('이 카테고리를 삭제하시겠습니까?')) return;

    // Remove category from articles
    const articlesInCategory = await db.articles
      .where('categoryId')
      .equals(categoryId)
      .toArray();

    for (const article of articlesInCategory) {
      await db.articles.update(article.id, {
        categoryId: undefined,
        categoryConfidence: undefined,
      });
    }

    await db.categories.delete(categoryId);
  };

  const handleAddExamples = () => {
    if (!selectedCategoryId) return;
    setShowAddArticleModal(true);
  };

  const handleSaveExamples = async () => {
    if (!selectedCategoryId) return;

    const category = categories?.find(c => c.id === selectedCategoryId);
    if (!category) return;

    const newExamples = [...category.exampleArticleIds, ...Array.from(selectedArticles)];
    await db.categories.update(selectedCategoryId, {
      exampleArticleIds: newExamples,
    });

    // Mark selected articles as belonging to this category
    for (const articleId of selectedArticles) {
      await db.articles.update(articleId, {
        categoryId: selectedCategoryId,
        categoryConfidence: 1.0,
      });
    }

    setSelectedArticles(new Set());
    setShowAddArticleModal(false);
  };

  const handleReclassify = async () => {
    if (!allArticles || !categories) return;

    setIsClassifying(true);
    try {
      await ClassificationService.reclassifyArticles(allArticles, categories);
      alert('분류가 완료되었습니다!');
    } catch (error) {
      console.error('Classification error:', error);
      alert('분류에 실패했습니다. 콘솔을 확인하세요.');
    } finally {
      setIsClassifying(false);
    }
  };

  const selectedCategory = categories?.find(c => c.id === selectedCategoryId);

  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
  ];

  return (
    <div className="flex h-full">
      {/* Categories List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-3">카테고리</h2>
          
          <form onSubmit={handleAddCategory} className="space-y-2">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="카테고리 이름..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCategoryColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    categoryColor === color ? 'border-gray-900' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              카테고리 추가
            </button>
          </form>

          <button
            onClick={handleReclassify}
            disabled={isClassifying || !categories || categories.length === 0}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4" />
            {isClassifying ? '분류 중...' : '전체 재분류'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Unassigned */}
          <div
            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
              selectedCategoryId === null ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedCategoryId(null)}
          >
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-400" />
              <span className="font-medium">미분류</span>
              <span className="ml-auto text-sm text-gray-500">
                {unassignedArticles?.length || 0}
              </span>
            </div>
          </div>

          {categories?.map((category) => (
            <div
              key={category.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedCategoryId === category.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium flex-1">{category.name}</span>
                <span className="text-sm text-gray-500">
                  {category.exampleArticleIds.length}개 예시
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id);
                  }}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Details */}
      <div className="flex-1 bg-white overflow-y-auto">
        {selectedCategory ? (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
              </div>
              <button
                onClick={handleAddExamples}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                예시 추가
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  예시 기사 ({selectedCategory.exampleArticleIds.length}개)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  자동 분류를 활성화하려면 최소 3개의 예시 기사를 추가하세요
                </p>
              </div>

              <h3 className="font-semibold">
                분류된 기사 ({categorizedArticles?.length || 0}개)
              </h3>
              {categorizedArticles?.map((article) => (
                <div
                  key={article.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <h4 className="font-medium">{article.title}</h4>
                  {article.categoryConfidence && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4" />
                      신뢰도: {(article.categoryConfidence * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">미분류 기사</h2>
            <div className="space-y-4">
              {unassignedArticles?.map((article) => (
                <div
                  key={article.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <h4 className="font-medium">{article.title}</h4>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {article.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Examples Modal */}
      {showAddArticleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">예시 기사 추가</h3>
            
            <div className="space-y-2 mb-6">
              {allArticles
                ?.filter(a => !selectedCategory?.exampleArticleIds.includes(a.id))
                .map((article) => (
                  <label
                    key={article.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedArticles.has(article.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedArticles);
                        if (e.target.checked) {
                          newSet.add(article.id);
                        } else {
                          newSet.delete(article.id);
                        }
                        setSelectedArticles(newSet);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{article.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {article.description}
                      </p>
                    </div>
                  </label>
                ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddArticleModal(false);
                  setSelectedArticles(new Set());
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveExamples}
                disabled={selectedArticles.size === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {selectedArticles.size}개 기사 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

