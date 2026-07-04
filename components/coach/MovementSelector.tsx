'use client';

import { useRef, useCallback } from 'react';
import { type MovementType } from '@/lib/fms-scoring';
import { MOVEMENT_LEVELS } from '@/lib/fms-scoring';

// ── Activity Selector (4 tab) + Level pills + swipe gesture ──

const ACTIVITIES: { id: MovementType; label: string; emoji: string }[] = [
  { id: 'menekuk', label: 'Menekuk', emoji: '🦵' },
  { id: 'meliuk', label: 'Meliuk', emoji: '🐍' },
  { id: 'memutar', label: 'Memutar', emoji: '🌀' },
  { id: 'keseimbangan', label: 'Keseimbangan', emoji: '⚖️' },
];

interface MovementSelectorProps {
  activity: MovementType;
  level: number;
  onActivityChange: (a: MovementType) => void;
  onLevelChange: (l: number) => void;
}

export function MovementSelector({ activity, level, onActivityChange, onLevelChange }: MovementSelectorProps) {
  // Swipe gesture: swipe left/right to cycle activities
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    // Only trigger if horizontal swipe is dominant (>50px) and more horizontal than vertical
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

    const idx = ACTIVITIES.findIndex((a) => a.id === activity);
    if (dx < 0 && idx < ACTIVITIES.length - 1) {
      onActivityChange(ACTIVITIES[idx + 1].id);
    } else if (dx > 0 && idx > 0) {
      onActivityChange(ACTIVITIES[idx - 1].id);
    }
  }, [activity, onActivityChange]);

  return (
    <div
      className="space-y-3 touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Activity tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            onClick={() => onActivityChange(a.id)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all hover:animate-bounce-sm ${
              activity === a.id
                ? 'gradient-sky text-white shadow-pop scale-105'
                : 'bg-muted hover:bg-sky-100'
            }`}
          >
            {a.emoji} {a.label}
          </button>
        ))}
      </div>

      {/* Level pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {(MOVEMENT_LEVELS[activity] ?? []).map((lv) => (
          <button
            key={lv.level}
            onClick={() => onLevelChange(lv.level)}
            className={`px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
              level === lv.level
                ? 'gradient-grass text-white shadow-pop scale-105'
                : 'bg-muted hover:bg-green-100'
            }`}
          >
            Lv {lv.level}
          </button>
        ))}
      </div>

      {/* Swipe hint */}
      <div className="text-[10px] text-muted-foreground text-center font-medium">
        👆 Geser kiri/kanan untuk ganti gerakan
      </div>

      {/* Level requirement */}
      <div className="text-xs font-bold text-muted-foreground bg-white/50 rounded-xl px-3 py-2 border-2 border-muted">
        🎯 {MOVEMENT_LEVELS[activity]?.[level - 1]?.requirement ?? 'Pilih level'}
      </div>
    </div>
  );
}
