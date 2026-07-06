'use client';

import type { CoachState } from '@/hooks/useLiveCoachEngine';
import Image from 'next/image';
import type { LevelThreshold } from '@/lib/fms-scoring';

// ── Live Metrics Panel: angle gauge, timer, reps, progress bar ──

interface RealTimeMetricsProps {
  state: CoachState;
  levelConfig: LevelThreshold | undefined;
  isFullScreen: boolean;
}

export function RealTimeMetrics({ state, levelConfig, isFullScreen }: RealTimeMetricsProps) {
  const { currentScore, reps, holdTime, feedback } = state;
  const holdTarget = levelConfig?.holdSeconds ?? 3;

  return (
    <div className={`space-y-3 ${isFullScreen ? 'text-sm' : ''}`}>
      {/* Score Gauge */}
      <div className="bg-white rounded-2xl p-4 shadow-chunky border-3 border-amber-200">
        <div className="text-xs font-bold text-muted-foreground mb-1">📊 Skor Live</div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-extrabold text-primary">{currentScore}</span>
          <span className="text-sm font-bold text-muted-foreground mb-1">/ 100</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-3 bg-muted rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${Math.min(100, currentScore)}%`,
              background: currentScore >= 85
                ? 'linear-gradient(90deg, oklch(0.82 0.2 145), oklch(0.7 0.18 195))'
                : currentScore >= 60
                  ? 'linear-gradient(90deg, oklch(0.9 0.18 95), oklch(0.78 0.18 60))'
                  : 'linear-gradient(90deg, oklch(0.78 0.18 350), oklch(0.65 0.24 25))',
            }}
          />
        </div>
      </div>

      {/* Hold Timer */}
      <div className="bg-white rounded-2xl p-4 shadow-chunky border-3 border-green-200">
        <div className="text-xs font-bold text-muted-foreground mb-1">⏱️ Waktu Tahan</div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-extrabold text-secondary">{holdTime.toFixed(1)}</span>
          <span className="text-sm font-bold text-muted-foreground mb-1">/ {holdTarget}s</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-200"
            style={{ width: `${Math.min(100, (holdTime / holdTarget) * 100)}%` }}
          />
        </div>
      </div>

      {/* Reps Counter */}
      <div className="bg-white rounded-2xl p-4 shadow-chunky border-3 border-purple-200">
        <div className="text-xs font-bold text-muted-foreground mb-1">🔄 Repetisi</div>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-extrabold text-grape">{reps}</span>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(reps, 10) }).map((_, i) => (
              <span key={i} className="text-sm animate-pop-in" style={{ animationDelay: `${i * 0.1}s` }}>
                ⭐
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* MOVA Feedback Bubble */}
      <div className="bg-primary/10 rounded-2xl p-4 border-2 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-0.5 shadow-soft shrink-0 overflow-hidden">
            <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-extrabold text-primary mb-0.5">✨ MOVA berkata</div>
            <p className="text-sm font-bold leading-snug">{feedback}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
