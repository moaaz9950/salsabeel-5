import React, { useState, useEffect } from 'react';
import { fetchSurah } from '../lib/api';
import { Surah, QuranVerse } from '../lib/types';
import { Book, Bookmark, ChevronLeft, ChevronRight, Info, Search, Filter, List, Languages } from 'lucide-react';
import { QURAN_EDITIONS } from '../lib/api';

// Complete list of Surahs
const SURAHS_LIST = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", versesCount: 7, type: "Meccan" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", versesCount: 286, type: "Medinan" },
  { number: 3, name: "آل عمران", englishName: "Ali 'Imran", versesCount: 200, type: "Medinan" },
  { number: 4, name: "النساء", englishName: "An-Nisa", versesCount: 176, type: "Medinan" },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", versesCount: 120, type: "Medinan" },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", versesCount: 165, type: "Meccan" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", versesCount: 206, type: "Meccan" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", versesCount: 75, type: "Medinan" },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", versesCount: 129, type: "Medinan" },
  { number: 10, name: "يونس", englishName: "Yunus", versesCount: 109, type: "Meccan" },
  { number: 11, name: "هود", englishName: "Hud", versesCount: 123, type: "Meccan" },
  { number: 12, name: "يوسف", englishName: "Yusuf", versesCount: 111, type: "Meccan" },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", versesCount: 43, type: "Medinan" },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", versesCount: 52, type: "Meccan" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", versesCount: 99, type: "Meccan" },
  { number: 16, name: "النحل", englishName: "An-Nahl", versesCount: 128, type: "Meccan" },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", versesCount: 111, type: "Meccan" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", versesCount: 110, type: "Meccan" },
  { number: 19, name: "مريم", englishName: "Maryam", versesCount: 98, type: "Meccan" },
  { number: 20, name: "طه", englishName: "Ta-Ha", versesCount: 135, type: "Meccan" },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya", versesCount: 112, type: "Meccan" },
  { number: 22, name: "الحج", englishName: "Al-Hajj", versesCount: 78, type: "Medinan" },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", versesCount: 118, type: "Meccan" },
  { number: 24, name: "النور", englishName: "An-Nur", versesCount: 64, type: "Medinan" },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", versesCount: 77, type: "Meccan" },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", versesCount: 227, type: "Meccan" },
  { number: 27, name: "النمل", englishName: "An-Naml", versesCount: 93, type: "Meccan" },
  { number: 28, name: "القصص", englishName: "Al-Qasas", versesCount: 88, type: "Meccan" },
  { number: 29, name: "العنكبوت", englishName: "Al-'Ankabut", versesCount: 69, type: "Meccan" },
  { number: 30, name: "الروم", englishName: "Ar-Rum", versesCount: 60, type: "Meccan" },
  { number: 31, name: "لقمان", englishName: "Luqman", versesCount: 34, type: "Meccan" },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", versesCount: 30, type: "Meccan" },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", versesCount: 73, type: "Medinan" },
  { number: 34, name: "سبإ", englishName: "Saba", versesCount: 54, type: "Meccan" },
  { number: 35, name: "فاطر", englishName: "Fatir", versesCount: 45, type: "Meccan" },
  { number: 36, name: "يس", englishName: "Ya-Sin", versesCount: 83, type: "Meccan" },
  { number: 37, name: "الصافات", englishName: "As-Saffat", versesCount: 182, type: "Meccan" },
  { number: 38, name: "ص", englishName: "Sad", versesCount: 88, type: "Meccan" },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", versesCount: 75, type: "Meccan" },
  { number: 40, name: "غافر", englishName: "Ghafir", versesCount: 85, type: "Meccan" },
  { number: 41, name: "فصلت", englishName: "Fussilat", versesCount: 54, type: "Meccan" },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", versesCount: 53, type: "Meccan" },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", versesCount: 89, type: "Meccan" },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", versesCount: 59, type: "Meccan" },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", versesCount: 37, type: "Meccan" },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", versesCount: 35, type: "Meccan" },
  { number: 47, name: "محمد", englishName: "Muhammad", versesCount: 38, type: "Medinan" },
  { number: 48, name: "الفتح", englishName: "Al-Fath", versesCount: 29, type: "Medinan" },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", versesCount: 18, type: "Medinan" },
  { number: 50, name: "ق", englishName: "Qaf", versesCount: 45, type: "Meccan" },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", versesCount: 60, type: "Meccan" },
  { number: 52, name: "الطور", englishName: "At-Tur", versesCount: 49, type: "Meccan" },
  { number: 53, name: "النجم", englishName: "An-Najm", versesCount: 62, type: "Meccan" },
  { number: 54, name: "القمر", englishName: "Al-Qamar", versesCount: 55, type: "Meccan" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", versesCount: 78, type: "Medinan" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", versesCount: 96, type: "Meccan" },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", versesCount: 29, type: "Medinan" },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadilah", versesCount: 22, type: "Medinan" },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", versesCount: 24, type: "Medinan" },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", versesCount: 13, type: "Medinan" },
  { number: 61, name: "الصف", englishName: "As-Saff", versesCount: 14, type: "Medinan" },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", versesCount: 11, type: "Medinan" },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", versesCount: 11, type: "Medinan" },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", versesCount: 18, type: "Medinan" },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", versesCount: 12, type: "Medinan" },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", versesCount: 12, type: "Medinan" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", versesCount: 30, type: "Meccan" },
  { number: 68, name: "القلم", englishName: "Al-Qalam", versesCount: 52, type: "Meccan" },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", versesCount: 52, type: "Meccan" },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", versesCount: 44, type: "Meccan" },
  { number: 71, name: "نوح", englishName: "Nuh", versesCount: 28, type: "Meccan" },
  { number: 72, name: "الجن", englishName: "Al-Jinn", versesCount: 28, type: "Meccan" },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", versesCount: 20, type: "Meccan" },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", versesCount: 56, type: "Meccan" },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", versesCount: 40, type: "Meccan" },
  { number: 76, name: "الانسان", englishName: "Al-Insan", versesCount: 31, type: "Medinan" },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", versesCount: 50, type: "Meccan" },
  { number: 78, name: "النبإ", englishName: "An-Naba", versesCount: 40, type: "Meccan" },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", versesCount: 46, type: "Meccan" },
  { number: 80, name: "عبس", englishName: "Abasa", versesCount: 42, type: "Meccan" },
  { number: 81, name: "التكوير", englishName: "At-Takwir", versesCount: 29, type: "Meccan" },
  { number: 82, name: "الإنفطار", englishName: "Al-Infitar", versesCount: 19, type: "Meccan" },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", versesCount: 36, type: "Meccan" },
  { number: 84, name: "الإنشقاق", englishName: "Al-Inshiqaq", versesCount: 25, type: "Meccan" },
  { number: 85, name: "البروج", englishName: "Al-Buruj", versesCount: 22, type: "Meccan" },
  { number: 86, name: "الطارق", englishName: "At-Tariq", versesCount: 17, type: "Meccan" },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", versesCount: 19, type: "Meccan" },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", versesCount: 26, type: "Meccan" },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", versesCount: 30, type: "Meccan" },
  { number: 90, name: "البلد", englishName: "Al-Balad", versesCount: 20, type: "Meccan" },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", versesCount: 15, type: "Meccan" },
  { number: 92, name: "الليل", englishName: "Al-Layl", versesCount: 21, type: "Meccan" },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", versesCount: 11, type: "Meccan" },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", versesCount: 8, type: "Meccan" },
  { number: 95, name: "التين", englishName: "At-Tin", versesCount: 8, type: "Meccan" },
  { number: 96, name: "العلق", englishName: "Al-Alaq", versesCount: 19, type: "Meccan" },
  { number: 97, name: "القدر", englishName: "Al-Qadr", versesCount: 5, type: "Meccan" },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", versesCount: 8, type: "Medinan" },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", versesCount: 8, type: "Medinan" },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", versesCount: 11, type: "Meccan" },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", versesCount: 11, type: "Meccan" },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", versesCount: 8, type: "Meccan" },
  { number: 103, name: "العصر", englishName: "Al-Asr", versesCount: 3, type: "Meccan" },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", versesCount: 9, type: "Meccan" },
  { number: 105, name: "الفيل", englishName: "Al-Fil", versesCount: 5, type: "Meccan" },
  { number: 106, name: "قريش", englishName: "Quraysh", versesCount: 4, type: "Meccan" },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", versesCount: 7, type: "Meccan" },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", versesCount: 3, type: "Meccan" },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", versesCount: 6, type: "Meccan" },
  { number: 110, name: "النصر", englishName: "An-Nasr", versesCount: 3, type: "Medinan" },
  { number: 111, name: "المسد", englishName: "Al-Masad", versesCount: 5, type: "Meccan" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", versesCount: 4, type: "Meccan" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", versesCount: 5, type: "Meccan" },
  { number: 114, name: "الناس", englishName: "An-Nas", versesCount: 6, type: "Meccan" }
];

interface QuranReaderProps {
  onSurahSelect: (surahNumber: number) => void;
}

export default function QuranReader({ onSurahSelect }: QuranReaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [bookmarks, setBookmarks] = useState<{surah: number, verse: number}[]>(() => {
    const saved = localStorage.getItem('quranBookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedEdition, setSelectedEdition] = useState('hafs');
  const [isEditionDropdownOpen, setIsEditionDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Load saved edition from localStorage
    const savedEdition = localStorage.getItem('selectedQuranEdition');
    if (savedEdition && QURAN_EDITIONS[savedEdition]) {
      setSelectedEdition(savedEdition);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleSurahClick = async (surahNumber: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass the selected edition to the parent component
      onSurahSelect(surahNumber);
      
      // Store the selected edition in localStorage
      localStorage.setItem('selectedQuranEdition', selectedEdition);
      
    } catch (error) {
      console.error('Error loading surah:', error);
      setError('Failed to load surah. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSurahs = SURAHS_LIST.filter(surah => {
    const matchesSearch = 
      surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.name.includes(searchTerm) ||
      surah.number.toString().includes(searchTerm);
    
    const matchesType = !filterType || surah.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-emerald-500" />
          <h2 className="text-2xl font-bold">Quran Reader</h2>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700'}`}
            title="Grid View"
          >
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
            </div>
          </button>
          
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700'}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search surah by name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border-none"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <button 
                onClick={() => setFilterType(filterType === 'Meccan' ? null : 'Meccan')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                  filterType === 'Meccan' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                Meccan
              </button>
            </div>
            
            <button 
              onClick={() => setFilterType(filterType === 'Medinan' ? null : 'Medinan')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                filterType === 'Medinan' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              Medinan
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium">Quran Edition:</span>
            <div className="relative inline-block text-left flex-1">
              <button
                type="button"
                onClick={() => setIsEditionDropdownOpen(!isEditionDropdownOpen)}
                className="inline-flex justify-between w-full px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <span className="font-arabic">{QURAN_EDITIONS[selectedEdition].arabicName}</span>
                  <span className="text-slate-500">|</span>
                  <span>{QURAN_EDITIONS[selectedEdition].name}</span>
                </span>
                <ChevronLeft className={`w-4 h-4 transform transition-transform ${isEditionDropdownOpen ? 'rotate-90' : '-rotate-90'}`} />
              </button>
              
              {isEditionDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1 max-h-60 overflow-auto">
                    {Object.entries(QURAN_EDITIONS).map(([key, edition]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedEdition(key);
                          setIsEditionDropdownOpen(false);
                          localStorage.setItem('selectedQuranEdition', key);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedEdition === key 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-arabic text-lg">{edition.arabicName}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">{edition.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 ml-2">
              Current: {QURAN_EDITIONS[selectedEdition]?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Surah List/Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSurahs.map((surah) => (
            <div
              key={surah.number}
              onClick={() => handleSurahClick(surah.number)}
              className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  {surah.number}
                </span>
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  {surah.type}
                </span>
              </div>
              <h3 className="font-arabic text-xl mb-1">{surah.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{surah.englishName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{surah.versesCount} verses</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSurahs.map((surah) => (
            <div
              key={surah.number}
              onClick={() => handleSurahClick(surah.number)}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 w-8 h-8 flex items-center justify-center rounded-full">
                  {surah.number}
                </span>
                <div>
                  <h3 className="font-medium">{surah.englishName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{surah.versesCount} verses • {surah.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-arabic text-lg">{surah.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredSurahs.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No surahs found matching your search.
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {/* Bookmarks Section */}
      {bookmarks.length > 0 && (
        <div className="mt-8 border-t pt-6 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Bookmarks</h3>
          <div className="space-y-2">
            {bookmarks.map((bookmark, index) => {
              const surah = SURAHS_LIST.find(s => s.number === bookmark.surah);
              return (
                <div
                  key={index}
                  onClick={() => handleSurahClick(bookmark.surah)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h4 className="font-medium">{surah?.englishName}</h4>
                      <p className="text-xs text-slate-500">Verse {bookmark.verse}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}