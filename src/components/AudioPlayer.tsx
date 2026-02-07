import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import { Download, Trash2, CheckCircle } from 'lucide-react';
import { saveReciter, getReciterAudio, removeReciterAudio, isReciterDownloaded } from '../lib/storage';

interface AudioPlayerProps {
  reciterId: number;
  surahNumber: number;
  audioUrl: string;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: Error) => void;
}

const AudioPlayer = forwardRef(({ 
  reciterId, 
  surahNumber, 
  audioUrl, 
  onPlay, 
  onPause, 
  onError 
}: AudioPlayerProps, ref) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const audioPlayerRef = React.useRef<any>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    audio: audioPlayerRef,
    play: () => {
      if (audioPlayerRef.current && audioPlayerRef.current.audio.current) {
        audioPlayerRef.current.audio.current.play();
      }
    },
    pause: () => {
      if (audioPlayerRef.current && audioPlayerRef.current.audio.current) {
        audioPlayerRef.current.audio.current.pause();
      }
    }
  }));

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
        ref={audioPlayerRef}
        src={localAudioUrl || audioUrl}
        autoPlay={false}
        showJumpControls={false}
        layout="stacked"
        customControlsSection={['MAIN_CONTROLS', 'VOLUME_CONTROLS']}
        onPlay={onPlay}
        onPause={onPause}
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
              className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
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
            className={`p-1.5 rounded-full transition-colors ${
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
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;