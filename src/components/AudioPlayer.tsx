import React, { useState, useEffect } from 'react';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import { Download, Trash2, CheckCircle } from 'lucide-react';
import { saveReciter, getReciterAudio, removeReciterAudio, isReciterDownloaded } from '../lib/storage';

interface AudioPlayerProps {
  reciterId: number;
  surahNumber: number;
  audioUrl: string;
  onError?: (error: Error) => void;
}

export default function AudioPlayer({ reciterId, surahNumber, audioUrl, onError }: AudioPlayerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    checkDownloadStatus();
    loadLocalAudio();
  }, [reciterId, surahNumber]);

  async function checkDownloadStatus() {
    const downloaded = await isReciterDownloaded(reciterId, surahNumber);
    setIsDownloaded(downloaded);
  }

  async function loadLocalAudio() {
    if (isDownloaded) {
      const audio = await getReciterAudio(reciterId, surahNumber);
      if (audio?.url) {
        setLocalAudioUrl(audio.url);
      }
    } else {
      setLocalAudioUrl(null);
    }
  }

  async function handleDownload() {
    if (isDownloaded || isDownloading) return;

    try {
      setIsDownloading(true);
      const success = await saveReciter(reciterId, surahNumber, audioUrl);
      if (success) {
        setIsDownloaded(true);
        await loadLocalAudio();
      } else {
        throw new Error('Failed to download audio');
      }
    } catch (error) {
      console.error('Error downloading audio:', error);
      onError?.(error as Error);
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDelete() {
    try {
      await removeReciterAudio(reciterId, surahNumber);
      setIsDownloaded(false);
      setLocalAudioUrl(null);
    } catch (error) {
      console.error('Error removing audio:', error);
      onError?.(error as Error);
    }
  }

  return (
    <div className="relative">
      <ReactH5AudioPlayer
        src={localAudioUrl || audioUrl}
        autoPlay={false}
        showJumpControls={false}
        layout="stacked"
        customControlsSection={['MAIN_CONTROLS', 'VOLUME_CONTROLS']}
        onError={(e) => {
          console.error('Audio playback error:', e);
          onError?.(new Error('Failed to play audio'));
        }}
      />
      
      <div className="absolute right-2 top-2 flex gap-2">
        {isDownloaded ? (
          <>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
              title="Remove download"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="p-1.5 text-emerald-500" title="Downloaded">
              <CheckCircle className="w-4 h-4" />
            </span>
          </>
        ) : (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`p-1.5 rounded-full ${
              isDownloading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Download for offline use"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}