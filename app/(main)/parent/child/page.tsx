'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const dummyChildren = [
  {
    id: '1', name: 'Adi', avatar: '🧒', level: 3, xp: 2450,
    coins: 320, streak: 5, hearts: 4, energy: 70,
    classId: '3A', badges: 6,
    quests: [
      { icon: '🏃', title: 'Lari 100m', progress: 80, xp: 40, done: false },
      { icon: '🦘', title: 'Jumping Jacks', progress: 100, xp: 50, done: true },
      { icon: '🧘', title: 'Balance 30s', progress: 45, xp: 30, done: false },
    ],
    motorik: [
      { skill: 'Balance', val: 78 },
      { skill: 'Coordination', val: 65 },
      { skill: 'Agility', val: 72 },
      { skill: 'Strength', val: 60 },
      { skill: 'Flexibility', val: 55 },
    ],
    games: [
      { name: 'Move Dash', icon: '🏃‍♂️', emoji: '🐆', color: 'from-green-400 to-emerald-600', xp: '+80 XP', desc: 'Lari & hindari rintangan' },
      { name: 'Balance Beam', icon: '🧘', emoji: '🤸', color: 'from-blue-400 to-indigo-600', xp: '+60 XP', desc: 'Jaga keseimbangan' },
      { name: 'Jump Quest', icon: '🦘', emoji: '🦘', color: 'from-orange-400 to-red-500', xp: '+70 XP', desc: 'Lompat setinggi mungkin' },
    ],
  },
  {
    id: '2', name: 'Sari', avatar: '👧', level: 2, xp: 1800,
    coins: 250, streak: 3, hearts: 5, energy: 85,
    classId: '2B', badges: 4,
    quests: [
      { icon: '🏃', title: 'Lari 100m', progress: 60, xp: 40, done: false },
      { icon: '🦘', title: 'Jumping Jacks', progress: 100, xp: 50, done: true },
      { icon: '🎯', title: 'Lempar Tangkap', progress: 30, xp: 60, done: false },
    ],
    motorik: [
      { skill: 'Balance', val: 82 },
      { skill: 'Coordination', val: 70 },
      { skill: 'Agility', val: 68 },
      { skill: 'Strength', val: 55 },
      { skill: 'Flexibility', val: 62 },
    ],
    games: [
      { name: 'Move Dash', icon: '🏃‍♂️', emoji: '🐆', color: 'from-green-400 to-emerald-600', xp: '+80 XP', desc: 'Lari & hindari rintangan' },
      { name: 'Balance Beam', icon: '🧘', emoji: '🤸', color: 'from-blue-400 to-indigo-600', xp: '+60 XP', desc: 'Jaga keseimbangan' },
    ],
  },
];

const weeklyActivity = [
  { d: 'Sen', school: 45, home: 30 },
  { d: 'Sel', school: 60, home: 20 },
  { d: 'Rab', school: 50, home: 45 },
  { d: 'Kam', school: 40, home: 35 },
  { d: 'Jum', school: 55, home: 25 },
  { d: 'Sab', school: 0, home: 60 },
  { d: 'Min', school: 0, home: 50 },
];

const badges = [
  { name: 'Pelari Cepat', icon: '🏅', desc: 'Lari 100m dalam 15s', unlocked: true },
  { name: 'Balance Master', icon: '🎯', desc: 'Balance 30 detik', unlocked: true },
  { name: 'Jump King', icon: '👑', desc: 'Lompat 50x', unlocked: true },
  { name: 'Team Player', icon: '🤝', desc: 'Main 5 game grup', unlocked: false },
  { name: 'Streak 7', icon: '🔥', desc: '7 hari berturut-turut', unlocked: true },
  { name: 'Flexibility Pro', icon: '🧘', desc: 'Skor fleksibilitas 80+', unlocked: false },
];

export default function ParentChildDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const [selectedChild, setSelectedChild] = useState('1');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const child = dummyChildren.find((c) => c.id === selectedChild) ?? dummyChildren[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Top: child selector */}
      <div className="flex items-center justify-between bg-gradient-to-r from-sky-400/20 to-purple-400/20 rounded-[2rem] p-4 border-2 border-white/40">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👨‍👩‍👧</span>
          <div>
            <div className="text-xs font-bold text-muted-foreground">Aktivitas Anak</div>
            <h1 className="text-xl font-extrabold">Dashboard Anak</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {dummyChildren.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedChild(c.id); setSelectedGame(null); }}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                selectedChild === c.id
                  ? 'bg-white shadow-soft border-2 border-primary/30'
                  : 'bg-white/50 hover:bg-white'
              }`}
            >
              {c.avatar} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { l: 'Level', v: child.level, c: 'from-blue-500 to-blue-700', i: '⭐' },
          { l: 'XP', v: child.xp.toLocaleString(), c: 'from-purple-500 to-pink-600', i: '✨' },
          { l: '🪙', v: child.coins.toLocaleString(), c: 'from-amber-500 to-orange-600', i: '' },
          { l: '🔥 Streak', v: `${child.streak} hari`, c: 'from-red-500 to-rose-600', i: '' },
          { l: 'Badges', v: `${child.badges}/6`, c: 'from-green-500 to-emerald-600', i: '🏅' },
        ].map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.c} text-white rounded-2xl p-3 shadow-soft text-center`}>
            {s.i && <div className="text-lg">{s.i}</div>}
            <div className="text-lg font-extrabold">{s.v}</div>
            <div className="text-[10px] font-bold opacity-80">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Games / Worlds */}
        <div className="lg:col-span-2 space-y-5">
          {/* Gamified world cards */}
          <div className="bg-white rounded-3xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg">🌍 Game Interaktif</h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-muted">Main yuk!</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {child.games.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedGame(selectedGame === g.name ? null : g.name)}
                  className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${g.color} text-white text-left transition-all ${
                    selectedGame === g.name ? 'ring-4 ring-white shadow-lg scale-[1.03]' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className="text-3xl mb-1">{g.emoji}</div>
                  <div className="font-extrabold text-sm">{g.name}</div>
                  <div className="text-xs opacity-80 mt-1">{g.desc}</div>
                  <div className="mt-2 text-xs font-bold bg-white/30 rounded-full px-2 py-0.5 inline-block">{g.xp}</div>
                </button>
              ))}
            </div>
            {selectedGame && (
              <div className="mt-4 p-4 bg-green-50 rounded-2xl border-2 border-green-200 animate-pop-in">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎮</span>
                  <div className="flex-1">
                    <div className="font-extrabold">{selectedGame}</div>
                    <div className="text-xs text-muted-foreground">Klik &quot;Main Sekarang&quot; untuk mulai sesi latihan</div>
                  </div>
                  <button className="px-6 py-2 rounded-full gradient-grass text-white font-extrabold text-sm shadow-soft">
                    Main Sekarang 🚀
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Progress quests */}
          <div className="bg-white rounded-3xl p-5 shadow-soft">
            <h3 className="font-extrabold text-lg mb-3">📋 Quest Aktif</h3>
            <div className="space-y-3">
              {child.quests.map((q, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${q.done ? 'gradient-grass text-white' : 'bg-muted'}`}>
                    {q.done ? '✓' : q.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold text-sm ${q.done ? 'line-through text-muted-foreground' : ''}`}>{q.title}</div>
                    <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${q.done ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${q.progress}%` }} />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-accent">{q.xp} XP</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: radar + badges */}
        <div className="space-y-5">
          {/* Radar motorik */}
          <div className="bg-white rounded-3xl p-5 shadow-soft">
            <h3 className="font-extrabold text-sm mb-2">🏋️ Kemampuan Motorik</h3>
            <div className="h-52">
              <ResponsiveContainer>
                <RadarChart data={child.motorik}>
                  <PolarGrid stroke="currentColor" strokeOpacity={0.15} />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar dataKey="val" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {child.motorik.map((m) => (
              <div key={m.skill} className="flex items-center gap-2 text-xs mt-1">
                <span className="w-20 font-bold">{m.skill}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${m.val}%` }} />
                </div>
                <span className="font-bold w-6 text-right">{m.val}</span>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="bg-white rounded-3xl p-5 shadow-soft">
            <h3 className="font-extrabold text-sm mb-3">🏆 Badges</h3>
            <div className="grid grid-cols-3 gap-2">
              {badges.map((b, i) => (
                <div
                  key={i}
                  className={`text-center p-2 rounded-xl transition-all ${
                    b.unlocked ? 'bg-muted/30' : 'bg-muted/10 opacity-40'
                  }`}
                >
                  <div className="text-2xl">{b.icon}</div>
                  <div className="text-[10px] font-bold mt-0.5">{b.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly mini chart */}
          <div className="bg-white rounded-3xl p-5 shadow-soft">
            <h3 className="font-extrabold text-sm mb-2">📊 Aktivitas Minggu Ini</h3>
            <div className="h-24">
              <ResponsiveContainer>
                <BarChart data={weeklyActivity}>
                  <XAxis dataKey="d" tick={{ fontSize: 9 }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="school" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="home" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
