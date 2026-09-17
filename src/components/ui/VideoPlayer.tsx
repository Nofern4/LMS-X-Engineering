'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings, Captions } from 'lucide-react';
import { Button } from './Button';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative bg-[#14110f] rounded-3xl overflow-hidden shadow-warm-xl border border-[#3d2c20] group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        preload="none"
        className="w-full h-auto aspect-video cursor-pointer"
      >
        <track kind="captions" label="Thai Subtitles" srcLang="th" default={captionsEnabled} />
      </video>

      {/* Overlay Title */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-[#f9f6f0] font-serif-luxury text-base font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          {title}
        </div>
      )}

      {/* Center Big Play Button overlay if paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer"
        >
          <div className="w-18 h-18 p-4 rounded-full bg-[#3d2c20]/90 text-[#f9f6f0] flex items-center justify-center shadow-warm-xl border border-[#c69b76]/50 hover:scale-110 transition-transform">
            <Play className="w-9 h-9 fill-[#c69b76] text-[#c69b76] ml-1" />
          </div>
        </div>
      )}

      {/* Video Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-[#3d2c20] accent-[#c69b76] rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-[#f9f6f0] text-xs">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="hover:text-[#c69b76] transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current text-[#c69b76]" />}
            </button>

            <button onClick={toggleMute} className="hover:text-[#c69b76] transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-[#3d2c20] accent-[#c69b76] rounded cursor-pointer hidden sm:block"
            />

            <span className="font-mono text-[11px] text-[#b1a8a2]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setCaptionsEnabled(!captionsEnabled)}
              className={`hover:text-[#c69b76] transition-colors ${captionsEnabled ? 'text-[#c69b76]' : 'text-[#8e827b]'}`}
              title="Captions / Subtitles"
            >
              <Captions className="w-5 h-5" />
            </button>

            {/* Playback Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="font-semibold text-xs px-2.5 py-1 bg-[#2a2420] hover:bg-[#3d2c20] rounded-full border border-[#5c4533] text-[#f9f6f0]"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 bg-[#211710] border border-[#5c4533] rounded-2xl shadow-warm-xl py-1.5 w-20 flex flex-col text-center z-20">
                  {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`px-3 py-1.5 text-xs hover:bg-[#3d2c20] ${playbackSpeed === s ? 'text-[#c69b76] font-bold' : 'text-[#f9f6f0]'}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleFullscreen} className="hover:text-[#c69b76] transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

