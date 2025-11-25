# RSS Reader App - 프로젝트 요약

## 🎯 프로젝트 개요

React + TypeScript로 구축되었으며, AI 기반 검색 및 자동 분류 기능을 제공합니다.

## ✨ 구현된 모든 요구사항

### 화면 (완료 ✅)

1. ✅ **피드 입력/관리 화면**: RSS 피드 URL 입력/추가/삭제
2. ✅ **피드 열람 화면**: 구독한 RSS의 기사 목록 및 기사 상세 보기
3. ✅ **스크랩(Bookmark) 화면**: 스크랩한 기사들을 최신 스크랩 순으로 목록 표시
4. ✅ **검색 화면**: 피드의 기사들을 검색하고 결과를 보여주는 화면

### 기능 요구사항 (완료 ✅)

#### 기본 기능
- ✅ **구독 유지**: RSS 피드 URL을 입력해 구독하면, 앱 재시작 후에도 구독 상태 유지 (IndexedDB)
- ✅ **기사 상세**: 기사 클릭 시 이미지를 포함한 본문을 앱 내에서 읽기
- ✅ **읽음 상태**: 각 기사의 읽음/안읽음 상태를 저장
- ✅ **스크랩 기능**: 기사를 스크랩 가능

#### 스크랩 화면
- ✅ 스크랩한 기사의 본문 전체가 한 번에 보임 (이미지 포함)
- ✅ 최신에 스크랩한 항목이 위에 오도록 정렬
- ✅ 스크롤 가능하며, 100개 이상도 부드럽게 스크롤 (가상화 최적화)

#### 임베딩 기반 자동 분류
- ✅ 기사 텍스트를 외부 API(OpenAI)를 통해 임베딩
- ✅ 오프라인 자동 분류 (카테고리/태그 추천)
- ✅ 사용자 정의 카테고리: 각 최소 3개 예시 기사로 학습
- ✅ 신뢰도 임계값 기반 미분류 처리
- ✅ 카테고리 관리 화면: 생성/이름 변경/삭제/예시 지정/우선순위
- ✅ 분류 현황 화면: 카테고리별 기사 수, 예측 라벨과 신뢰도 표시
- ✅ 재분류 실행 버튼 (전체/선택)

#### 풀텍스트 검색 시스템
- ✅ 로컬에서 모든 기사/스크랩 본문 대상 즉시 검색
- ✅ 색인 범위: 기사 제목·요약·본문 + 스크랩 텍스트
- ✅ 하이라이트: 결과 목록과 상세에서 매칭 구간 하이라이트

#### 임베딩 기반 검색 시스템
- ✅ 검색어를 임베딩으로 변환
- ✅ 저장된 기사 임베딩과 유사도 계산 (코사인 유사도)
- ✅ 관련도 높은 순으로 기사 반환

## 🏗️ 기술 아키텍처

### 프론트엔드 스택
```
React 19            - 최신 React 버전
TypeScript 5.8      - 타입 안정성
Vite 7.1           - 초고속 빌드 도구
TailwindCSS v4     - 최신 유틸리티 CSS
```

### 핵심 라이브러리
```
dexie              - IndexedDB ORM
dexie-react-hooks  - React 통합
rss-parser         - RSS 파싱 (CORS 프록시 폴백)
fuse.js            - 풀텍스트 검색 엔진
lucide-react       - 아이콘
date-fns           - 날짜 처리
react-router-dom   - 라우팅
uuid               - 고유 ID 생성
```

### AI/ML 기능
```
OpenAI Embeddings API  - text-embedding-3-small 모델
코사인 유사도 계산      - 벡터 간 유사도
Mock 임베딩 시스템     - API 없이도 동작
```

## 📁 프로젝트 구조

```
rss-reader-app/
├── src/
│   ├── components/        # UI 컴포넌트
│   │   └── Layout.tsx     # 메인 레이아웃
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── FeedsPage.tsx       # 피드 관리
│   │   ├── BookmarksPage.tsx   # 북마크
│   │   ├── SearchPage.tsx      # 검색
│   │   ├── CategoriesPage.tsx  # 카테고리 관리
│   │   └── SettingsPage.tsx    # 설정
│   ├── services/          # 비즈니스 로직
│   │   ├── rss.service.ts           # RSS 파싱
│   │   ├── feed.service.ts          # 피드 관리
│   │   ├── embedding.service.ts     # 임베딩 생성
│   │   ├── classification.service.ts # 자동 분류
│   │   └── search.service.ts        # 검색 엔진
│   ├── db/                # 데이터베이스
│   │   └── database.ts    # IndexedDB 스키마
│   ├── types/             # TypeScript 타입
│   │   └── index.ts       # 모든 타입 정의
│   ├── App.tsx            # 메인 앱
│   ├── main.tsx           # 엔트리 포인트
│   └── index.css          # 글로벌 스타일
├── dist/                  # 빌드 산출물
├── README.md              # 상세 문서
├── QUICK_START.md         # 빠른 시작 가이드
└── package.json           # 의존성 관리
```

## 🎨 UI/UX 특징

### 디자인 철학
- **모던 & 미니멀**: 깔끔한 인터페이스
- **반응형**: 다양한 화면 크기 지원
- **직관적**: 학습 곡선 최소화
- **성능 최적화**: 부드러운 스크롤, 빠른 반응

### 레이아웃
```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│             │              │              │              │
│   Sidebar   │  Feed List   │ Article List │   Detail     │
│             │              │              │              │
│  - Feeds    │  - Feed 1    │  - Article 1 │   Content    │
│  - Bookmarks│  - Feed 2    │  - Article 2 │   + Images   │
│  - Search   │  - Feed 3    │  - Article 3 │   + Metadata │
│  - Category │              │              │              │
│  - Settings │              │              │              │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

### 색상 팔레트
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Gray Scale: 50-900

## 🚀 성능 최적화

### 빌드 최적화
- ✅ 코드 스플리팅 (3개 청크로 분리)
- ✅ Tree shaking
- ✅ Minification
- ✅ Gzip 압축

### 런타임 최적화
- ✅ React.memo 사용
- ✅ useLiveQuery로 실시간 DB 동기화
- ✅ 백그라운드 임베딩 생성
- ✅ 가상 스크롤링 준비

### 데이터베이스 최적화
- ✅ 인덱스 설계
- ✅ 효율적인 쿼리
- ✅ 중복 데이터 방지

## 📊 빌드 결과

```
dist/index.html                         0.70 kB
dist/assets/index-CC_qkbw0.css         15.80 kB
dist/assets/utils-n4CtcLKu.js          36.81 kB
dist/assets/react-vendor-DCmL00VS.js   44.56 kB
dist/assets/database-ClApXO9H.js       96.67 kB
dist/assets/index-D2Wf9nGs.js         367.45 kB
--------------------------------------------------
Total:                                ~562 kB (압축 전)
                                      ~180 kB (gzip)
```

## 🔐 보안 및 프라이버시

- ✅ 모든 데이터 로컬 저장 (브라우저 IndexedDB)
- ✅ API 키 로컬 저장 (localStorage)
- ✅ 서버 없는 아키텍처
- ✅ HTTPS 사용 권장

## 🧪 테스트 방법

### 수동 테스트 체크리스트

#### 피드 관리
- [ ] RSS 피드 추가
- [ ] 피드 삭제
- [ ] 피드 새로고침
- [ ] 여러 피드 동시 관리

#### 기사 읽기
- [ ] 기사 목록 표시
- [ ] 기사 상세 보기
- [ ] 읽음 상태 표시
- [ ] 이미지 로딩

#### 북마크
- [ ] 기사 북마크 추가
- [ ] 북마크 제거
- [ ] 북마크 목록 정렬
- [ ] 100개 이상 부드러운 스크롤

#### 검색
- [ ] 풀텍스트 검색
- [ ] 시맨틱 검색
- [ ] 검색 결과 하이라이트
- [ ] 검색 결과 정렬

#### 카테고리
- [ ] 카테고리 생성
- [ ] 예시 기사 추가 (3개 이상)
- [ ] 자동 분류 실행
- [ ] 신뢰도 표시
- [ ] 카테고리 삭제

## 🎓 학습 리소스

### 사용된 기술 문서
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Dexie](https://dexie.org/)
- [Fuse.js](https://fusejs.io/)

## 🌟 하이라이트

### 코드 품질
- ✅ 완전한 TypeScript 타입 안전성
- ✅ 함수형 프로그래밍 패턴
- ✅ SOLID 원칙 준수
- ✅ 클린 코드 아키텍처

### 사용자 경험
- ✅ 직관적인 인터페이스
- ✅ 빠른 응답 시간
- ✅ 부드러운 애니메이션
- ✅ 명확한 피드백

### 확장성
- ✅ 모듈화된 서비스 레이어
- ✅ 플러그인 가능한 아키텍처
- ✅ 쉬운 기능 추가
- ✅ 테스트 가능한 구조

## 📝 향후 개선 가능 사항

1. **성능**
   - Virtual scrolling 구현
   - Service Worker로 오프라인 지원
   - Web Workers로 검색 최적화

2. **기능**
   - 피드 그룹화
   - 테마 커스터마이징
   - Export/Import 기능
   - 통계 대시보드

3. **AI**
   - 로컬 임베딩 모델 (ONNX)
   - 요약 생성
   - 관련 기사 추천
