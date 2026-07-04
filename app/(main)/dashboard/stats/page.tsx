'use client';

import { Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ScoreHistoryChart } from '@/components/coach/ScoreHistoryChart';
import { Leaderboard } from '@/components/coach/Leaderboard';
import { ChallengeMode } from '@/components/coach/ChallengeMode';
import type { MovementType } from '@/lib/fms-scoring';
import { useState } from 'react';

// ── Stats Page: History + Chart + Leaderboard + Challenge ──

const ACTIVITIES: { id: MovementType; label: string; emoji: string }[] = [
  { id: 'menekuk', label: 'Menekuk', emoji: '🦵' },
  { id: 'meliuk', label: 'Meliuk', emoji: '🐍' },
  { id: 'memutar', label: 'Memutar', emoji: '🌀' },
  { id: 'keseimbangan', label: 'Keseimbangan', emoji: '⚖️' },
];

function SessionHistory({ userId }: { userId: string }) {
  const history = useQuery(api.liveCoach.getSessionHistory, { userId: userId as any, limit: 50 });

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft border-2 border-purple-200">
      <h3 className="font-extrabold text-xs flex items-center gap-2 mb-3">📋 Riwayat Sesi</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {history && history.length > 0 ? (
          history.map((h) => (
            <div key={h._id} className="flex items-center gap-3 p-2 bg-purple-50 rounded-xl border border-purple-100">
              <span className="text-xl">
                {h.activity === 'menekuk' ? '🦵' : h.activity === 'meliuk' ? '🐍' : h.activity === 'memutar' ? '🌀' : '⚖️'}
              </span>
              <div className="flex-1">
                <div className="font-bold text-xs capitalize">{h.activity} Lv.{h.level}</div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(h.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xs text-primary">{h.score}</div>
                <div className="text-[10px] text-muted-foreground">{h.duration.toFixed(0)}s</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">Belum ada sesi</p>
        )}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { userId } = useAuth();
  const [activity, setActivity] = useState<MovementType>('menekuk');

  if (!userId) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="font-extrabold text-lg">📊 Statistik & Kompetisi</h1>

      {/* Activity filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            onClick={() => setActivity(a.id)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activity === a.id
                ? 'gradient-sky text-white shadow-pop scale-105'
                : 'bg-muted hover:bg-sky-100'
            }`}
          >
            {a.emoji} {a.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SessionHistory userId={userId} />
        <ScoreHistoryChart userId={userId} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Leaderboard activity={activity} />
        <ChallengeMode currentUserId={userId} activity={activity} />
      </div>
    </div>
  );
}
