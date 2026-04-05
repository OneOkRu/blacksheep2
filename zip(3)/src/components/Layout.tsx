import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { cn } from '../lib/utils';
import { Trophy, Swords, Medal, History, Settings, User } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useData();
  const location = useLocation();

  if (!data) return <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">Loading...</div>;

  const tabs = [
    { id: 'overall', name: 'Overall', path: '/', icon: Trophy },
    { id: 'elo', name: 'ELO Rating', path: '/elo', icon: Swords },
    { id: 'tournaments', name: 'Tournaments', path: '/tournaments', icon: Medal },
    { id: 'tiers', name: 'Tiers', path: '/tiers', icon: User },
    { id: 'archive', name: 'Archive', path: '/archive', icon: History },
  ].filter(tab => data.settings.visibleTabs.includes(tab.id));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-gray-200">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-gray-900">blacksheep</span>
            <span className="text-gray-600">rating</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-gray-900 flex items-center gap-2",
                  location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path))
                    ? "text-gray-900"
                    : "text-gray-600"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </Link>
            ))}
            <Link
              to="/admin"
              className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 ml-4"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-gray-50 z-50 flex justify-around p-2 pb-safe">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={cn(
              "flex flex-col items-center p-2 text-xs",
              location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path))
                ? "text-gray-900"
                : "text-gray-600"
            )}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            {tab.name}
          </Link>
        ))}
      </div>

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
};
