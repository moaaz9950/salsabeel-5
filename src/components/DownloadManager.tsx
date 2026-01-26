import React, { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { getAllDownloaded, deleteDownloaded } from '../lib/storage';
import { formatDistanceToNow } from 'date-fns';

export default function DownloadManager() {
  const [downloads, setDownloads] = useState<{
    surahs: any[];
    tafsirs: any[];
    recitations: any[];
  }>({
    surahs: [],
    tafsirs: [],
    recitations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloads();
  }, []);

  async function loadDownloads() {
    try {
      setLoading(true);
      const data = await getAllDownloaded();
      setDownloads(data);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(type: 'surah' | 'tafsir' | 'recitation', id: string | number) {
    try {
      await deleteDownloaded(type, id);
      await loadDownloads();
    } catch (error) {
      console.error('Error deleting download:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Downloaded Surahs</h3>
        {downloads.surahs.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            No surahs downloaded yet
          </p>
        ) : (
          <div className="space-y-2">
            {downloads.surahs.map((surah) => (
              <div
                key={surah.number}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{surah.englishName}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Downloaded {formatDistanceToNow(surah.downloadedAt)} ago
                  </p>
                </div>
                <button
                  onClick={() => handleDelete('surah', surah.number)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Downloaded Tafsirs</h3>
        {downloads.tafsirs.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            No tafsirs downloaded yet
          </p>
        ) : (
          <div className="space-y-2">
            {downloads.tafsirs.map((tafsir) => (
              <div
                key={tafsir.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">
                    Surah {tafsir.surah}, Verse {tafsir.verse}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {tafsir.source} • Downloaded {formatDistanceToNow(tafsir.downloadedAt)} ago
                  </p>
                </div>
                <button
                  onClick={() => handleDelete('tafsir', tafsir.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Downloaded Recitations</h3>
        {downloads.recitations.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            No recitations downloaded yet
          </p>
        ) : (
          <div className="space-y-2">
            {downloads.recitations.map((recitation) => (
              <div
                key={recitation.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">Surah {recitation.surah}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Reciter ID: {recitation.reciterId} •{' '}
                    Downloaded {formatDistanceToNow(recitation.downloadedAt)} ago
                  </p>
                </div>
                <button
                  onClick={() => handleDelete('recitation', recitation.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}