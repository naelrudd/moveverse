'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

const dummyLeaderboard = [
  { rank: 1, name: 'Mira', avatar: '👧', level: 4, pl: 91, xp: 4200, trend: 'up' },
  { rank: 2, name: 'Nina', avatar: '👧', level: 4, pl: 88, xp: 3800, trend: 'up' },
  { rank: 3, name: 'Rian', avatar: '🧒', level: 3, pl: 85, xp: 3100, trend: 'stable' },
  { rank: 4, name: 'Putri', avatar: '👧', level: 3, pl: 82, xp: 2900, trend: 'up' },
  { rank: 5, name: 'Adi', avatar: '🧒', level: 3, pl: 78, xp: 2450, trend: 'down' },
  { rank: 6, name: 'Budi', avatar: '🧒', level: 2, pl: 74, xp: 2100, trend: 'up' },
  { rank: 7, name: 'Joko', avatar: '🧒', level: 2, pl: 71, xp: 1900, trend: 'stable' },
  { rank: 8, name: 'Sari', avatar: '👧', level: 2, pl: 68, xp: 1800, trend: 'down' },
];

export default function TeacherLeaderboardPage() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const [selectedClass, setSelectedClass] = useState('3A');
  const [sortBy, setSortBy] = useState<'pl' | 'xp'>('pl');

  const sorted = [...dummyLeaderboard].sort((a, b) =>
    sortBy === 'pl' ? b.pl - a.pl : b.xp - a.xp
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-5 shadow-pop border-4 border-white">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <div className="text-xs font-bold text-muted-foreground">Leaderboard</div>
            <h1 className="text-2xl font-extrabold">Papan Skor Kelas</h1>
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          <div className="flex gap-2">
            {['3A', '3B', '4A', '4B', '5A', '5B'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  selectedClass === c ? 'gradient-sky text-white' : 'bg-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => setSortBy('pl')}
              className={`px-3 py-2 rounded-full text-sm font-bold ${sortBy === 'pl' ? 'bg-blue-500 text-white' : 'bg-muted'}`}
            >
              PL Score
            </button>
            <button
              onClick={() => setSortBy('xp')}
              className={`px-3 py-2 rounded-full text-sm font-bold ${sortBy === 'xp' ? 'bg-purple-500 text-white' : 'bg-muted'}`}
            >
              XP
            </button>
          </div>
        </div>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 0, 2].map((idx) => {
          const s = sorted[idx];
          const podium = ['🥈', '🥇', '🥉'];
          const heights = ['h-28', 'h-36', 'h-24'];
          const colors = ['from-gray-400', 'from-amber-400', 'from-amber-700'];
          return (
            <div key={s.rank} className={`bg-gradient-to-b ${colors[idx]} rounded-3xl p-4 flex flex-col items-center justify-end pb-4 text-white shadow-soft`} style={{ minHeight: '130px' }}>
              <div className="text-3xl">{podium[idx]}</div>
              <div className="font-extrabold mt-1">{s.avatar}</div>
              <div className="font-extrabold text-sm mt-1">{s.name}</div>
              <div className="text-xs font-bold mt-1 bg-white/30 rounded-full px-2 py-0.5">
                {sortBy === 'pl' ? `${s.pl} PL` : `${s.xp.toLocaleString()} XP`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
        {sorted.map((s, i) => (
          <div
            key={s.rank}
            className={`flex items-center gap-4 px-6 py-4 ${
              i % 2 === 0 ? 'bg-muted/20' : 'bg-white'
            } ${i < 3 ? 'font-bold' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
              i === 0 ? 'bg-amber-400 text-white' :
              i === 1 ? 'bg-gray-300 text-white' :
              i === 2 ? 'bg-amber-700 text-white' :
              'bg-muted'
            }`}>
              {i + 1}
            </div>
            <div className="text-2xl">{s.avatar}</div>
            <div className="flex-1">
              <div className="font-bold">{s.name}</div>
              <div className="text-xs text-muted-foreground">Level {s.level}</div>
            </div>
            <div className="text-center">
              <div className="font-extrabold text-lg">{s.pl}</div>
              <div className="text-[10px] text-muted-foreground">PL Score</div>
            </div>
            <div className="text-center">
              <div className="font-extrabold">{s.xp.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">Total XP</div>
            </div>
            <div className={`text-lg ${
              s.trend === 'up' ? 'text-green-500' : s.trend === 'down' ? 'text-red-500' : 'text-gray-400'
            }`}>
              {s.trend === 'up' ? '▲' : s.trend === 'down' ? '▼' : '◆'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}