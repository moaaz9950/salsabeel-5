import React, { useState, useEffect } from 'react';
import { fetchSurah, fetchReciters, fetchReciterSurahForEdition, filterRecitersByEdition } from '../lib/api';
import { Surah, QuranVerse, Reciter } from '../lib/types';
import { ChevronLeft, Bookmark, Play, Volume2, Copy, Share2, Info, Languages, Pause, Download, CheckCircle } from 'lucide-react';
import TafsirView from './TafsirView';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { saveSurah, getSurah, saveRecitation, getRecitation } from '../lib/storage';
import { QURAN_EDITIONS } from '../lib/api';

interface SurahViewProps {
  surahNumber: number;
  initialVerse?: number;
  onBack: () => void;
}

export default function SurahView({ surahNumber, initialVerse = 1, onBack }: SurahViewProps) {
  const { theme } = useTheme();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVerse, setActiveVerse] = useState<number>(initialVerse);
  const [showTafsir, setShowTafsir] = useState(false);
  const [bookmarks, setBookmarks] = useState<{surah: number, verse: number}[]>(() => {
    const saved = localStorage.getItem('quranBookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Get the selected edition from localStorage or default to 'hafs'
  const [selectedEdition, setSelectedEdition] = useState(() => {
    return localStorage.getItem('selectedQuranEdition') || 'hafs';
  });

  // Audio related states
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [filteredReciters, setFilteredReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioVerse, setCurrentAudioVerse] = useState<number | null>(null);
  const [isPlayingFullSurah, setIsPlayingFullSurah] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadSurah();
    loadReciters();
    checkDownloadStatus();
  }, [surahNumber, selectedEdition]);

  useEffect(() => {
    // Filter reciters when edition changes
    if (reciters.length > 0) {
      const filtered = filterRecitersByEdition(reciters, selectedEdition);
      setFilteredReciters(filtered);
      
      // Reset selected reciter if it's not compatible with current edition
      if (selectedReciter && !filtered.find(r => r.id === selectedReciter.id)) {
        setSelectedReciter(filtered.length > 0 ? filtered[0] : null);
      } else if (!selectedReciter && filtered.length > 0) {
        setSelectedReciter(filtered[0]);
      }
    }
  }, [reciters, selectedEdition]);
  async function checkDownloadStatus() {
    const downloaded = await getSurah(surahNumber);
    setIsDownloaded(!!downloaded);
  }

  async function handleDownload() {
    if (isDownloaded || !surah) return;

    try {
      setIsDownloading(true);
      
      await saveSurah(surah);
      
      if (selectedReciter) {
        const audioResponse = await fetchReciterSurahForEdition(selectedReciter.id, surahNumber, selectedEdition);
        if (audioResponse && audioResponse.audio_files) {
          await saveRecitation(
            surahNumber,
            selectedReciter.id,
            audioResponse.audio_files[0].audio_url
          );
        }
      }
      
      setIsDownloaded(true);
    } catch (error) {
      console.error('Error downloading surah:', error);
    } finally {
      setIsDownloading(false);
    }
  }

  async function loadReciters() {
    try {
      const recitersList = await fetchReciters();
      setReciters(recitersList);
      
      // Filter will be applied in useEffect
    } catch (error) {
      console.error('Error loading reciters:', error);
    }
  }

  async function loadSurah() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchSurah(surahNumber, selectedEdition);
      
      if (response && response.code === 200 && response.data) {
        setSurah(response.data);
      } else if (retryCount < maxRetries) {
        const timeout = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadSurah();
        }, timeout);
      } else {
        setError('Failed to load surah. Please check your internet connection and try again.');
      }
    } catch (err) {
      console.error('Failed to fetch surah:', err);
      if (retryCount < maxRetries) {
        const timeout = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadSurah();
        }, timeout);
      } else {
        setError('Failed to load surah. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleRetry = () => {
    setRetryCount(0);
    loadSurah();
  };

  const toggleBookmark = (verse: number) => {
    setBookmarks(prev => {
      const existingBookmark = prev.find(b => b.surah === surahNumber && b.verse === verse);
      
      if (existingBookmark) {
        const newBookmarks = prev.filter(b => !(b.surah === surahNumber && b.verse === verse));
        localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
        return newBookmarks;
      } else {
        const newBookmarks = [...prev, { surah: surahNumber, verse }];
        localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
        return newBookmarks;
      }
    });
  };

  const isBookmarked = (verse: number) => {
    return bookmarks.some(b => b.surah === surahNumber && b.verse === verse);
  };

  const handleCopyVerse = (verse: QuranVerse) => {
    const textToCopy = `${verse.text}\n\n${verse.translation || ''}\n\n(Surah ${surah?.englishName}, Verse ${verse.number})`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert('Verse copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy verse:', err);
      });
  };

  const handleShareVerse = (verse: QuranVerse) => {
    if (navigator.share) {
      navigator.share({
        title: `Surah ${surah?.englishName} (${verse.number})`,
        text: `${verse.text}\n\n${verse.translation || ''}\n\n(Surah ${surah?.englishName}, Verse ${verse.number})`,
        url: `https://quran.com/${surahNumber}/${verse.number}`,
      })
      .catch(err => {
        console.error('Failed to share verse:', err);
      });
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  const handlePlayFullSurah = async () => {
    if (!selectedReciter) return;

    try {
      if (isPlayingFullSurah) {
        setIsPlaying(!isPlaying);
        return;
      }

      setCurrentAudioVerse(null);

      const audioResponse = await fetchReciterSurahForEdition(selectedReciter.id, surahNumber, selectedEdition);
      if (audioResponse && audioResponse.audio_files) {
        setAudioUrl(audioResponse.audio_files[0].audio_url);
        setIsPlayingFullSurah(true);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error loading full surah audio:', error);
    }
  };

  const handlePlayVerse = async (verse: number) => {
    if (!selectedReciter) return;

    try {
      if (isPlayingFullSurah) {
        setIsPlayingFullSurah(false);
        setAudioUrl(null);
      }

      if (currentAudioVerse === verse && audioUrl) {
        setIsPlaying(!isPlaying);
        return;
      }

      const audioResponse = await fetchReciterSurahForEdition(selectedReciter.id, surahNumber, selectedEdition);
      if (audioResponse && audioResponse.audio_files) {
        // For now, play the full surah audio since verse-specific audio might not be available
        setAudioUrl(audioResponse.audio_files[0].audio_url);
        setCurrentAudioVerse(verse);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error loading verse audio:', error);
    }
  };

  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 rounded-lg shadow-lg",
      theme === 'ramadan' ? 'bg-amber-50 dark:bg-amber-900/20' : ''
    )}>
      <div className={cn(
        "p-6 border-b",
        theme === 'dark' ? 'border-slate-700' : 
        theme === 'ramadan' ? 'border-amber-200' : 
        'border-slate-200'
      )}>
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">Surah {surah?.englishName}</h2>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-arabic text-3xl mb-2">{surah?.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                {surah?.revelationType}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                {QURAN_EDITIONS[selectedEdition]?.arabicName} • {QURAN_EDITIONS[selectedEdition]?.name}
              </span>
              <span>{surah?.verses?.length || 0} verses</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedEdition}
              onChange={(e) => {
                const newEdition = e.target.value;
                setSelectedEdition(newEdition);
                localStorage.setItem('selectedQuranEdition', newEdition);
              }}
              className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 border-none"
            >
              {Object.entries(QURAN_EDITIONS).map(([key, edition]) => (
                <option key={key} value={key}>
                  {edition.arabicName} • {edition.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleDownload}
              disabled={isDownloaded || isDownloading}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                isDownloaded
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              {isDownloaded ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Downloaded
                </>
              ) : isDownloading ? (
                <>
                  <Download className="w-4 h-4 animate-bounce" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>

            <button
              onClick={handlePlayFullSurah}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                isPlayingFullSurah 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              {isPlayingFullSurah && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              Play Full Surah
            </button>

            <select
              value={selectedReciter?.id || ''}
              onChange={(e) => {
                const reciter = filteredReciters.find(r => r.id === parseInt(e.target.value));
                if (reciter) setSelectedReciter(reciter);
              }}
              className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 border-none"
            >
              <option value="" disabled>
                {filteredReciters.length === 0 
                  ? `No reciters available for ${QURAN_EDITIONS[selectedEdition]?.name || selectedEdition}`
                  : 'Select a reciter'
                }
              </option>
              {filteredReciters.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name} ({reciter.rewaya || 'Unknown'})
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                showTranslation 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              <Languages className="w-4 h-4" />
              Translation
            </button>
            
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-l-lg"
              >
                A-
              </button>
              <span className="px-2 text-sm">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-r-lg"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="p-6">
          <div className="space-y-6">
            {surah?.verses?.map((verse) => (
              <div 
                key={verse.number}
                id={`verse-${verse.number}`}
                className={`p-4 rounded-lg ${
                  activeVerse === verse.number 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
                    {verse.number}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayVerse(verse.number)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      title={currentAudioVerse === verse.number && isPlaying ? "Pause" : "Play"}
                    >
                      {currentAudioVerse === verse.number && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveVerse(verse.number);
                        setShowTafsir(true);
                      }}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Show tafsir"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleCopyVerse(verse)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Copy verse"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleShareVerse(verse)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Share verse"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => toggleBookmark(verse.number)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      title={isBookmarked(verse.number) ? "Remove bookmark" : "Add bookmark"}
                    >
                      <Bookmark 
                        className={`w-4 h-4 ${
                          isBookmarked(verse.number) ? 'text-emerald-500 fill-emerald-500' : ''
                        }`} 
                      />
                    </button>
                  </div>
                </div>
                
                <p 
                  className="font-arabic text-right leading-loose mb-3"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {verse.text}
                </p>
                
                {showTranslation && verse.translation && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {verse.translation}
                  </p>
                )}
                
                {activeVerse === verse.number && showTafsir && (
                  <div className="mt-4 pt-4 border-t dark:border-slate-700">
                    <TafsirView surah={surahNumber} verse={verse.number} inline={true} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-4">
          <AudioPlayer
            src={audioUrl}
            autoPlay
            showJumpControls={false}
            layout="horizontal"
            customControlsSection={['MAIN_CONTROLS', 'VOLUME_CONTROLS']}
            autoPlayAfterSrcChange={true}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentAudioVerse(null);
              setIsPlayingFullSurah(false);
              setAudioUrl(null);
            }}
          />
        </div>
      )}
      
      <div className={cn(
        "p-4 border-t flex justify-between items-center",
        theme === 'dark' ? 'border-slate-700' : 
        theme === 'ramadan' ? 'border-amber-200' : 
        'border-slate-200'
      )}>
        <button
          onClick={() => surahNumber > 1 && onBack()}
          className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2"
          disabled={surahNumber <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Surah
        </button>
        
        <button
          onClick={() => surahNumber < 114 && onBack()}
          className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2"
          disabled={surahNumber >= 114}
        >
          Next Surah
          <ChevronLeft className="w-4 h-4 transform rotate-180" />
        </button>
      </div>
    </div>
  );
}