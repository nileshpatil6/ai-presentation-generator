import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon, SpinnerIcon } from './icons/Icons';
import { audioCache } from '../utils/cache';

interface SpeechControlsProps {
  text: string;
  onNarrationEnd: () => void;
  startPlaying: boolean;
  onPlaybackChange: () => void;
}

const SpeechControls: React.FC<SpeechControlsProps> = ({ 
  text, 
  onNarrationEnd, 
  startPlaying,
  onPlaybackChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Effect to handle auto-playing when a new slide comes into view
  useEffect(() => {
    if (startPlaying && text) {
      handlePlay();
      onPlaybackChange(); // Signal that we've started the process
    }
  }, [startPlaying, text]);

  // Cleanup audio when the slide text changes or component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [text]);

  const handlePlay = () => {
    setError(null);
    if (isPlaying || !text) return;

    // If we have an audio element and it's paused, just resume it.
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => setError("Playback failed."));
      return;
    }

    const audioBlob = audioCache.get(text);

    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplaying = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        onNarrationEnd();
      };
      audio.onerror = () => {
        setError("Playback error.");
        setIsPlaying(false);
      }
      audio.play().catch(() => setError("Playback failed."));
    } else {
      setError("Audio not preloaded.");
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  if (!text.trim()) {
    return null; // Don't render controls if there are no speaker notes
  }

  const baseButtonClass = "p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300 disabled:opacity-50";

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={isPlaying ? handlePause : handlePlay} 
        className={baseButtonClass} 
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <PauseIcon className="h-6 w-6" />
        ) : (
          <PlayIcon className="h-6 w-6" />
        )}
      </button>
      <button 
        onClick={handleStop} 
        disabled={!isPlaying && !audioRef.current?.currentTime} 
        className={baseButtonClass} 
        aria-label="Stop"
      >
        <StopIcon className="h-6 w-6" />
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default SpeechControls;