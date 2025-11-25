# RSS Reader App

A modern RSS reader built with React, TypeScript and AI-assisted features.

## 🚀 Key Features

### Core Features
- **RSS feed management**: Create, add, delete, and organize RSS feeds.
- **Article reading**: Read original article content inside the app using an in-app content viewer.
- **Read/Unread status**: Track whether an article has been read or not.
- **Bookmarking system**: Save important articles to bookmarks for later reading.
- **Client-side storage**: Store all data locally using IndexedDB for offline support.

### Advanced Features
- **Full-text search**: Fast full-text search across articles.
- **Semantic search**: AI-assisted semantic search using embeddings.
- **Automatic classification**: Automatically categorize articles using ML/AI.
- **User preference-based curation**: Personalized recommendations using saved preferences.
- **Confidence-based filtering**: Filter classification results by confidence score.

## 📋 Requirements

- Node.js 18+
- npm or yarn
- Modern browser (Chrome recommended)

## 🛠️ Installation

1. Navigate to the project directory

```bash
cd <your-path>/rss-reader-app
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open the app in your browser at the shown URL (typically http://localhost:5173)

## 📦 Build

1. Create a production build

```bash
npm run build
```

2. Preview the production build

```bash
npm run preview
```

The build output will be generated in the `dist/` directory.

## 🌐 Hosting the Build

You can host the built `dist/` folder on any static file server.

### Python simple HTTP server

```bash
# serve the dist folder
cd dist

# run a simple Python 3 HTTP server
python3 -m http.server 8000

# open: http://localhost:8000
```

### Nginx

1. Install Nginx (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install nginx
```

2. Create an Nginx site config

```bash
sudo nano /etc/nginx/sites-available/rss-reader
```

3. Example config

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/rss-reader-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

4. Enable site and restart

```bash
sudo ln -s /etc/nginx/sites-available/rss-reader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Apache

1. Install Apache (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install apache2
```

2. Create site config

```bash
sudo nano /etc/apache2/sites-available/rss-reader.conf
```

3. Example config

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/rss-reader-app/dist

    <Directory /path/to/rss-reader-app/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Support for React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Enable Gzip compression
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</VirtualHost>
```

4. Enable and restart

```bash
sudo a2enmod rewrite
sudo a2ensite rss-reader.conf
sudo systemctl restart apache2
```

## 📚 How to Use

### Add a Feed

1. Go to the Feeds page (Feeds)
2. Enter the RSS feed URL into the input
3. Click the "Add Feed" button
4. The feed will be loaded and its articles displayed

Sample feeds to try:
- https://feeds.bbci.co.uk/news/rss.xml (BBC News)
- https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml (NY Times)
- https://hnrss.org/frontpage (Hacker News)

### Read an Article

1. Select a feed from the feed list
2. Click an article in the article list
3. The original article content will be displayed in the in-app viewer
4. If you want to read it externally, click the open in browser option

### Bookmarking Articles

1. Open the article you want to bookmark
2. Click the Bookmark action
3. Bookmarked articles are stored and displayed in the Bookmarks page

### Search

1. Use the Search page
2. Enter search terms
3. Choose search type:
   - Fulltext: fast keyword search
   - Semantic: AI-assisted semantic search
4. Click Search to view results

### Category Management

1. Open the Categories page
2. Create categories with names and colors
3. Assign up to three example articles per category to seed it
4. Use the "Reclassify All" action to reclassify articles
5. Confidence thresholds can be used to filter classification results

### Settings

1. Open the Settings page
2. (Optional) Add OpenAI API key for AI features
   - Get an API key: https://platform.openai.com/api-keys
   - If no API key is set, all AI features will operate in mock mode
3. Set the classification confidence thresholds
4. Other user preferences

## 🧠 AI/Embeddings

### Implementation notes
- Uses OpenAI Embeddings API for semantic features
- Stores embeddings locally and uses them for semantic search and classification
- Mock embedding flow is available for offline/dev use

## ⚙️ Implementation Details

### Project Stack
- Frontend: React 18 + TypeScript
- Build: Vite
- Styling: TailwindCSS
- Routing: React Router
- Client DB: IndexedDB (Dexie)
- RSS parsing: Browser-native DOMParser
- Search: Fuse.js (full-text search), custom embeddings + semantic search
- AI: OpenAI Embeddings API

### Project Structure

```
src/
├── components/       # Reusable UI components
│   └── Layout.tsx
├── pages/            # Page components
│   ├── FeedsPage.tsx
│   ├── BookmarksPage.tsx
│   ├── SearchPage.tsx
│   ├── CategoriesPage.tsx
│   └── SettingsPage.tsx
├── services/         # Business logic services
│   ├── rss.service.ts
│   ├── feed.service.ts
│   ├── embedding.service.ts
│   ├── classification.service.ts
│   └── search.service.ts
├── db/               # Client database configuration
│   └── database.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── App.tsx           # Main application component
└── main.tsx          # Entry point
```

### Implementation Notes

#### IndexedDB storage
All data is stored in IndexedDB to allow the app to work offline and persist feeds, metadata, categories, and embeddings.

#### CORS handling for RSS parsing
The app uses the browser DOMParser to parse RSS in the browser and relies on either:
1. RSS feeds that allow cross-origin requests
2. A CORS proxy when needed
3. Server-side fetching when available

#### Embedding / AI features
- Semantic search via embeddings for more accurate relevance
- Automatic classification to label articles
- Embeddings are stored locally; the app can operate in a mocked mode without API keys

## 🔧 Settings

### Environment variables / API keys (for AI features)

Settings allow storing an OpenAI API key via the UI or localStorage:

```javascript
localStorage.setItem('openai_api_key', 'sk-...');
```

### Classification confidence threshold

Set via Settings UI or localStorage:

```javascript
localStorage.setItem('confidence_threshold', '0.6');
```

## 🎨 UI/UX

- Responsive design: TailwindCSS-based responsive interface
- Multi-column layout: useful 3-column layout for feed/article/detail views
- Scalable bookmarking: bookmark up to 100 items per feed
- Rich article previews: thumbnails, metadata, and source information
- Accessibility: semantic HTML, adequate contrast, keyboard support

## 🐛 Known Issues

### Some feeds may not load
- Some feeds may block cross-origin requests (CORS)
- Using a CORS proxy is a workaround (self-hosted proxy recommended)
- Validate RSS feed URLs before adding

### Semantic search might not work
- Ensure an OpenAI API key is set in Settings
- If using a browser extension for blocking requests, it may block API calls
- The mock embedding flow is used if no API key is provided

### Classification may be inaccurate
- Categories should have at least three example articles
- Adjust classification confidence in settings
- Embedding generation depends on network/API availability

## 📝 Development Notes

### New features to add
1. Add more types in `src/types/index.ts`
2. Implement missing services in `src/services/`
3. Add Dexie schema migration handling in `src/db/database.ts`
4. Implement missing UI components/pages

### Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## 📄 License

This project is licensed under the MIT License.
