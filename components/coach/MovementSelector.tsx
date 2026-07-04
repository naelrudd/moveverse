"use client";

import { useRef, useCallback } from "react";
import { type MovementType } from "@/lib/fms-scoring";
import { MOVEMENT_LEVELS } from "@/lib/fms-scoring";

// ── Activity Selector + Level pills + swipe gesture + world theme ──

const ACTIVITIES: { id: MovementType; label: string; emoji: string }[] = [
  { id: "menekuk", label: "Menekuk", emoji: "🦵" },
  { id: "meliuk", label: "Meliuk", emoji: "🐍" },
  { id: "memutar", label: "Memutar", emoji: "🌀" },
  { id: "keseimbangan", label: "Keseimbangan", emoji: "⚖️" },
];

/** World theme configs */
const WORLD_THEMES: Record<
  string,
  {
    bg: string;
    border: string;
    accent: string;
    levelActive: string;
    levelInactive: string;
    headerBg: string;
  }
> = {
  "pulau-naga": {
    bg: "bg-gradient-to-br from-green-50 to-emerald-50",
    border: "border-green-300",
    accent: "text-green-700",
    levelActive:
      "bg-green-600 text-white border-green-500 ring-2 ring-green-300",
    levelInactive: "bg-white text-green-700 border-green-200 hover:bg-green-50",
    headerBg: "bg-green-600",
  },
  "hutan-harimau": {
    bg: "bg-gradient-to-br from-sky-50 to-blue-50",
    border: "border-sky-300",
    accent: "text-sky-700",
    levelActive: "bg-sky-600 text-white border-sky-500 ring-2 ring-sky-300",
    levelInactive: "bg-white text-sky-700 border-sky-200 hover:bg-sky-50",
    headerBg: "bg-sky-600",
  },
  "gunung-elang": {
    bg: "bg-gradient-to-br from-purple-50 to-fuchsia-50",
    border: "border-purple-300",
    accent: "text-purple-700",
    levelActive:
      "bg-purple-600 text-white border-purple-500 ring-2 ring-purple-300",
    levelInactive:
      "bg-white text-purple-700 border-purple-200 hover:bg-purple-50",
    headerBg: "bg-purple-600",
  },
};

const DEFAULT_THEME = {
  bg: "bg-gradient-to-br from-sky-50 to-blue-50",
  border: "border-sky-300",
  accent: "text-sky-700",
  levelActive:
    "gradient-grass text-white scale-110 border-green-500 ring-2 ring-green-300",
  levelInactive:
    "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:scale-105",
  headerBg: "bg-sky-600",
};

interface MovementSelectorProps {
  activity: MovementType;
  level: number;
  onActivityChange: (a: MovementType) => void;
  onLevelChange: (l: number) => void;
  worldId?: string;
}

export function MovementSelector({
  activity,
  level,
  onActivityChange,
  onLevelChange,
  worldId,
}: MovementSelectorProps) {
  const theme = (worldId && WORLD_THEMES[worldId]) || DEFAULT_THEME;

  // Swipe gesture
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      const idx = ACTIVITIES.findIndex((a) => a.id === activity);
      if (dx < 0 && idx < ACTIVITIES.length - 1)
        onActivityChange(ACTIVITIES[idx + 1].id);
      else if (dx > 0 && idx > 0) onActivityChange(ACTIVITIES[idx - 1].id);
    },
    [activity, onActivityChange],
  );

  return (
    <div
      className={`space-y-2.5 rounded-2xl p-3 border-2 ${theme.bg} ${theme.border} touch-pan-y`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Activity tabs */}
      <div className="flex gap-1.5 px-2 py-1 overflow-x-auto no-scrollbar">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            onClick={() => onActivityChange(a.id)}
            className={`px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all border-2 ${
              activity === a.id
                ? `${theme.headerBg} text-white scale-105 border-transparent`
                : `bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:scale-105`
            }`}
          >
            {a.emoji} {a.label}
          </button>
        ))}
      </div>

      {/* Level pills */}
      <div className="flex px-2 py-1 gap-1.5 overflow-x-auto no-scrollbar">
        {(MOVEMENT_LEVELS[activity] ?? []).map((lv) => (
          <button
            key={lv.level}
            onClick={() => onLevelChange(lv.level)}
            className={`px-2.5 py-1 rounded-full font-bold text-[11px] whitespace-nowrap transition-all border-2 ${
              level === lv.level ? theme.levelActive : theme.levelInactive
            }`}
          >
            Lv {lv.level}
          </button>
        ))}
      </div>

      {/* Level requirement + swipe hint */}
      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground bg-white/60 rounded-lg px-2.5 py-1.5">
        <span>
          🎯{" "}
          {MOVEMENT_LEVELS[activity]?.[level - 1]?.requirement ?? "Pilih level"}
        </span>
        <span className="opacity-60">👆 Geser kiri/kanan</span>
      </div>
    </div>
  );
}
