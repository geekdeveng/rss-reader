import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { FeedsPage } from './pages/FeedsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SearchPage } from './pages/SearchPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FeedsPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
