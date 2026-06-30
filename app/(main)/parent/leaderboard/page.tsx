'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

const dummyChildren = [
  {
    id: '1', name: 'Adi', avatar: '🧒', level: 3, classId: '3A',
    rank: 5, pl: 78, xp: 2450, trend: 'down',
    classLeaderboard: [
      { rank: 1, name: 'Mira', avatar: '👧', pl: 91 },
      { rank: 2, name: 'Nina', avatar: '👧', pl: 88 },
      { rank: 3, name: 'Rian', avatar: '🧒', pl: 85 },
      { rank: 4, name: 'Putri', avatar: '👧', pl: 82 },
      { rank: 5, name: 'Adi', avatar: '🧒', pl: 78 },
      { rank: 6, name: 'Budi', avatar: '🧒', pl: 74 },
      { rank: 7, name: 'Joko', avatar: '🧒', pl: 71 },
      { rank: 8, name: 'Sari', avatar: '👧', pl: 68 },
    ],
  },
  {
    id: '2', name: 'Sari', avatar: '👧', level: 2, classId: '2B',
    rank: 8, pl: 68, xp: 1800, trend: 'down',
    classLeaderboard: [
      { rank: 1, name: 'Rina', avatar: '👧', pl: 85 },
      { rank: 2, name: 'Dewi', avatar: '👧', pl: 82 },
      { rank: 3, name: 'Fajar', avatar: '🧒', pl: 79 },
      { rank: 4, name: 'Wati', avatar: '👧', pl: 75 },
      { rank: 5, name: 'Hadi', avatar: '🧒', pl: 72 },
      { rank: 6, name: 'Tia', avatar: '👧', pl: 70 },
      { rank: 7, name: 'Galang', avatar: '🧒', pl: 69 },
      { rank: 8, name: 'Sari', avatar: '👧', pl: 68 },
    ],
  },
];

export default function ParentLeaderboardPage() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const [selectedChild, setSelectedChild] = useState('1');

  const child = dummyChildren.find((c) => c.id === selectedChild) ?? dummyChildren[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-5 shadow-pop border-4 border-white">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <div className="text-xs font-bold text-muted-foreground">Leaderboard</div>
            <h1 className="text-2xl font-extrabold">Papan Skor Kelas Anak</h1>
          </div>
        </div>
        {/* Child selector */}
        <div className="flex gap-2 mt-3">
          {dummyChildren.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(c.id)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                selectedChild === c.id
                  ? 'gradient-sunset text-white'
                  : 'bg-muted'
              }`}
            >
              {c.avatar} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Child rank card */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-3xl p-4 shadow-soft text-center border-4 border-yellow-300">
          <div className="text-3xl">🎖️</div>
          <div className="text-3xl font-extrabold">{child.rank}</div>
          <div className="text-xs font-bold text-muted-foreground">Rank di Kelas</div>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-soft text-center border-4 border-blue-200">
          <div className="text-3xl">📊</div>
          <div className="text-3xl font-extrabold">{child.pl}</div>
          <div className="text-xs font-bold text-muted-foreground">PL Score</div>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-soft text-center border-4 border-purple-200">
          <div className="text-3xl">✨
            {child.trend === 'up' ? '📈' : child.trend === 'down' ? '📉' : '➡️'}
          </div>
          <div className="text-3xl font-extrabold">{
            child.trend === 'up' ? 'Naik' : child.trend === 'down' ? 'Turun' : 'Stabil'
          }</div>
          <div className="text-xs font-bold text-muted-foreground">vs Minggu Lalu</div>
        </div>
      </div>

      {/* Class leaderboard */}
      <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border">
          <span className="font-extrabold">📋 Kelas {child.classId} — {child.classLeaderboard.length} siswa</span>
        </div>
        {child.classLeaderboard.map((s, i) => (
          <div
            key={s.rank}
            className={`flex items-center gap-4 px-6 py-3 ${
              s.name === child.name
                ? 'bg-blue-50 border-l-4 border-blue-500 font-bold'
                : i % 2 === 0 ? 'bg-white' : 'bg-muted/20'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
              s.rank === 1 ? 'bg-amber-400 text-white' :
              s.rank === 2 ? 'bg-gray-300 text-white' :
              s.rank === 3 ? 'bg-amber-700 text-white' :
              'bg-muted'
            }`}>
              {s.rank}
            </div>
            <div className="text-2xl">{s.avatar}</div>
            <div className="flex-1">
              <div className="font-bold text-sm">
                {s.name}
                {s.name === child.name && <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Anak kamu</span>}
              </div>
            </div>
            <div className="font-extrabold">{s.pl} PL</div>
          </div>
        ))}
      </div>

      {/* Motivation card */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl p-5 shadow-soft text-white">
        <div className="flex items-center gap-4">
          <span className="text-4xl">💪</span>
          <div>
            <div className="font-extrabold text-lg">Khusus untuk orang tua</div>
            <p className="text-sm opacity-80">
              Bantu {child.name} naik rank dengan rutin latihan di rumah dan melengkapi quest mingguan.
              Peringkat {child.rank} dari {child.classLeaderboard.length} siswa di kelas {child.classId}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}