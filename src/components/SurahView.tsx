import React, { useState, useEffect, useRef } from 'react';
import { 
  fetchSurah, 
  fetchReciters, 
  fetchReciterSurahForEdition, 
  filterRecitersByEdition,
  fetchVerseAudio,
  VERSE_BY_VERSE_RECITERS,
  getVerseReciterById
} from '../lib/api';
import { Surah, QuranVerse, Reciter } from '../lib/types';
import { 
  ChevronLeft, 
  Bookmark, 
  Play, 
  Copy, 
  Share2, 
  Info, 
  Languages, 
  Pause, 
  Download, 
  CheckCircle,
  SkipBack,
  SkipForward,
  Mic,
  MicOff,
  Volume2,
  ChevronDown
} from 'lucide-react';
import TafsirView from './TafsirView';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { saveSurah, getSurah } from '../lib/storage';
import { QURAN_EDITIONS } from '../lib/api';
import AudioPlayer from './AudioPlayer'; // Import the AudioPlayer component

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

  // Quran edition state
  const [selectedEdition, setSelectedEdition] = useState(() => {
    return localStorage.getItem('selectedQuranEdition') || 'hafs';
  });

  // Audio related states
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [filteredReciters, setFilteredReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioVerse, setCurrentAudioVerse] = useState<number | null>(null);
  const [isPlayingFullSurah, setIsPlayingFullSurah] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fullSurahAudioUrl, setFullSurahAudioUrl] = useState<string | null>(null);

  // Verse-by-verse states
  const [verseByVerseMode, setVerseByVerseMode] = useState(() => {
    return localStorage.getItem('verseByVerseMode') === 'true';
  });
  const [selectedVerseReciter, setSelectedVerseReciter] = useState(() => {
    return localStorage.getItem('selectedVerseReciter') || 'ar.abdulbasitmurattal';
  });
  const [verseAudios, setVerseAudios] = useState<Map<number, string>>(new Map());
  const [loadingVerseAudio, setLoadingVerseAudio] = useState<Set<number>>(new Set());
  const [audioLoading, setAudioLoading] = useState(false);
  const [autoPlayNextVerse, setAutoPlayNextVerse] = useState(() => {
    return localStorage.getItem('autoPlayNextVerse') !== 'false';
  });
  
  // Dropdown state
  const [showVerseReciterDropdown, setShowVerseReciterDropdown] = useState(false);
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioPlayerRef = useRef<any>(null);

  // Get selected verse reciter info
  const selectedVerseReciterInfo = getVerseReciterById(selectedVerseReciter);

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
      
      if (selectedReciter && !filtered.find(r => r.id === selectedReciter.id)) {
        setSelectedReciter(filtered.length > 0 ? filtered[0] : null);
      } else if (!selectedReciter && filtered.length > 0) {
        setSelectedReciter(filtered[0]);
      }
    }
  }, [reciters, selectedEdition]);

  useEffect(() => {
    // Initialize audio element for verse-by-verse
    if (verseByVerseMode) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('ended', handleAudioEnded);
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('error', handleAudioError);
    }
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showVerseReciterDropdown) {
        setShowVerseReciterDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('play', () => setIsPlaying(true));
        audioRef.current.removeEventListener('pause', () => setIsPlaying(false));
        audioRef.current.removeEventListener('error', handleAudioError);
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showVerseReciterDropdown, verseByVerseMode]);

  async function checkDownloadStatus() {
    const downloaded = await getSurah(surahNumber);
    setIsDownloaded(!!downloaded);
  }

  async function handleDownload() {
    if (isDownloaded || !surah) return;

    try {
      setIsDownloading(true);
      
      await saveSurah(surah);
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

  // Verse-by-verse audio functions
  const loadVerseAudio = async (verseNumber: number) => {
    if (!verseByVerseMode) return null;
    
    // Check if already loaded
    if (verseAudios.has(verseNumber)) {
      return verseAudios.get(verseNumber)!;
    }
    
    // Set loading state
    setLoadingVerseAudio(prev => new Set(prev).add(verseNumber));
    
    try {
      const audioData = await fetchVerseAudio(selectedVerseReciter, surahNumber, verseNumber);
      if (audioData && audioData.audio) {
        const audioUrl = audioData.audio;
        setVerseAudios(prev => new Map(prev).set(verseNumber, audioUrl));
        return audioUrl;
      }
    } catch (error) {
      console.error(`Error loading audio for verse ${verseNumber}:`, error);
    } finally {
      setLoadingVerseAudio(prev => {
        const newSet = new Set(prev);
        newSet.delete(verseNumber);
        return newSet;
      });
    }
    
    return null;
  };

  const playVerseByVerse = async (verseNumber: number) => {
    if (!verseByVerseMode) return;
    
    try {
      setAudioLoading(true);
      
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Stop full surah playback if active
      if (isPlayingFullSurah && audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsPlayingFullSurah(false);
      }
      
      setCurrentAudioVerse(verseNumber);
      setIsPlaying(false);
      
      // Load or get cached audio
      let audioUrl = verseAudios.get(verseNumber);
      if (!audioUrl) {
        audioUrl = await loadVerseAudio(verseNumber);
      }
      
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing audio:', error);
            setAudioLoading(false);
          });
        }
      }
    } catch (error) {
      console.error('Error playing verse:', error);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleAudioEnded = () => {
    if (verseByVerseMode && autoPlayNextVerse && surah && currentAudioVerse) {
      const nextVerse = currentAudioVerse + 1;
      if (nextVerse <= surah.verses.length) {
        setTimeout(() => {
          playVerseByVerse(nextVerse);
          // Scroll to next verse
          const element = document.getElementById(`verse-${nextVerse}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    } else {
      setIsPlaying(false);
      setCurrentAudioVerse(null);
    }
  };

  const handleAudioError = () => {
    setAudioLoading(false);
    setIsPlaying(false);
    console.error('Audio playback error');
  };

  const playPreviousVerse = () => {
    if (verseByVerseMode && currentAudioVerse && currentAudioVerse > 1) {
      playVerseByVerse(currentAudioVerse - 1);
    }
  };

  const playNextVerse = () => {
    if (verseByVerseMode && surah && currentAudioVerse && currentAudioVerse < surah.verses.length) {
      playVerseByVerse(currentAudioVerse + 1);
    }
  };

  const toggleVerseByVerseMode = () => {
    const newMode = !verseByVerseMode;
    setVerseByVerseMode(newMode);
    localStorage.setItem('verseByVerseMode', newMode.toString());
    
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    
    setIsPlaying(false);
    setCurrentAudioVerse(null);
    setIsPlayingFullSurah(false);
    setFullSurahAudioUrl(null);
    
    if (newMode) {
      // Preload first few verses when enabling
      if (surah) {
        const versesToPreload = surah.verses.slice(0, 5);
        versesToPreload.forEach(verse => {
          loadVerseAudio(verse.number);
        });
      }
    }
  };

  const handleVerseReciterSelect = (reciterId: string) => {
    setSelectedVerseReciter(reciterId);
    localStorage.setItem('selectedVerseReciter', reciterId);
    // Clear cached audios when reciter changes
    setVerseAudios(new Map());
    setShowVerseReciterDropdown(false);
    
    // Stop current playback if playing
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudioVerse(null);
    }
  };

  const toggleAutoPlayNextVerse = () => {
    const newValue = !autoPlayNextVerse;
    setAutoPlayNextVerse(newValue);
    localStorage.setItem('autoPlayNextVerse', newValue.toString());
  };

  // Full surah audio functions
  const handlePlayFullSurah = async () => {
    if (!selectedReciter) {
      alert('Please select a reciter first');
      return;
    }

    try {
      if (isPlayingFullSurah && audioPlayerRef.current) {
        // Toggle play/pause
        if (isPlaying) {
          audioPlayerRef.current.pause();
        } else {
          audioPlayerRef.current.play();
        }
        return;
      }

      // Stop verse-by-verse playback if active
      if (verseByVerseMode && audioRef.current && isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setCurrentAudioVerse(null);
      }

      const audioResponse = await fetchReciterSurahForEdition(selectedReciter.id, surahNumber, selectedEdition);
      if (audioResponse && audioResponse.audio_files) {
        setFullSurahAudioUrl(audioResponse.audio_files[0].audio_url);
        setIsPlayingFullSurah(true);
        
        // Auto-play the audio after a short delay
        setTimeout(() => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.play();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading full surah audio:', error);
      alert('Failed to load audio. Please try again.');
    }
  };

  const handlePlayVerse = async (verse: number) => {
    if (verseByVerseMode) {
      // If in verse-by-verse mode, use that
      playVerseByVerse(verse);
      return;
    }

    if (!selectedReciter) {
      alert('Please select a reciter first');
      return;
    }

    try {
      // Stop full surah playback if active
      if (isPlayingFullSurah && audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsPlayingFullSurah(false);
      }

      // For non-verse-by-verse mode, just play from beginning
      const audioResponse = await fetchReciterSurahForEdition(selectedReciter.id, surahNumber, selectedEdition);
      if (audioResponse && audioResponse.audio_files) {
        setFullSurahAudioUrl(audioResponse.audio_files[0].audio_url);
        setCurrentAudioVerse(verse);
        setIsPlayingFullSurah(true);
        
        // Auto-play the audio
        setTimeout(() => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.play();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading verse audio:', error);
      alert('Failed to load audio. Please try again.');
    }
  };

  const handleFullSurahPlay = () => {
    setIsPlaying(true);
  };

  const handleFullSurahPause = () => {
    setIsPlaying(false);
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
            {/* Verse-by-verse mode toggle */}
            <button
              onClick={toggleVerseByVerseMode}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                verseByVerseMode 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {verseByVerseMode ? (
                <>
                  <Mic className="w-4 h-4" />
                  Verse Mode
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4" />
                  Verse Mode
                </>
              )}
            </button>

            {/* Verse-by-verse reciter dropdown */}
            {verseByVerseMode && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVerseReciterDropdown(!showVerseReciterDropdown);
                  }}
                  className="px-4 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="truncate max-w-[120px]">
                    {selectedVerseReciterInfo?.name.split(' ')[0] || selectedVerseReciterInfo?.englishName.split(' ')[0] || 'Select Reciter'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showVerseReciterDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showVerseReciterDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Select Verse Reciter
                      </div>
                      
                      {VERSE_BY_VERSE_RECITERS.map((reciter) => (
                        <button
                          key={reciter.id}
                          onClick={() => handleVerseReciterSelect(reciter.id)}
                          className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                            selectedVerseReciter === reciter.id 
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                              : ''
                          }`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <Volume2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {reciter.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {reciter.englishName}
                            </div>
                          </div>
                          {selectedVerseReciter === reciter.id && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auto-play next verse toggle */}
            {verseByVerseMode && (
              <button
                onClick={toggleAutoPlayNextVerse}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  autoPlayNextVerse 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50' 
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title={autoPlayNextVerse ? 'Auto-play next verse enabled' : 'Auto-play next verse disabled'}
              >
                <div className={`w-3 h-3 rounded-full ${autoPlayNextVerse ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                <span>Auto</span>
              </button>
            )}

            {/* Current verse reciter info badge */}
            {verseByVerseMode && selectedVerseReciterInfo && (
              <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    {selectedVerseReciterInfo.style}
                  </span>
                </div>
              </div>
            )}

            <select
              value={selectedEdition}
              onChange={(e) => {
                const newEdition = e.target.value;
                setSelectedEdition(newEdition);
                localStorage.setItem('selectedQuranEdition', newEdition);
              }}
              className="px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                isDownloaded
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
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
              disabled={!selectedReciter}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                isPlayingFullSurah 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50' 
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isPlayingFullSurah && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              Full Surah
            </button>

            <select
              value={selectedReciter?.id || ''}
              onChange={(e) => {
                const reciter = filteredReciters.find(r => r.id === parseInt(e.target.value));
                if (reciter) setSelectedReciter(reciter);
              }}
              className="px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              disabled={verseByVerseMode}
            >
              <option value="" disabled>
                {filteredReciters.length === 0 
                  ? `No reciters available for ${QURAN_EDITIONS[selectedEdition]?.name || selectedEdition}`
                  : 'Full Surah Reciter'
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
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                showTranslation 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50' 
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Languages className="w-4 h-4" />
              Translation
            </button>
            
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-l-lg transition-colors"
              >
                A-
              </button>
              <span className="px-2 text-sm min-w-[45px] text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-r-lg transition-colors"
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

      {/* Audio Player for Full Surah */}
      {isPlayingFullSurah && fullSurahAudioUrl && selectedReciter && (
        <div className="mx-6 mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Volume2 className="w-5 h-5 text-emerald-500" />
            <div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                Now Playing: Full Surah
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {selectedReciter.name} • {selectedReciter.rewaya || 'Unknown'}
              </div>
            </div>
          </div>
          <AudioPlayer
            ref={audioPlayerRef}
            reciterId={selectedReciter.id}
            surahNumber={surahNumber}
            audioUrl={fullSurahAudioUrl}
            onPlay={handleFullSurahPlay}
            onPause={handleFullSurahPause}
            onError={(error) => {
              console.error('Audio player error:', error);
              setIsPlayingFullSurah(false);
              setIsPlaying(false);
              setFullSurahAudioUrl(null);
              alert('Failed to play audio. Please try again.');
            }}
          />
        </div>
      )}

      {/* Verse-by-verse playback controls */}
      {verseByVerseMode && currentAudioVerse && (
        <div className="mx-6 mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Now Playing:
                </span>
                <span className="font-arabic text-lg font-bold">
                  Verse {currentAudioVerse}
                </span>
              </div>
              {audioLoading && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
                  Loading...
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={playPreviousVerse}
                disabled={!currentAudioVerse || currentAudioVerse <= 1 || audioLoading}
                className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous verse"
              >
                <SkipBack className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
              
              <button
                onClick={() => {
                  if (isPlaying && audioRef.current) {
                    audioRef.current.pause();
                  } else if (currentAudioVerse && audioRef.current) {
                    const playPromise = audioRef.current.play();
                    if (playPromise !== undefined) {
                      playPromise.catch(console.error);
                    }
                  }
                }}
                disabled={audioLoading}
                className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={playNextVerse}
                disabled={!surah || !currentAudioVerse || currentAudioVerse >= surah.verses.length || audioLoading}
                className="p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next verse"
              >
                <SkipForward className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 h-2 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: audioRef.current && audioRef.current.duration > 0
                    ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%` 
                    : '0%'
                }}
              />
            </div>
            
            <div className="text-xs text-emerald-600 dark:text-emerald-400 min-w-[70px] text-right">
              {audioRef.current && audioRef.current.duration > 0
                ? `${Math.floor(audioRef.current.currentTime || 0)}s / ${Math.floor(audioRef.current.duration || 0)}s`
                : '--:-- / --:--'
              }
            </div>
          </div>
          
          {/* Current reciter info */}
          {selectedVerseReciterInfo && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <Volume2 className="w-3 h-3" />
              <span className="truncate">
                {selectedVerseReciterInfo.englishName}
              </span>
            </div>
          )}
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
                className={`p-4 rounded-lg transition-all duration-200 ${
                  activeVerse === verse.number 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                } ${currentAudioVerse === verse.number && verseByVerseMode ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                      {verse.number}
                    </span>
                    
                    {verseByVerseMode && loadingVerseAudio.has(verse.number) && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></div>
                        Loading audio...
                      </div>
                    )}
                    
                    {verseByVerseMode && verseAudios.has(verse.number) && (
                      <div className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Audio ready
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {verseByVerseMode ? (
                      <button
                        onClick={() => playVerseByVerse(verse.number)}
                        disabled={loadingVerseAudio.has(verse.number)}
                        className={`p-2 rounded-full transition-colors ${
                          currentAudioVerse === verse.number && isPlaying 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-900/50' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={currentAudioVerse === verse.number && isPlaying ? "Pause verse" : "Play verse"}
                      >
                        {currentAudioVerse === verse.number && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlayVerse(verse.number)}
                        disabled={!selectedReciter}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={currentAudioVerse === verse.number && isPlaying ? "Pause" : "Play"}
                      >
                        {currentAudioVerse === verse.number && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveVerse(verse.number);
                        setShowTafsir(true);
                      }}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Show tafsir"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleCopyVerse(verse)}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Copy verse"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleShareVerse(verse)}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Share verse"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => toggleBookmark(verse.number)}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title={isBookmarked(verse.number) ? "Remove bookmark" : "Add bookmark"}
                    >
                      <Bookmark 
                        className={`w-4 h-4 transition-colors ${
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
      
      <div className={cn(
        "p-4 border-t flex justify-between items-center",
        theme === 'dark' ? 'border-slate-700' : 
        theme === 'ramadan' ? 'border-amber-200' : 
        'border-slate-200'
      )}>
        <button
          onClick={() => surahNumber > 1 && onBack()}
          className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2 transition-colors"
          disabled={surahNumber <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Surah
        </button>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          {verseByVerseMode && selectedVerseReciterInfo && (
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
              {selectedVerseReciterInfo.name}
            </span>
          )}
          <span>Surah {surahNumber} of 114</span>
        </div>
        
        <button
          onClick={() => surahNumber < 114 && onBack()}
          className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2 transition-colors"
          disabled={surahNumber >= 114}
        >
          Next Surah
          <ChevronLeft className="w-4 h-4 transform rotate-180" />
        </button>
      </div>
    </div>
  );
}