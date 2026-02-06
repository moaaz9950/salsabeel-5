import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../lib/utils';

interface AthanAudioPlayerProps {
  src: string;
  title: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

const AthanAudioPlayer: React.FC<AthanAudioPlayerProps> = ({
  src,
  title,
  autoPlay = false,
  onPlay,
  onPause,
  className
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    // Set initial volume
    audio.volume = volume;
    audio.muted = isMuted;

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().then(() => {
        onPlay?.();
      }).catch(err => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
        setError('Failed to play audio. Click the play button to try again.');
      });
    } else {
      audio.pause();
      onPause?.();
    }
  }, [isPlaying, onPlay, onPause]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  if (error) {
    return (
      <div className={cn("p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl", className)}>
        <p className="font-medium">Audio Error</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            if (audioRef.current) {
              audioRef.current.load();
            }
          }}
          className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={cn("athan-audio-preview", className)}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
      />

      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300">{title}</h4>
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="audio-loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Loading...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors"
          disabled={isLoading}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <audio
            src={src}
            controls
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 audio-volume-slider"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
};

export default AthanAudioPlayer;