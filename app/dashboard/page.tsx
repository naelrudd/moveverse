'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const dailyMissions = [
  { t: 'Do 10 star jumps', xp: 50, done: true },
  { t: 'Hold a one-leg balance for 20s', xp: 50, done: true },
  { t: 'Run zig-zag for 1 minute', xp: 100, done: false },
];
const weeklyMissions = [
  { t: 'Complete Jumping Jungle Boss', xp: 200, done: true },
  { t: 'Earn 500 coins', xp: 150, done: false },
  { t: 'Try a new throwing game', xp: 100, done: false },
];
const badgeList = [
  { icon: '🏅', name: 'Jump Master' },
  { icon: '⚡', name: 'Speed Hero' },
  { icon: '🧘', name: 'Balance Hero' },
  { icon: '🎯', name: 'Coordination' },
  { icon: '🦊', name: 'MOVA Friend' },
  { icon: '🌟', name: 'Explorer' },
];
const petList = [
  { icon: '🦊', name: 'Baby Fox', unlocked: true },
  { icon: '🐼', name: 'Panda Jumper', unlocked: true },
  { icon: '🐯', name: 'Tiger Runner', unlocked: false },
  { icon: '🐬', name: 'Dolphin Swimmer', unlocked: false },
  { icon: '🦅', name: 'Eagle Sprinter', unlocked: false },
];
const defaultLiteracy = [
  { skill: 'Balance', value: 78 },
  { skill: 'Coordination', value: 65 },
  { skill: 'Agility', value: 72 },
  { skill: 'Strength', value: 60 },
  { skill: 'Flexibility', value: 55 },
  { skill: 'Confidence', value: 85 },
];

export default function DashboardPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const getUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const getRadar = useQuery(
    api.physical_literacy.getRadarData,
    getUser?._id ? { userId: getUser._id } : 'skip',
  );

  useEffect(() => {
    if (getUser !== undefined) setLoading(false);
  }, [getUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-bounce text-4xl mb-4">🦊</div>
          <p className="text-lg font-bold text-slate-700">Loading adventure...</p>
        </div>
      </div>
    );
  }

  if (!getUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">No user data found. Please sign in.</p>
      </div>
    );
  }

  const xpPct = getUser.xp % 1000;
  const literacy = getRadar
    ? [
        { skill: 'Balance', value: getRadar.balance },
        { skill: 'Coordination', value: getRadar.coordination },
        { skill: 'Agility', value: getRadar.agility },
        { skill: 'Strength', value: getRadar.strength },
        { skill: 'Flexibility', value: getRadar.flexibility },
        { skill: 'Confidence', value: getRadar.coordination },
      ]
    : defaultLiteracy;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      {/* Hero stats */}
      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-4xl shadow-md animate-bounce">🦊</div>
          <div>
            <div className="text-xs font-bold text-slate-500">Hi explorer 👋</div>
            <h1 className="text-3xl font-extrabold">{user?.firstName ?? getUser.name}, Level {getUser.level} Adventurer</h1>
            <p className="text-sm text-slate-600">"You're {((xpPct / 1000) * 100).toFixed(0)}% to the next level — keep going!" — MOVA</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBig icon="🌟" label="XP" value={getUser.xp.toLocaleString()} tint="bg-gradient-to-br from-orange-400 to-pink-500" />
          <StatBig icon="🪙" label="Coins" value={getUser.coins.toLocaleString()} tint="bg-gradient-to-br from-yellow-400 to-amber-500" />
          <StatBig icon="🏅" label="Badges" value="6" tint="bg-gradient-to-br from-purple-500 to-indigo-600" />
          <StatBig icon="💎" label="Crystals" value="3 / 5" tint="bg-gradient-to-br from-blue-400 to-cyan-500" />
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <div className="flex justify-between text-sm font-bold mb-2">
          <span>Level {getUser.level} · Adventurer</span>
          <span className="text-slate-500">{xpPct} / 1,000 XP</span>
        </div>
        <Progress value={xpPct / 10} className="h-4" />
      </div>

      {/* Missions + Literacy */}
      <div className="grid lg:grid-cols-3 gap-5">
        <MissionCard title="Daily Missions" missions={dailyMissions} accent="bg-gradient-to-br from-orange-400 to-pink-500" />
        <MissionCard title="Weekly Missions" missions={weeklyMissions} accent="bg-gradient-to-br from-purple-500 to-indigo-600" />
        <div className="bg-white rounded-3xl p-5 shadow-soft">
          <h3 className="font-extrabold text-lg mb-2">Physical Literacy</h3>
          <div className="text-3xl font-extrabold text-blue-600">72<span className="text-base text-slate-400">/100</span></div>
          <div className="text-xs font-bold text-slate-500 mb-1">Level: Adventurer</div>
          <div className="h-40">
            <ResponsiveContainer>
              <RadarChart data={literacy}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Badges + Pets */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold text-lg mb-4">Badges</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {badgeList.map((b) => (
              <div key={b.name} className="text-center bg-yellow-100/40 rounded-2xl p-3 hover:scale-105 transition">
                <div className="text-3xl">{b.icon}</div>
                <div className="text-[10px] font-bold mt-1">{b.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold text-lg mb-4">Pet Companions</h3>
          <div className="grid grid-cols-5 gap-3">
            {petList.map((p, i) => (
              <div key={p.name} className={`text-center rounded-2xl p-3 ${i < getUser.pets.length ? 'bg-blue-100/40' : 'bg-slate-100 opacity-50 grayscale'}`}>
                <div className="text-3xl">{p.icon}</div>
                <div className="text-[10px] font-bold mt-1">{i < getUser.pets.length ? 'Unlocked' : 'Locked'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBig({ icon, label, value, tint }: { icon: string; label: string; value: string; tint: string }) {
  return (
    <div className={`rounded-2xl p-4 text-white ${tint} shadow-soft`}>
      <div className="text-2xl">{icon}</div>
      <div className="text-xs font-bold opacity-90">{label}</div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function MissionCard({ title, missions, accent }: { title: string; missions: { t: string; xp: number; done: boolean }[]; accent: string }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft">
      <h3 className="font-extrabold text-lg mb-3">{title}</h3>
      <ul className="space-y-2">
        {missions.map((m) => (
          <li key={m.t} className={`flex items-center justify-between p-3 rounded-2xl ${m.done ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50/60'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.done ? accent : 'bg-slate-300'}`}>
                {m.done ? '✓' : ''}
              </div>
              <span className={`text-sm font-bold ${m.done ? 'line-through text-slate-500' : 'text-slate-700'}`}>{m.t}</span>
            </div>
            <span className="text-xs font-bold text-orange-500">+{m.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
