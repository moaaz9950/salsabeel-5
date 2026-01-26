import React, { useState, useEffect } from 'react';
import { Book, Search, Filter, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { azkarData } from '../lib/azkarData';

interface Dhikr {
  category: string;
  count: string;
  description: string;
  reference: string;
  content: string;
}

interface AzkarCategory {
  [key: string]: Dhikr[];
}

export default function Azkar() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedDhikr, setExpandedDhikr] = useState<string | null>(null);
  const [completedDhikr, setCompletedDhikr] = useState<{[key: string]: number}>({});

  // Categories with their Arabic names and icons
  const categories = [
    { id: 'أذكار الصباح', name: 'أذكار الصباح', icon: '🌅' },
    { id: 'أذكار المساء', name: 'أذكار المساء', icon: '🌄' },
    { id: 'أذكار النوم', name: 'أذكار النوم', icon: '🌙' },
    { id: 'أذكار الاستيقاظ', name: 'أذكار الاستيقاظ', icon: '⏰' },
    { id: 'أذكار بعد السلام من الصلاة المفروضة', name: 'أذكار بعد الصلاة', icon: '🕌' },
    { id: 'تسابيح', name: 'تسابيح', icon: '📿' },
    { id: 'أدعية قرآنية', name: 'أدعية قرآنية', icon: '📖' },
    { id: 'أدعية الأنبياء', name: 'أدعية الأنبياء', icon: '👳‍♂️' }
  ];

  const handleDhikrComplete = (dhikrContent: string, totalCount: number) => {
    setCompletedDhikr(prev => {
      const currentCount = (prev[dhikrContent] || 0) + 1;
      return {
        ...prev,
        [dhikrContent]: currentCount > totalCount ? 0 : currentCount
      };
    });
  };

  const resetDhikrCount = (dhikrContent: string) => {
    setCompletedDhikr(prev => ({
      ...prev,
      [dhikrContent]: 0
    }));
  };

  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6",
      theme === 'ramadan' ? 'bg-amber-50' : ''
    )}>
      <div className="flex items-center gap-2 mb-6">
        <Book className="w-5 h-5 text-emerald-500" />
        <h2 className="text-2xl font-bold">الأذكار</h2>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="البحث في الأذكار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none"
            dir="rtl"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
              className={cn(
                "p-3 rounded-lg text-right flex items-center gap-2 transition-colors",
                selectedCategory === category.id
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              )}
            >
              <span>{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dhikr List */}
      <div className="space-y-4">
        {selectedCategory && azkarData[selectedCategory]?.map((dhikr: Dhikr, index: number) => {
          if (dhikr.category === 'stop') return null;
          
          const isExpanded = expandedDhikr === `${selectedCategory}-${index}`;
          const currentCount = completedDhikr[dhikr.content] || 0;
          const totalCount = parseInt(dhikr.count) || 1;
          const progress = (currentCount / totalCount) * 100;

          return (
            <div
              key={`${selectedCategory}-${index}`}
              className={cn(
                "p-4 rounded-lg transition-colors",
                isExpanded
                  ? "bg-emerald-50 dark:bg-emerald-900/20"
                  : "bg-slate-50 dark:bg-slate-700/30"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      {dhikr.count}×
                    </span>
                    {dhikr.description && (
                      <button
                        onClick={() => setExpandedDhikr(
                          isExpanded ? null : `${selectedCategory}-${index}`
                        )}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xl font-arabic leading-relaxed text-right mb-2">
                    {dhikr.content}
                  </p>

                  {isExpanded && dhikr.description && (
                    <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-1 flex-shrink-0 text-emerald-500" />
                        <p className="text-sm text-right">{dhikr.description}</p>
                      </div>
                      {dhikr.reference && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-right">
                          {dhikr.reference}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        className="text-slate-200 dark:text-slate-700"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                        r="30"
                        cx="32"
                        cy="32"
                      />
                      <circle
                        className="text-emerald-500"
                        strokeWidth="4"
                        strokeDasharray={30 * 2 * Math.PI}
                        strokeDashoffset={30 * 2 * Math.PI * ((100 - progress) / 100)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="30"
                        cx="32"
                        cy="32"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      {currentCount}/{totalCount}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleDhikrComplete(dhikr.content, totalCount)}
                      className="px-3 py-1 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                    >
                      تم
                    </button>
                    <button
                      onClick={() => resetDhikrCount(dhikr.content)}
                      className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      إعادة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}