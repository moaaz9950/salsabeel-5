import React, { useState, useEffect } from 'react';
import { Book, Search, Bookmark, Copy, Share2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';
import { COLLECTION_CONFIGS } from '../../data/hadith';

interface HadithCollection {
  id: string;
  name: string;
  arabicName: string;
  data: any;
}

export default function HadithViewer() {
  const { theme } = useTheme();
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<HadithCollection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArabic, setShowArabic] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('hadithBookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [loading, setLoading] = useState(true);

  // تحميل جميع مجموعات الأحاديث
  useEffect(() => {
    const loadAllCollections = async () => {
      try {
        const loadedCollections = await Promise.all(
          COLLECTION_CONFIGS.map(async (config) => {
            const data = await config.loadData();
            return {
              id: config.id,
              name: config.name,
              arabicName: config.arabicName,
              data
            };
          })
        );
        
        setCollections(loadedCollections);
        setSelectedCollection(loadedCollections[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading hadith collections:', error);
        setLoading(false);
      }
    };

    loadAllCollections();
  }, []);

  // حفظ الإشارات المرجعية
  useEffect(() => {
    localStorage.setItem('hadithBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (hadithId: string) => {
    setBookmarks(prev => {
      if (prev.includes(hadithId)) {
        return prev.filter(id => id !== hadithId);
      }
      return [...prev, hadithId];
    });
  };

  const handleCopyHadith = (hadith: any) => {
    if (!selectedCollection) return;
    const text = `${hadith.arabic_text}\n\n${hadith.english_text}\n\n[${selectedCollection.name} ${hadith.local_num}]`;
    navigator.clipboard.writeText(text)
      .then(() => alert('تم نسخ الحديث إلى الحافظة'))
      .catch(err => console.error('Failed to copy hadith:', err));
  };

  const handleShareHadith = (hadith: any) => {
    if (!selectedCollection) return;
    if (navigator.share) {
      navigator.share({
        title: `${selectedCollection.name} ${hadith.local_num}`,
        text: `${hadith.english_text}\n\n${hadith.arabic_text}`,
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      handleCopyHadith(hadith);
    }
  };

  const filterHadith = (hadith: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (!searchTerm || 
        hadith.english_text?.toLowerCase().includes(searchLower) ||
        hadith.arabic_text?.includes(searchTerm) ||
        hadith.narrator?.toLowerCase().includes(searchLower))
    );
  };

  const getFilteredHadith = () => {
    if (!selectedCollection) return [];
    const allHadith = selectedCollection.data.all_books.flatMap((book: any) =>
      book.hadith_list?.map((hadith: any) => ({
        ...hadith,
        book: book.english_title
      })) || []
    );

    const filtered = allHadith.filter(filterHadith);

    switch (view) {
      case 'today':
        return filtered.slice(0, 5);
      case 'week':
        return filtered.slice(0, 35);
      case 'month':
        return filtered.slice(0, 150);
      default:
        return filtered;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="ml-3">جاري تحميل الأحاديث...</p>
        </div>
      </div>
    );
  }

  if (!selectedCollection) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <p>لا توجد أحاديث متاحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6",
      theme === 'ramadan' ? 'bg-amber-50' : ''
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-emerald-500" />
          <h2 className="text-2xl font-bold">كتب الحديث</h2>
        </div>

        <div className="flex gap-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 border-none"
          >
            <option value="today">حديث اليوم</option>
            <option value="week">آخر 7 أيام</option>
            <option value="month">آخر 30 يوم</option>
            <option value="all">كل الأحاديث</option>
          </select>
        </div>
      </div>

      {/* اختيار كتاب الحديث */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setSelectedCollection(collection)}
              className={cn(
                "p-3 rounded-lg text-center transition-colors",
                selectedCollection.id === collection.id
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              )}
            >
              <p className="font-arabic text-lg mb-1">{collection.arabicName}</p>
              <p className="text-xs">{collection.name}</p>
            </button>
          ))}
        </div>

        {/* البحث والتصفية */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث في الأحاديث بالنص أو الراوي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowArabic(!showArabic)}
              className={cn(
                "px-3 py-2 rounded-lg flex items-center gap-1",
                showArabic ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-700"
              )}
            >
              العربية
            </button>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={cn(
                "px-3 py-2 rounded-lg flex items-center gap-1",
                showTranslation ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-700"
              )}
            >
              الترجمة
            </button>
          </div>
        </div>
      </div>

      {/* معلومات الكتاب */}
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
        <h3 className="font-semibold mb-2">{selectedCollection.name}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {selectedCollection.data.short_desc}
        </p>
        <div className="mt-2 flex gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>{selectedCollection.data.num_books} كتاب</span>
          <span>{selectedCollection.data.num_hadiths} حديث</span>
        </div>
      </div>

      {/* قائمة الأحاديث */}
      <div className="space-y-6">
        {getFilteredHadith().map((hadith: any) => (
          <div
            key={hadith.uuid}
            className={cn(
              "p-4 rounded-lg transition-colors",
              "bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
                  {hadith.local_num}
                </span>
                {hadith.book && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {hadith.book}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyHadith(hadith)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                  title="نسخ الحديث"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShareHadith(hadith)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                  title="مشاركة الحديث"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleBookmark(hadith.uuid)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                  title={bookmarks.includes(hadith.uuid) ? "إزالة الإشارة" : "إضافة إشارة"}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      bookmarks.includes(hadith.uuid) ? 'text-emerald-500 fill-emerald-500' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {hadith.narrator && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {hadith.narrator}
              </p>
            )}

            {showArabic && (
              <p className="font-arabic text-xl leading-loose text-right mb-4" dir="rtl">
                {hadith.arabic_text}
              </p>
            )}

            {showTranslation && (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {hadith.english_text}
              </p>
            )}

            {hadith.grade && (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                الدرجة: {hadith.grade}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}