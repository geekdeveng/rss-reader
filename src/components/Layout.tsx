import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Rss, Bookmark, Search, FolderKanban, Settings } from 'lucide-react';

export const Layout: React.FC = () => {
  const navLinks = [
    { to: '/', icon: Rss, label: '피드' },
    { to: '/bookmarks', icon: Bookmark, label: '북마크' },
    { to: '/search', icon: Search, label: '검색' },
    { to: '/categories', icon: FolderKanban, label: '카테고리' },
    { to: '/settings', icon: Settings, label: '설정' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Rss className="w-6 h-6 text-blue-600" />
            RSS Reader
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            React & TypeScript로 제작
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

