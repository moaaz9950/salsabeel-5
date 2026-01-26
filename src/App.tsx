import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Moon, Sun, Radio, Book, Settings, Sparkles, Clock, Heart, Bookmark, Calendar as CalendarIcon, Calculator, ExternalLink } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { cn } from './lib/utils';
import RadioPlayer from './components/RadioPlayer';
import QuranReader from './components/QuranReader';
import AsmaAlHusna from './components/AsmaAlHusna';
import PrayerTimes from './components/PrayerTimes';
import SurahView from './components/SurahView';
import Azkar from './components/Azkar';
import Calendar from './components/Calendar';
import ZakatCalculator from './components/ZakatCalculator';

// Dynamic imports for heavy components
const TafsirView = lazy(() => import('./components/TafsirView'));
const HadithViewer = lazy(() => import('./components/Hadith/HadithViewer'));

// Loading component for dynamic imports
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
    <p className="text-emerald-600 dark:text-emerald-400 font-medium">{message}</p>
  </div>
);

// Islamic TV Channel Component
const IslamicTVChannel = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-700">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
          القنوات الإسلامية المباشرة
        </h2>
        <span className="text-sm text-emerald-600 dark:text-emerald-400">LIVE</span>
      </div>
      <p className="text-sm text-emerald-600 dark:text-emerald-400">
        Islamic TV Channels - Live Streaming
      </p>
    </div>
    
    <div className="p-8 text-center">
      <div className="mb-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-emerald-500 rounded-lg"></div>
            <div className="absolute top-2 left-2 w-8 h-6 bg-emerald-500 rounded-sm"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Watch Islamic TV Channels Live
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Access live Islamic television channels including Quran recitations, Islamic lectures, and religious programs.
        </p>
      </div>
      
      <a
        href="https://islamic-channel.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-white rounded"></div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        </div>
        <span>Open Islamic TV Channels</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Note:</p>
            <p>This will open the Islamic TV channels in a new tab for the best viewing experience.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('quran');
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  const [showSurahView, setShowSurahView] = useState(false);

  const handleSurahSelect = (surahNumber: number) => {
    setSelectedSurah(surahNumber);
    setSelectedVerse(1);
    setShowSurahView(true);
  };

  const handleBackToQuran = () => {
    setShowSurahView(false);
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      theme === 'dark' ? 'bg-slate-900 text-white' : 
      theme === 'ramadan' ? 'bg-amber-50 text-amber-900' : 
      'bg-[#f8f4e9] text-slate-900'
    )}>
      <header className={cn(
        "p-4 border-b",
        theme === 'dark' ? 'border-slate-700' : 
        theme === 'ramadan' ? 'border-amber-200' : 
        'border-slate-200'
      )}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-arabic">بِسْمِ ٱللَّٰهِ</h1>
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('quran')}
              className={cn(
                "px-4 py-2 rounded-lg", 
                activeTab === 'quran' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
            >
              <Book className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('hadith')}
              className={cn(
                "px-4 py-2 rounded-lg", 
                activeTab === 'hadith' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
            >
              <Book className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('radio')}
              className={cn(
                "px-4 py-2 rounded-lg", 
                activeTab === 'radio' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
            >
              <Radio className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2", 
                activeTab === 'tv' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
              title="Islamic TV Channels"
            >
              <div className="relative">
                <div className="w-5 h-5 border-2 border-current rounded"></div>
                <div className="absolute top-1 left-1 w-3 h-2 bg-current rounded-sm"></div>
              </div>
              {activeTab === 'tv' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
            </button>
            <button
              onClick={() => setActiveTab('azkar')}
              className={cn(
                "px-4 py-2 rounded-lg", 
                activeTab === 'azkar' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('asma')}
              className={cn(
                "px-4 py-2 rounded-lg", 
                activeTab === 'asma' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('prayer')}
              className={cn(
                "px-4 py-2 rounded-lg", 
                activeTab === 'prayer' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
            >
              <Clock className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={cn(
                "px-4 py-2 rounded-lg", 
                activeTab === 'calendar' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('zakat')}
              className={cn(
                "px-4 py-2 rounded-lg", 
                activeTab === 'zakat' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
            >
              <Calculator className="w-5 h-5" />
            </button>
            <a
              href="https://salsabel.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors", 
                theme === 'ramadan' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              )}
              title="Salsabel - Islamic Resources"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="hidden sm:inline">Salsabel</span>
            </a>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-4 py-2 rounded-lg", 
                activeTab === 'settings' ? 
                  theme === 'ramadan' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white' 
                : ''
              )}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full",
                theme === 'dark' ? 'hover:bg-slate-800' : 
                theme === 'ramadan' ? 'hover:bg-amber-100' : 
                'hover:bg-slate-200'
              )}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : 
               theme === 'ramadan' ? <Sparkles className="w-5 h-5" /> : 
               <Moon className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        {activeTab === 'quran' && (
          <>
            {showSurahView ? (
              <SurahView 
                surahNumber={selectedSurah} 
                initialVerse={selectedVerse}
                onBack={handleBackToQuran}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <QuranReader onSurahSelect={handleSurahSelect} />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'hadith' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Suspense fallback={<LoadingSpinner message="Loading Hadith Collections..." />}>
                <HadithViewer />
              </Suspense>
            </div>
          </div>
        )}

        {activeTab === 'radio' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <RadioPlayer />
            </div>
          </div>
        )}

        {activeTab === 'tv' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <IslamicTVChannel />
            </div>
          </div>
        )}
        {activeTab === 'azkar' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Azkar />
            </div>
          </div>
        )}

        {activeTab === 'asma' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <AsmaAlHusna />
            </div>
          </div>
        )}

        {activeTab === 'prayer' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <PrayerTimes />
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Calendar />
            </div>
          </div>
        )}

        {activeTab === 'zakat' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <ZakatCalculator />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className={cn(
              "rounded-lg shadow-lg p-6",
              theme === 'dark' ? 'bg-slate-800' : 
              theme === 'ramadan' ? 'bg-amber-100' : 
              'bg-white'
            )}>
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Theme</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTheme('light')}
                      className={cn(
                        "w-8 h-8 rounded-full",
                        theme === 'light' ? 'ring-2 ring-offset-2 ring-emerald-500' : '',
                        'bg-emerald-500'
                      )}
                    />
                    <button 
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "w-8 h-8 rounded-full",
                        theme === 'dark' ? 'ring-2 ring-offset-2 ring-blue-500' : '',
                        'bg-blue-500'
                      )}
                    />
                    <button 
                      onClick={() => setTheme('ramadan')}
                      className={cn(
                        "w-8 h-8 rounded-full",
                        theme === 'ramadan' ? 'ring-2 ring-offset-2 ring-amber-500' : '',
                        'bg-amber-500'
                      )}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;