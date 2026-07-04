'use client';

import { Camera, Maximize2, Minimize2, Pause, Play, Square, Loader2 } from 'lucide-react';
import type { CoachState, CoachActions } from '@/hooks/useLiveCoachEngine';
import { RealTimeMetrics } from './RealTimeMetrics';
import type { LevelThreshold } from '@/lib/fms-scoring';

// ── LivePoseCoach: camera + skeleton overlay + controls + metrics ──

interface LivePoseCoachProps {
  state: CoachState & CoachActions;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  levelConfig: LevelThreshold | undefined;
}

export function LivePoseCoach({ state, videoRef, canvasRef, levelConfig }: LivePoseCoachProps) {
  const {
    isRecording, isPaused, isFullScreen, isLoading, error, isReady,
    currentScore, reps, holdTime, feedback,
    start, pause, resume, stop, toggleFullScreen,
  } = state;

  return (
    <div className={`
      relative
      ${isFullScreen
        ? 'fixed inset-0 z-50 bg-black flex flex-col'
        : 'rounded-[2rem] overflow-hidden border-4 border-white/10 bg-foreground/90 text-white'
      }
    `}>
      {/* Camera Viewport */}
      <div className={`relative ${isFullScreen ? 'flex-1' : 'aspect-video'}`}>
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // mirror
        />

        {/* Skeleton canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 grid place-items-center bg-black/60">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-white">Memuat kamera & MediaPipe...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 grid place-items-center bg-black/60">
            <div className="text-center bg-red-500/20 backdrop-blur rounded-2xl p-6 border-2 border-red-300/30">
              <p className="text-sm font-bold text-red-200">❌ {error}</p>
              <p className="text-xs text-red-300 mt-1">Pastikan izin kamera diberikan</p>
            </div>
          </div>
        )}

        {/* Live badge */}
        {isRecording && !isPaused && (
          <div className="absolute top-3 left-3 bg-red-500 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse shadow-pop">
            ● REC {isPaused ? 'PAUSED' : ''}
          </div>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullScreen}
          className="absolute top-3 right-3 bg-white/20 backdrop-blur text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
          title={isFullScreen ? 'Keluar Full Screen' : 'Full Screen'}
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* ESC hint in fullscreen */}
        {isFullScreen && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/40 text-white/70 text-xs px-3 py-1 rounded-full">
            ESC untuk keluar
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className={`flex gap-2 p-3 ${isFullScreen ? 'justify-center' : ''}`}>
        {!isRecording ? (
          <button
            onClick={start}
            disabled={!isReady}
            className="flex-1 rounded-full font-bold gradient-sunset text-white border-0 h-11 flex items-center justify-center shadow-pop transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Camera className="w-4 h-4 mr-1.5" />
            Mulai Rekam
          </button>
        ) : (
          <>
            <button
              onClick={isPaused ? resume : pause}
              className="flex-1 rounded-full font-bold bg-white/20 text-white border-0 h-11 flex items-center justify-center transition-all hover:bg-white/30 hover:scale-105 active:scale-95"
            >
              {isPaused ? (
                <><Play className="w-4 h-4 mr-1.5" /> Lanjut</>
              ) : (
                <><Pause className="w-4 h-4 mr-1.5" /> Jeda</>
              )}
            </button>
            <button
              onClick={stop}
              className="rounded-full font-bold bg-red-500 text-white border-0 h-11 px-6 flex items-center justify-center shadow-pop transition-all hover:scale-105 active:scale-95"
            >
              <Square className="w-4 h-4 mr-1.5" /> Selesai
            </button>
          </>
        )}
      </div>

      {/* Metrics (hidden in fullscreen unless recording) */}
      {(!isFullScreen || isRecording) && (
        <div className={`px-3 pb-3 ${isFullScreen ? 'absolute bottom-20 left-0 right-0 px-6' : ''}`}>
          <RealTimeMetrics
            state={{ isRecording, isPaused, currentScore, reps, holdTime, feedback, isFullScreen, isReady, isLoading, error, movementData: null }}
            levelConfig={levelConfig}
            isFullScreen={isFullScreen}
          />
        </div>
      )}
    </div>
  );
}
