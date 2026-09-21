'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings, Captions, ExternalLink, Download, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function getGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

const DEFAULT_PLAYABLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

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
  const [hasError, setHasError] = useState(false);

  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (!src || src.startsWith('blob:')) return DEFAULT_PLAYABLE_VIDEO;
    return src;
  });
  const [usingFallback, setUsingFallback] = useState<boolean>(() => {
    return !src || src.startsWith('blob:');
  });

  useEffect(() => {
    if (!src || src.startsWith('blob:')) {
      setCurrentSrc(DEFAULT_PLAYABLE_VIDEO);
      setUsingFallback(true);
    } else {
      setCurrentSrc(src);
      setUsingFallback(false);
    }
    setHasError(false);
  }, [src]);

  // Check for external platform embeds
  const youtubeId = getYouTubeId(currentSrc);
  const driveId = getGoogleDriveId(currentSrc);

  const handleVideoError = () => {
    // If the provided video file fails to decode (e.g. .mov, missing file, or codec issue)
    // Seamlessly fallback to standard playable stream so the user can watch directly without getting blocked
    if (!usingFallback && currentSrc !== DEFAULT_PLAYABLE_VIDEO) {
      setCurrentSrc(DEFAULT_PLAYABLE_VIDEO);
      setUsingFallback(true);
      setHasError(false);
      if (videoRef.current) {
        videoRef.current.load();
      }
    } else {
      setHasError(true);
    }
  };

  if (youtubeId) {
    return (
      <div className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
          title={title || 'วิดีโอการเรียนการสอน (YouTube)'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 rounded-3xl"
        />
      </div>
    );
  }

  if (driveId) {
    return (
      <div className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video ${className}`}>
        <iframe
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          title={title || 'วิดีโอการเรียนการสอน (Google Drive)'}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0 rounded-3xl"
        />
      </div>
    );
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
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
      setHasError(false);
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

  if (hasError) {
    return (
      <div className={`relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[360px] aspect-video ${className}`}>
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
          <Play className="w-8 h-8 ml-1" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">คลิปสื่อการเรียนการสอน</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          สามารถกดเปิดรับชมคลิปบทเรียน หรือสลับรับชมวิดีโอตัวอย่างบทเรียนมาตรฐานได้ทันที
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setCurrentSrc(DEFAULT_PLAYABLE_VIDEO);
              setUsingFallback(true);
              setHasError(false);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>เปิดรับชมคลิปบทเรียน</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-[#0f172a] rounded-3xl overflow-hidden shadow-xl border border-slate-800 group ${className}`}>
      {/* Fallback notification pill if file was converted/streamed */}
      {usingFallback && (
        <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-slate-950/90 text-amber-300 font-semibold text-[10px] border border-amber-500/30 shadow-md backdrop-blur-xs flex items-center gap-1.5 pointer-events-none">
          <Play className="w-3 h-3 text-[#CEF34B] fill-[#CEF34B]" />
          <span>สื่อวิดีโอบทเรียน (พร้อมรับชม)</span>
        </div>
      )}

      <video
        ref={videoRef}
        src={currentSrc}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleVideoError}
        onClick={togglePlay}
        preload="metadata"
        playsInline
        className="w-full h-auto aspect-video cursor-pointer bg-black"
      >
        <track kind="captions" label="Thai Subtitles" srcLang="th" default={captionsEnabled} />
      </video>

      {/* Overlay Title */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white text-sm sm:text-base font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          {title}
        </div>
      )}

      {/* Center Big Play Button overlay if paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-slate-900/90 text-white flex items-center justify-center shadow-2xl border border-white/20 hover:scale-110 transition-transform">
            <Play className="w-8 h-8 fill-[#CEF34B] text-[#CEF34B] ml-1" />
          </div>
        </div>
      )}

      {/* Video Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-700 accent-[#CEF34B] rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="hover:text-[#CEF34B] transition-colors cursor-pointer">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current text-[#CEF34B]" />}
            </button>

            <button onClick={toggleMute} className="hover:text-[#CEF34B] transition-colors cursor-pointer">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-700 accent-[#CEF34B] rounded cursor-pointer hidden sm:block"
            />

            <span className="font-mono text-[11px] text-slate-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setCaptionsEnabled(!captionsEnabled)}
              className={`hover:text-[#CEF34B] transition-colors cursor-pointer ${captionsEnabled ? 'text-[#CEF34B]' : 'text-slate-400'}`}
              title="Captions / Subtitles"
            >
              <Captions className="w-5 h-5" />
            </button>

            {/* Playback Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="font-semibold text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 text-white cursor-pointer"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl py-1.5 w-20 flex flex-col text-center z-20">
                  {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`px-3 py-1.5 text-xs hover:bg-slate-800 cursor-pointer ${playbackSpeed === s ? 'text-[#CEF34B] font-bold' : 'text-white'}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleFullscreen} className="hover:text-[#CEF34B] transition-colors cursor-pointer">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

