'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const weeklyPL = [
  { w: 'W1', pl: 58, balance: 62, agility: 55, strength: 58 },
  { w: 'W2', pl: 61, balance: 64, agility: 58, strength: 61 },
  { w: 'W3', pl: 63, balance: 66, agility: 60, strength: 63 },
  { w: 'W4', pl: 65, balance: 68, agility: 62, strength: 65 },
  { w: 'W5', pl: 68, balance: 70, agility: 65, strength: 68 },
  { w: 'W6', pl: 71, balance: 73, agility: 68, strength: 71 },
];

const skillBreakdown = [
  { skill: 'Keseimbangan', score: 73, avg: 65, change: '+8' },
  { skill: 'Kelincahan', score: 68, avg: 60, change: '+8' },
  { skill: 'Kekuatan', score: 71, avg: 62, change: '+9' },
  { skill: 'Koordinasi', score: 65, avg: 58, change: '+7' },
  { skill: 'Fleksibilitas', score: 62, avg: 55, change: '+7' },
];

const gameStats = [
  { name: 'Move Dash', played: 14, avgScore: 82, best: 95 },
  { name: 'Balance Beam', played: 11, avgScore: 75, best: 88 },
  { name: 'Jump Quest', played: 9, avgScore: 70, best: 85 },
];

const monthlyQuest = [
  { m: 'Jan', completed: 12, missed: 3 },
  { m: 'Feb', completed: 15, missed: 2 },
  { m: 'Mar', completed: 18, missed: 1 },
  { m: 'Apr', completed: 14, missed: 4 },
  { m: 'Mei', completed: 19, missed: 2 },
  { m: 'Jun', completed: 16, missed: 1 },
];

export default function StudentStatsPage() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in">
        <div className="flex items-center gap-4">
          <span className="text-4xl">📊</span>
          <div>
            <div className="text-xs font-bold text-muted-foreground">Statistik Personal</div>
            <h1 className="text-3xl font-extrabold">Progress & Statistik</h1>
            <p className="text-sm text-foreground/60">Lacak perkembangan motorik dan pencapaianmu</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-extrabold text-blue-600">{userData?.level ?? 1} lvl</div>
            <div className="text-xs text-muted-foreground">Level saat ini</div>
          </div>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: 'Total XP', v: (userData?.xp ?? 2450).toLocaleString(), c: 'from-purple-500 to-pink-600' },
          { l: 'PL Score', v: '71', c: 'from-blue-500 to-cyan-600' },
          { l: 'Quest Selesai', v: '94/108', c: 'from-green-500 to-emerald-600' },
          { l: 'Hari Aktif', v: '23', c: 'from-amber-500 to-orange-600' },
        ].map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.c} text-white rounded-2xl p-4 shadow-soft text-center`}>
            <div className="text-2xl font-extrabold">{s.v}</div>
            <div className="text-xs font-bold opacity-80 mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* PL Trend */}
        <div className="bg-white rounded-3xl p-5 shadow-soft">
          <h3 className="font-extrabold text-sm mb-4">📈 Trend Physical Literacy (6 Minggu)</h3>
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={weeklyPL}>
                <XAxis dataKey="w" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis domain={[50, 90]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pl" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Skor PL" />
                <Line type="monotone" dataKey="balance" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 5" name="Keseimbangan" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill breakdown */}
        <div className="bg-white rounded-3xl p-5 shadow-soft">
          <h3 className="font-extrabold text-sm mb-4">🎯 Rincian per Skill</h3>
          <div className="space-y-3">
            {skillBreakdown.map((s) => (
              <div key={s.skill} className="flex items-center gap-3">
                <span className="w-24 text-sm font-bold">{s.skill}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.score}%` }} />
                </div>
                <span className="font-extrabold w-8 text-right">{s.score}</span>
                <span className="text-xs font-bold text-green-600 w-8">{s.change}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 bg-blue-500 rounded"></span>
              Skor kamu &nbsp;|&nbsp;
              <span className="w-4 h-4 bg-muted rounded border"></span>
              Rata-rata kelas
            </div>
          </div>
        </div>
      </div>

      {/* Game stats + Quest */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Game performance */}
        <div className="bg-white rounded-3xl p-5 shadow-soft">
          <h3 className="font-extrabold text-sm mb-4">🎮 Performa Game</h3>
          <div className="space-y-3">
            {gameStats.map((g) => (
              <div key={g.name} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg">🎮</div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{g.name}</div>
                  <div className="text-xs text-muted-foreground">Main {g.played}x · Terbaik: {g.best}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold">{g.avgScore}</div>
                  <div className="text-[10px] text-muted-foreground">rata-rata</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly quest */}
        <div className="bg-white rounded-3xl p-5 shadow-soft">
          <h3 className="font-extrabold text-sm mb-4">📋 Quest per Bulan</h3>
          <div className="h-40">
            <ResponsiveContainer>
              <BarChart data={monthlyQuest}>
                <XAxis dataKey="m" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="completed" name="Selesai" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="missed" name="Terlewat" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}