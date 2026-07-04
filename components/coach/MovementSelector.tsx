'use client';

import { type MovementType } from '@/lib/fms-scoring';
import { MOVEMENT_LEVELS } from '@/lib/fms-scoring';

// ── Activity Selector (4 tab) + Level pills ──

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
  return (
    <div className="space-y-3">
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

      {/* Level requirement */}
      <div className="text-xs font-bold text-muted-foreground bg-white/50 rounded-xl px-3 py-2 border-2 border-muted">
        🎯 {MOVEMENT_LEVELS[activity]?.[level - 1]?.requirement ?? 'Pilih level'}
      </div>
    </div>
  );
}
