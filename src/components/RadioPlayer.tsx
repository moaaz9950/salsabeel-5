import React, { useState, useEffect } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { Radio, Heart, RefreshCw, Plus, Minus, Volume2, Languages } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import 'react-h5-audio-player/lib/styles.css';

// Define static radio stations
const STATIC_STATIONS = [
  {
    id: "cairo",
    name: "إذاعة القرآن الكريم من القاهرة",
    arabicName: "إذاعة القرآن الكريم من القاهرة",
    url: "https://n01.radiojar.com/8s5u5tpdtwzuv?rj-ttl=5&rj-tok=AAABlk3NOmAA7TG4-pYi7tp2pA",
    language: "Arabic"
  },
  {
    id: "saudi",
    name: "اذاعة القران الكريم السعودية مباشر",
    arabicName: "اذاعة القران الكريم السعودية مباشر",
    url: "https://stream.radiojar.com/4wqre23fytzuv",
    language: "Arabic"
  },
  {
    id: "sharjah",
    name: "إذاعة القرآن الكريم من الشارقة",
    arabicName: "إذاعة القرآن الكريم من الشارقة",
    url: "https://l3.itworkscdn.net/smcquranlive/quranradiolive/icecast.audio",
    language: "Arabic"
  }
];

export default function RadioPlayer() {
  const { theme } = useTheme();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStation, setCurrentStation] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteStations');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteStations', JSON.stringify(favorites));
  }, [favorites]);

  async function loadStations() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stations from new API
      const response = await fetch('https://islamic-radio.vercel.app/islamic-radio.json');
      const data = await response.json();
      
      // Process API stations
      const allStations = [...STATIC_STATIONS]; // Start with static stations
      
      if (data && Array.isArray(data)) {
        // Transform new API data to match our format
        const apiStations = data.map((station: any) => ({
          id: station.id?.toString() || station.name || Math.random().toString(),
          name: station.name || station.title || 'Unknown Station',
          arabicName: station.arabicName || station.name,
          url: station.url || station.stream_url,
          language: station.language || "Arabic"
        }));
        
        allStations.push(...apiStations);
      } else if (data && typeof data === 'object') {
        // Handle object response structure
        const stations = data.stations || data.radios || data.data || [];
        if (Array.isArray(stations)) {
          const apiStations = stations.map((station: any) => ({
            id: station.id?.toString() || station.name || Math.random().toString(),
            name: station.name || station.title || 'Unknown Station',
            arabicName: station.arabicName || station.name,
            url: station.url || station.stream_url,
            language: station.language || "Arabic"
          }));
          allStations.push(...apiStations);
        }
      }
      
      setStations(allStations);
    } catch (err) {
      console.error('Failed to fetch stations:', err);
      // Fallback to static stations if API fails
      setStations(STATIC_STATIONS);
      setError('Could not load radio stations from API. Showing default stations only.');
    } finally {
      setLoading(false);
    }
  }

  const handleStationSelect = (station: any) => {
    setCurrentStation(station);
    setIsPlaying(true);
  };

  const toggleFavorite = (stationId: string) => {
    setFavorites(prev => {
      if (prev.includes(stationId)) {
        return prev.filter(id => id !== stationId);
      } else {
        return [...prev, stationId];
      }
    });
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch = 
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.arabicName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFavorites = !showFavoritesOnly || favorites.includes(station.id);
    
    return matchesSearch && matchesFavorites;
  });

  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6",
      theme === 'ramadan' ? 'bg-amber-50' : ''
    )}>
      <div className="flex items-center gap-2 mb-6">
        <Radio className="w-5 h-5 text-emerald-500" />
        <h2 className="text-xl font-semibold">
          {language === 'ar' ? 'إذاعات القرآن الكريم' : 'Quran Radio Stations'}
        </h2>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن محطة...' : 'Search stations...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>
          
          <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="rounded text-emerald-500"
              />
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'text-red-500 fill-red-500' : ''}`} />
              <span className="text-sm">
                {language === 'ar' ? 'المفضلة' : 'Favorites'}
              </span>
            </label>

            <button
              onClick={() => setLanguage(l => l === 'en' ? 'ar' : 'en')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Languages className="w-4 h-4" />
            </button>
            
            <button
              onClick={loadStations}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Current Station Player */}
      {currentStation && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-medium">
                {language === 'ar' ? currentStation.arabicName : currentStation.name}
              </h3>
            </div>
            <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-full">
              {currentStation.language}
            </span>
          </div>
          
          <AudioPlayer
            src={currentStation.url}
            autoPlay
            showJumpControls={false}
            layout="stacked"
            customControlsSection={['MAIN_CONTROLS', 'VOLUME_CONTROLS']}
            autoPlayAfterSrcChange={true}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            volume={volume / 100}
            onVolumeChange={e => setVolume(Math.round(e.target.volume * 100))}
            className="bg-transparent"
          />
        </div>
      )}

      {/* Stations Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-2">Loading radio stations...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
          {error}
          <button 
            onClick={loadStations}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {filteredStations.length} stations available
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredStations.map((station) => (
            <div
              key={station.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                currentStation?.id === station.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
              onClick={() => handleStationSelect(station)}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium mb-1">
                    {language === 'ar' ? station.arabicName : station.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {station.language}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(station.id);
                  }}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.includes(station.id) ? 'text-red-500 fill-red-500' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
      
      {!loading && !error && filteredStations.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>No radio stations found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setShowFavoritesOnly(false);
            }}
            className="mt-2 text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Volume Controls */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setVolume(Math.max(0, volume - 10))}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
            disabled={volume === 0}
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <button
            onClick={() => setVolume(Math.min(100, volume + 10))}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
            disabled={volume === 100}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}