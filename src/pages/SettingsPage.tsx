import React, { useState, useEffect } from 'react';
import { EmbeddingService } from '../services/embedding.service';
import { ClassificationService } from '../services/classification.service';
import { Key, Zap } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [threshold, setThreshold] = useState(0.6);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existingKey = EmbeddingService.getApiKey();
    if (existingKey) {
      setApiKey(existingKey);
    }
    setThreshold(ClassificationService.getConfidenceThreshold());
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      EmbeddingService.setApiKey(apiKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleSaveThreshold = () => {
    ClassificationService.setConfidenceThreshold(threshold);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">설정</h1>

        {/* API Key Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">OpenAI API 키</h2>
          </div>

          <p className="text-gray-600 mb-4">
            시맨틱 검색 및 자동 기사 분류와 같은 임베딩 기반 기능을 활성화하려면 OpenAI API 키를 입력하세요.
          </p>

          <div className="space-y-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button
              onClick={handleSaveApiKey}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              API 키 저장
            </button>

            <div className="text-sm text-gray-600">
              <p>
                API 키가 없으신가요?{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  OpenAI에서 받기
                </a>
              </p>
              <p className="mt-2 text-yellow-600">
                참고: API 키가 설정되지 않은 경우 앱은 개발용 모의 임베딩을 사용합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Classification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">분류 설정</h2>
          </div>

          <p className="text-gray-600 mb-4">
            자동 기사 분류를 위한 최소 신뢰도 임계값을 설정하세요.
            이 임계값 미만의 신뢰도를 가진 기사는 미분류로 남습니다.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신뢰도 임계값: {(threshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <button
              onClick={handleSaveThreshold}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              임계값 저장
            </button>
          </div>
        </div>

        {/* Save Confirmation */}
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">설정이 성공적으로 저장되었습니다!</p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">이 앱에 대하여</h3>
          <p className="text-blue-800 text-sm">
            React, TypeScript와 시맨틱 검색, AI 기반 기사 분류와 같은 고급 기능으로 구축된 현대적인 RSS 리더입니다.
            모든 데이터는 IndexedDB를 사용하여 브라우저에 로컬로 저장됩니다.
          </p>
          <div className="mt-4 text-sm text-blue-700">
            <p><strong>기능:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>RSS 피드 관리 및 동기화</li>
              <li>전문 검색 및 시맨틱 검색</li>
              <li>AI 기반 기사 분류</li>
              <li>북마크 관리</li>
              <li>오프라인 우선 아키텍처</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

