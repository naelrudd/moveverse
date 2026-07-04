'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ScoreHistoryChart } from '@/components/coach/ScoreHistoryChart';
import { Leaderboard } from '@/components/coach/Leaderboard';
import { ChallengeMode } from '@/components/coach/ChallengeMode';
import type { MovementType } from '@/lib/fms-scoring';
import { useState } from 'react';

// ── Stats Page: compact, no accordion, mobile-first ──

const ACTIVITIES: { id: MovementType; label: string; emoji: string }[] = [
  { id: 'menekuk', label: 'Menekuk', emoji: '🦵' },
  { id: 'meliuk', label: 'Meliuk', emoji: '🐍' },
  { id: 'memutar', label: 'Memutar', emoji: '🌀' },
  { id: 'keseimbangan', label: 'Keseimbangan', emoji: '⚖️' },
];

function SessionHistory({ userId }: { userId: string }) {
  const history = useQuery(api.liveCoach.getSessionHistory, { userId: userId as any, limit: 30 });

  const exportCSV = () => {
    if (!history?.length) return;
    const header = 'Aktivitas,Level,Skor,Durasi (detik),Tanggal\n';
    const rows = history.map((h) =>
      `${h.activity},${h.level},${h.score},${h.duration.toFixed(0)},${new Date(h.timestamp).toLocaleDateString('id-ID')}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `riwayat-coach-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-soft border-2 border-purple-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-extrabold text-xs flex items-center gap-1.5">📋 Riwayat Sesi</h3>
        {history && history.length > 0 && (
          <button onClick={exportCSV} className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full hover:bg-purple-100 transition">
            📥 CSV
          </button>
        )}
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {history && history.length > 0 ? (
          history.map((h) => (
            <div key={h._id} className="flex items-center gap-2 p-2 bg-purple-50/50 rounded-lg border border-purple-100">
              <span className="text-base">
                {h.activity === 'menekuk' ? '🦵' : h.activity === 'meliuk' ? '🐍' : h.activity === 'memutar' ? '🌀' : '⚖️'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[11px] capitalize truncate">{h.activity} Lv.{h.level}</div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(h.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-extrabold text-xs text-primary">{h.score}</div>
                <div className="text-[10px] text-muted-foreground">{h.duration.toFixed(0)}s</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs font-bold">Belum ada sesi</p>
            <p className="text-[10px] mt-0.5">Mulai latihan di AI Coach untuk melihat riwayat</p>
          </div>
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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      {/* Compact title — no giant hero */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📊</span>
        <h1 className="font-extrabold text-base sm:text-lg">Statistik & Kompetisi</h1>
      </div>

      {/* Activity filter — compact pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            onClick={() => setActivity(a.id)}
            className={`px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all border-2 ${
              activity === a.id
                ? 'gradient-sky text-white shadow-soft border-transparent scale-105'
                : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50'
            }`}
          >
            {a.emoji} {a.label}
          </button>
        ))}
      </div>

      {/* History + Chart side by side */}
      <div className="grid sm:grid-cols-2 gap-3">
        <SessionHistory userId={userId} />
        <ScoreHistoryChart userId={userId} />
      </div>

      {/* Leaderboard + Challenge side by side — always visible */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Leaderboard activity={activity} />
        <ChallengeMode currentUserId={userId} activity={activity} />
      </div>
    </div>
  );
}
