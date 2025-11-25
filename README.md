# RSS Reader App

React, TypeScript와 AI 기반 기능으로 구축된 현대적이고 기능이 풍부한 RSS 리더입니다.

## 🚀 주요 기능

### 핵심 기능
- **RSS 피드 관리**: RSS 피드 구독, 추가/삭제 및 자동 동기화
- **기사 읽기**: 앱 내에서 이미지를 포함한 전체 콘텐츠로 기사 읽기
- **읽음/안읽음 상태**: 읽은 기사 추적
- **북마크 시스템**: 나중에 읽을 기사를 전체 콘텐츠와 함께 저장
- **영구 저장소**: IndexedDB를 사용하여 모든 데이터를 로컬에 저장

### 고급 기능
- **전문 검색**: 하이라이트 기능이 있는 빠른 키워드 기반 검색
- **시맨틱 검색**: 임베딩을 사용한 AI 기반 의미 검색
- **자동 분류**: 머신러닝을 사용하여 기사 자동 분류
- **사용자 정의 카테고리**: 자동 라벨링을 위한 예시 기사로 카테고리 생성
- **신뢰도 기반 분류**: 신뢰도 임계값 이상의 기사만 분류

## 📋 요구사항

- Node.js 18+ 
- npm 또는 yarn
- 최신 브라우저 (Chrome 권장)

## 🛠️ 설치 방법

1. **프로젝트 디렉토리로 이동**
   ```bash
   cd <your-path>/rss-reader-app
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 서버 시작**
   ```bash
   npm run dev
   ```

4. **브라우저 열기**
   터미널에 표시된 URL로 이동 (일반적으로 http://localhost:5173)

## 📦 프로덕션 빌드

1. **프로젝트 빌드**
   ```bash
   npm run build
   ```

2. **프로덕션 빌드 미리보기**
   ```bash
   npm run preview
   ```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

## 🌐 프로덕션 호스팅

빌드된 `dist/` 폴더를 웹 서버로 호스팅할 수 있습니다:

### Python 웹 서버

```bash
# dist 폴더로 이동
cd dist

# Python 3 내장 웹 서버 실행
python3 -m http.server 8000

# 접속: http://localhost:8000
```

### Nginx

1. **Nginx 설치** (Ubuntu/Debian)
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **사이트 설정 파일 생성**
   ```bash
   sudo nano /etc/nginx/sites-available/rss-reader
   ```

3. **설정 내용 추가**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/rss-reader-app/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Gzip 압축 활성화
       gzip on;
       gzip_types text/css application/javascript application/json;
   }
   ```

4. **사이트 활성화**
   ```bash
   sudo ln -s /etc/nginx/sites-available/rss-reader /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Apache

1. **Apache 설치** (Ubuntu/Debian)
   ```bash
   sudo apt update
   sudo apt install apache2
   ```

2. **사이트 설정 파일 생성**
   ```bash
   sudo nano /etc/apache2/sites-available/rss-reader.conf
   ```

3. **설정 내용 추가**
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /path/to/rss-reader-app/dist

       <Directory /path/to/rss-reader-app/dist>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
           
           # React Router 지원
           RewriteEngine On
           RewriteBase /
           RewriteRule ^index\.html$ - [L]
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule . /index.html [L]
       </Directory>

       # Gzip 압축 활성화
       AddOutputFilterByType DEFLATE text/html text/css application/javascript
   </VirtualHost>
   ```

4. **필요한 모듈 활성화 및 사이트 활성화**
   ```bash
   sudo a2enmod rewrite
   sudo a2ensite rss-reader.conf
   sudo systemctl restart apache2
   ```

## 🎯 사용 가이드

### RSS 피드 추가하기

1. **Feeds** 페이지로 이동 (홈)
2. 입력 필드에 RSS 피드 URL 입력
3. "Add Feed" 클릭
4. 피드가 가져와지고 기사가 표시됩니다

**시도해볼 RSS 피드 예시:**
- https://feeds.bbci.co.uk/news/rss.xml (BBC News)
- https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml (NY Times)
- https://hnrss.org/frontpage (Hacker News)

### 기사 읽기

1. 왼쪽 패널에서 피드 선택
2. 중간 패널에서 기사 클릭
3. 오른쪽 패널에서 전체 내용 읽기
4. 나중에 읽으려면 북마크 아이콘 클릭

### 기사 북마크하기

1. 기사의 북마크 아이콘 클릭
2. **Bookmarks** 페이지로 이동하여 저장된 모든 기사 보기
3. 기사는 전체 콘텐츠와 함께 표시됩니다
4. 부드럽게 스크롤 (100개 이상의 항목에 최적화)

### 기사 검색하기

1. **Search** 페이지로 이동
2. 검색어 입력
3. 검색 유형 선택:
   - **Fulltext**: 하이라이트 기능이 있는 빠른 키워드 매칭
   - **Semantic**: AI 기반 의미 검색
4. "Search" 클릭하여 결과 확인

### 카테고리 관리

1. **Categories** 페이지로 이동
2. 이름과 색상으로 새 카테고리 생성
3. 카테고리에 최소 3개의 예시 기사 추가
4. "Reclassify All" 클릭하여 기사 자동 분류
5. 임계값 이상의 신뢰도를 가진 기사가 자동으로 할당됩니다

### 설정

1. **Settings** 페이지로 이동
2. (선택사항) 실제 임베딩을 위한 OpenAI API 키 추가
   - API 키 받기: https://platform.openai.com/api-keys
   - API 키 없이는 모의 임베딩이 사용됩니다
3. 분류를 위한 신뢰도 임계값 조정
4. 설정 저장

## 🏗️ 아키텍처

### 기술 스택
- **프론트엔드**: React 18 + TypeScript
- **빌드 도구**: Vite
- **스타일링**: TailwindCSS
- **라우팅**: React Router
- **데이터베이스**: IndexedDB (Dexie 사용)
- **RSS 파싱**: 브라우저 네이티브 DOMParser
- **검색**: Fuse.js (전문검색), 커스텀 임베딩 (시맨틱)
- **AI**: OpenAI Embeddings API (선택사항)

### 프로젝트 구조
```
src/
├── components/       # 재사용 가능한 UI 컴포넌트
│   └── Layout.tsx
├── pages/           # 페이지 컴포넌트
│   ├── FeedsPage.tsx
│   ├── BookmarksPage.tsx
│   ├── SearchPage.tsx
│   ├── CategoriesPage.tsx
│   └── SettingsPage.tsx
├── services/        # 비즈니스 로직
│   ├── rss.service.ts
│   ├── feed.service.ts
│   ├── embedding.service.ts
│   ├── classification.service.ts
│   └── search.service.ts
├── db/             # 데이터베이스 설정
│   └── database.ts
├── types/          # TypeScript 타입 정의
│   └── index.ts
├── App.tsx         # 메인 앱 컴포넌트
└── main.tsx        # 진입점
```

### 핵심 기술

#### IndexedDB 저장소
모든 데이터는 IndexedDB를 사용하여 브라우저에 로컬로 저장됩니다:
- 피드 및 메타데이터
- 콘텐츠 및 상태가 포함된 기사
- 카테고리 및 분류 데이터
- 시맨틱 검색을 위한 기사 임베딩

#### CORS 처리를 포함한 RSS 파싱
앱은 브라우저 네이티브 DOMParser와 자동 CORS 프록시 폴백을 사용합니다:
1. 먼저 직접 가져오기 시도
2. 필요시 CORS 프록시로 폴백
3. 여러 소스에서 이미지 추출

#### 임베딩 기반 기능
- **시맨틱 검색**: 쿼리를 임베딩으로 변환하고 유사한 기사 찾기
- **자동 분류**: 예시 기사를 사용하여 카테고리 분류기 학습
- **코사인 유사도**: 임베딩 간의 관련성 계산
- **모의 임베딩**: 개발을 위해 API 키 없이 작동

## 🔧 설정

### 환경 변수 (선택사항)

Settings 페이지에서 OpenAI API 키를 설정하거나 localStorage를 통해 설정할 수 있습니다:

```javascript
localStorage.setItem('openai_api_key', 'sk-...');
```

### 분류 임계값

Settings 페이지에서 조정하거나 localStorage를 통해 조정:

```javascript
localStorage.setItem('confidence_threshold', '0.6');
```

## 🎨 UI/UX 기능

- **모던 디자인**: TailwindCSS를 사용한 깔끔하고 전문적인 인터페이스
- **반응형 레이아웃**: 효율적인 탐색을 위한 3-패널 레이아웃
- **부드러운 스크롤**: 100개 이상의 북마크에 최적화
- **시각적 피드백**: 로딩 상태, 호버 효과, 활성 상태
- **접근성**: 시맨틱 HTML, 적절한 대비, 키보드 탐색

## 🐛 문제 해결

### RSS 피드가 로드되지 않음
- 일부 피드는 CORS 제한이 있을 수 있습니다
- CORS 프록시 사용 시도 (자동으로 시도됨)
- RSS 피드 URL이 유효한지 확인

### 시맨틱 검색이 작동하지 않음
- Settings에서 OpenAI API 키가 설정되었는지 확인
- 브라우저 콘솔에서 오류 확인
- 폴백으로 모의 임베딩이 사용됩니다

### 분류가 작동하지 않음
- 각 카테고리에 최소 3개의 예시 기사가 있는지 확인
- 신뢰도 임계값 설정 확인
- 임베딩 생성 대기 (백그라운드 프로세스)

## 📝 개발 노트

### 새 기능 추가하기
1. `src/types/index.ts`에서 타입 정의
2. `src/services/`에서 서비스 생성
3. `src/db/database.ts`에서 데이터베이스 스키마 업데이트
4. UI 컴포넌트/페이지 생성

### 테스트 실행
```bash
npm run test
```

### 린팅
```bash
npm run lint
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 오픈 소스로 제공됩니다.
