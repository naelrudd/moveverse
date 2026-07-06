'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// ── Leaderboard: top students per activity ──

const ACTIVITIES = [
  { id: 'menekuk', emoji: '🦵', label: 'Menekuk' },
  { id: 'meliuk', emoji: '🐍', label: 'Meliuk' },
  { id: 'memutar', emoji: '🌀', label: 'Memutar' },
  { id: 'keseimbangan', emoji: '⚖️', label: 'Keseimbangan' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

interface LeaderboardProps {
  activity: string;
}

export function Leaderboard({ activity }: LeaderboardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(activity);

  const leaderboard = useQuery(
    api.liveCoach.getLeaderboard,
    expanded ? { activity: selectedActivity, limit: 10 } : 'skip'
  );

  // Auto-sync with selected activity

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft border-2 border-amber-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left font-bold text-sm sm:text-base flex items-center gap-2"
      >
        🏆 Leaderboard {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <div className="mt-3">
          {/* Activity filter */}
          <div className="flex gap-1 mb-3">
            {ACTIVITIES.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedActivity(a.id)}
                className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                  selectedActivity === a.id
                    ? 'bg-amber-500 text-white shadow-pop'
                    : 'bg-muted hover:bg-amber-100'
                }`}
              >
                {a.emoji} {a.label}
              </button>
            ))}
          </div>

          {/* Leaderboard list */}
          {leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-1.5">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                    idx === 0
                      ? 'bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200'
                      : idx === 1
                      ? 'bg-gray-50 border border-gray-200'
                      : idx === 2
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-white border border-gray-100'
                  }`}
                >
                  <span className="text-lg w-8 text-center">
                    {idx < 3 ? MEDALS[idx] : <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm truncate">{entry.userName}</div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground">Lv.{entry.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-sm sm:text-base text-amber-600">{entry.score}</div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground">skor</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-muted-foreground font-medium">
              {leaderboard === undefined ? 'Memuat...' : 'Belum ada data leaderboard'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
