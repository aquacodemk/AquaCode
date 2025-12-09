import React from 'react';
import { ClipboardList, Trophy, Calendar, BarChart2, Image, Mail } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'planner', label: 'Планер', icon: <ClipboardList size={20} />, color: 'text-cyan-600 dark:text-cyan-400' },
    { id: 'pro-plan', label: 'Про План', icon: <Trophy size={20} />, color: 'text-yellow-600 dark:text-yellow-400' },
    { id: 'calendar', label: 'Календар', icon: <Calendar size={20} />, color: 'text-green-600 dark:text-green-400' },
    { id: 'stats', label: 'Статс', icon: <BarChart2 size={20} />, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'gallery', label: 'Галерија', icon: <Image size={20} />, color: 'text-pink-600 dark:text-pink-400' },
    { id: 'contact', label: 'Контакт', icon: <Mail size={20} />, color: 'text-gray-600 dark:text-gray-400' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-2 md:space-x-8 min-w-max p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gray-100 dark:bg-gray-700 shadow-inner'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className={`${activeTab === tab.id ? tab.color : 'text-gray-400'}`}>
                {tab.icon}
              </div>
              <span className={`font-medium text-sm ${
                activeTab === tab.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-cyan-500 ml-2 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;