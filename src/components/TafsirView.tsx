import React, { useState, useEffect } from 'react';
import { Book, ChevronDown, ChevronUp, ExternalLink, Download, CheckCircle } from 'lucide-react';
import { fetchAllTafsir } from '../lib/api';
import { saveTafsir, getTafsir } from '../lib/storage';
import { TAFSIR_SOURCES } from '../lib/api';

interface TafsirViewProps {
  surah: number;
  verse: number;
  arabicTafsir?: string;
  inline?: boolean;
}

export default function TafsirView({ surah, verse, arabicTafsir = "", inline = false }: TafsirViewProps) {
  const [selectedSource, setSelectedSource] = useState('ar.muyassar');
  const [expanded, setExpanded] = useState(!inline);
  const [loading, setLoading] = useState(false);
  const [tafsirData, setTafsirData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [downloadedSources, setDownloadedSources] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    checkDownloadStatus();
  }, [surah, verse, selectedSource]);

  useEffect(() => {
    async function loadTafsir() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAllTafsir(surah, verse);
        setTafsirData(data);
        
        // Check if any tafsir source has actual content
        const hasContent = Object.values(data).some((tafsir: any) => 
          tafsir && tafsir.text && tafsir.text.trim().length > 0
        );
        
        if (!hasContent) {
          setError('No tafsir available for this verse. Please try another source.');
        }
      } catch (error) {
        console.error('Error loading tafsir:', error);
        setError('Failed to load tafsir. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadTafsir();
  }, [surah, verse]);

  async function checkDownloadStatus() {
    const downloaded: string[] = [];
    for (const source of TAFSIR_SOURCES) {
      const tafsir = await getTafsir(surah, verse, source.id);
      if (tafsir) {
        downloaded.push(source.id);
      }
    }
    setDownloadedSources(downloaded);
  }

  async function handleDownload(sourceId: string) {
    if (downloadedSources.includes(sourceId)) return;

    try {
      setIsDownloading(sourceId);
      const data = await fetchAllTafsir(surah, verse);
      if (data[sourceId]) {
        await saveTafsir(surah, verse, sourceId, data[sourceId]);
        setDownloadedSources(prev => [...prev, sourceId]);
      }
    } catch (error) {
      console.error('Error downloading tafsir:', error);
      setError('Failed to download tafsir. Please try again.');
    } finally {
      setIsDownloading(null);
    }
  }

  const renderDownloadButton = (sourceId: string) => (
    <button
      onClick={() => handleDownload(sourceId)}
      disabled={downloadedSources.includes(sourceId) || isDownloading === sourceId}
      className={`p-1.5 rounded-lg text-sm flex items-center gap-1 ${
        downloadedSources.includes(sourceId)
          ? 'text-emerald-500'
          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {downloadedSources.includes(sourceId) ? (
        <CheckCircle className="w-4 h-4" />
      ) : isDownloading === sourceId ? (
        <Download className="w-4 h-4 animate-bounce" />
      ) : (
        <Download className="w-4 h-4" />
      )}
    </button>
  );

  if (inline) {
    if (loading) {
      return <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div></div>;
    }
    
    if (error) {
      return (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm">
          {error}
        </div>
      );
    }
    
    const currentTafsirText = tafsirData[selectedSource]?.text;
    const currentSource = TAFSIR_SOURCES.find(s => s.id === selectedSource);
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-emerald-700 dark:text-emerald-300">التفسير</h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-sm p-2 rounded-lg bg-white dark:bg-slate-700 border border-emerald-200 dark:border-emerald-800"
              dir="rtl"
            >
              {TAFSIR_SOURCES.map((source) => (
                <option key={source.id} value={source.id}>{source.name}</option>
              ))}
            </select>
            {renderDownloadButton(selectedSource)}
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
          {currentTafsirText ? (
            <p className={`text-right ${
              currentSource?.language === 'ar' ? 'font-arabic text-lg' : 'text-base'
            } leading-relaxed`}>
              {currentTafsirText}
            </p>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400">
              No tafsir available for this verse from this source
            </p>
          )}
        </div>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
          Source: {currentSource?.name}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      <div 
        className="p-4 bg-emerald-50 dark:bg-emerald-900/20 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold">التفسير</h2>
        </div>
        <button className="p-1 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      
      {expanded && (
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm">
              {error}
              <button 
                onClick={() => window.location.reload()} 
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 text-right">
                      مصدر التفسير
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none text-right"
                        dir="rtl"
                      >
                        {TAFSIR_SOURCES.map((source) => (
                          <option key={source.id} value={source.id}>{source.name}</option>
                        ))}
                      </select>
                      {renderDownloadButton(selectedSource)}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-slate-500 dark:text-slate-400 text-right">
                  {TAFSIR_SOURCES.find(s => s.id === selectedSource)?.description}
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(tafsirData).map(([sourceId, data]) => {
                  const source = TAFSIR_SOURCES.find(s => s.id === sourceId);
                  return (
                    <div 
                      key={sourceId}
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        selectedSource === sourceId 
                          ? 'bg-slate-50 dark:bg-slate-700/30' 
                          : 'hidden'
                      }`}
                    >
                      <h3 className="font-medium mb-2 text-right">
                        {source?.name}:
                      </h3>
                      {data.text ? (
                        <p className={`text-right ${
                          source?.language === 'ar' ? 'font-arabic text-lg' : 'text-base'
                        } leading-relaxed`}>
                          {data.text}
                        </p>
                      ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400">
                          No tafsir available for this verse from this source
                        </p>
                      )}
                    </div>
                  );
                })}
                
                <div className="flex justify-between items-center text-sm pt-4 border-t dark:border-slate-700">
                  <a 
                    href={`https://quran.com/${surah}/${verse}/tafsirs/${selectedSource}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    اقرأ المزيد <ExternalLink className="w-3 h-3" />
                  </a>
                  
                  <span className="text-slate-500 dark:text-slate-400">
                    Source: {TAFSIR_SOURCES.find(s => s.id === selectedSource)?.name}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}