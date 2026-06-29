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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-bounce text-4xl mb-4">🦊</div>
          <p className="text-lg font-bold text-slate-700">Setting up your adventure...</p>
          <p className="text-sm text-slate-500 mt-2">First time? We're creating your profile!</p>
        </div>
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
      <section className="relative">
        <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in relative overflow-hidden">
          {/* Decorative corner highlights */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-sunny/20 to-transparent rounded-bl-[2rem]"></div>
          <div className="absolute top-0 right-0 w-20 h-16 bg-gradient-to-bl from-turquoise/20 to-transparent rounded-br-[2rem]"></div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full gradient-grass flex items-center justify-center text-5xl shadow-soft animate-wobble relative">
                {/* Glowing effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
              </div>
              {/* Mini badges */}
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full gradient-sunset shadow-glow border-2 border-white animate-sparkle"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full gradient-magic shadow-soft animate-float"></div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sunny/10 to-transparent rounded-[1rem] blur-sm"></div>
              <div className="relative z-10">
                <div className="text-xs font-bold text-muted-foreground/80 mb-1">Hi explorer 👋</div>
                <h1 className="text-3xl font-extrabold text-foreground relative">
                  {user?.firstName ?? getUser.name}, Level {getUser.level} Adventurer
                  {/* Name underline effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 to-transparent rounded-full"></div>
                </h1>
                <p className="text-sm font-bold text-muted-foreground mt-2 relative">
                  "You're {((xpPct / 1000) * 100).toFixed(0)}% to the next level — keep going!" — MOVA
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 md:mt-0">
            <StatBig
              icon="🌟"
              label="XP"
              value={getUser.xp.toLocaleString()}
              tint="gradient-sunset relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-bl-xl"></div>
            </StatBig>
            <StatBig
              icon="🪙"
              label="Coins"
              value={getUser.coins.toLocaleString()}
              tint="gradient-gold relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-bl-xl"></div>
            </StatBig>
            <StatBig
              icon="🏅"
              label="Badges"
              value="6"
              tint="gradient-magic relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-bl-xl"></div>
            </StatBig>
            <StatBig
              icon="💎"
              label="Crystals"
              value="3 / 5"
              tint="gradient-sky relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-bl-xl"></div>
            </StatBig>
          </div>
        </div>
      </section>

      {/* Level progress */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft relative overflow-hidden">
          {/* Decorative header */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-secondary/50"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-extrabold text-foreground">Level Progress</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground">Level {getUser.level} · Adventurer</span>
                <div className="w-2 h-2 rounded-full gradient-grass animate-pulse"></div>
              </div>
            </div>

            <div className="relative">
              {/* Progress bar container with glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-sm"></div>
              <div className="relative z-10 flex justify-between text-sm font-bold mb-2">
                <span className="text-foreground">Level {getUser.level} · Adventurer</span>
                <span className="text-muted-foreground">{xpPct} / 1,000 XP</span>
              </div>
              <Progress
                value={xpPct / 10}
                className="h-4 rounded-full overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sunny/30 to-accent/30 animate-pulse"></div>
              </Progress>
            </div>
          </div>
        </div>
      </section>

      {/* Missions + Literacy */}
      <section>
        <div className="grid lg:grid-cols-3 gap-5">
          <MissionCard title="Daily Missions" missions={dailyMissions} accent="gradient-sunset" />
          <MissionCard title="Weekly Missions" missions={weeklyMissions} accent="gradient-magic" />
          <div className="bg-white rounded-3xl p-5 shadow-soft relative overflow-hidden group">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full gradient-primary animate-pulse"></span>
                  Physical Literacy
                </h3>
                <div className="text-xs font-bold px-3 py-1 rounded-full gradient-sunny/30 text-foreground">
                  Level: Adventurer
                </div>
              </div>

              <div className="relative">
                {/* Literacy chart container */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl blur-sm"></div>
                <div className="relative z-10 h-40">
                  <ResponsiveContainer>
                    <RadarChart data={literacy}>
                      <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
                        tickLine={false}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                      />
                      <Radar
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badges + Pets */}
      <section>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl p-6 shadow-soft relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-sunny/10 to-transparent rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-grape/10 to-transparent rounded-tr-3xl"></div>

            <div className="relative z-10">
              <h3 className="font-extrabold text-lg mb-6 text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full gradient-sunny animate-pulse"></span>
                Badges
              </h3>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {badgeList.map((b) => (
                  <div key={b.name} className="text-center group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 bg-sunny/30 rounded-2xl p-3 hover:scale-110 transition-all duration-300 shadow-soft hover:shadow-glow">
                      <div className="text-3xl mb-1 group-hover:animate-bounce">{b.icon}</div>
                      <div className="text-[10px] font-bold text-foreground group-hover:font-extrabold transition-all">{b.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tl from-turquoise/10 to-transparent rounded-tl-3xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-bubblegum/10 to-transparent rounded-br-3xl"></div>

            <div className="relative z-10">
              <h3 className="font-extrabold text-lg mb-4 text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full gradient-turquoise animate-pulse"></span>
                Pet Companions
              </h3>

              <div className="grid grid-cols-5 gap-3">
                {petList.map((p, i) => (
                  <div key={p.name} className="relative group">
                    <div className={`absolute inset-0 rounded-2xl ${i < getUser.pets.length ? 'bg-gradient-to-br from-turquoise/20 to-accent/20' : 'bg-gradient-to-br from-muted/20 to-muted/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className={`relative z-10 text-center rounded-2xl p-3 transition-all duration-300 ${i < getUser.pets.length
                      ? 'bg-turquoise/30 hover:shadow-glow hover:-translate-y-1'
                      : 'bg-muted/50 opacity-50 grayscale cursor-not-allowed'}`}>
                      <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{p.icon}</div>
                      <div className="text-[10px] font-bold text-foreground">
                        {i < getUser.pets.length ? 'Unlocked' : 'Locked'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatBig({ icon, label, value, tint, children }: { icon: string; label: string; value: string; tint: string; children?: React.ReactNode }) {
  return (
    <div className={`rounded-2xl p-4 text-white ${tint} shadow-soft relative`}>
      {children}
      <div className="text-2xl relative z-10">{icon}</div>
      <div className="text-xs font-bold opacity-90 relative z-10">{label}</div>
      <div className="text-2xl font-extrabold relative z-10">{value}</div>
    </div>
  );
}

function MissionCard({ title, missions, accent }: { title: string; missions: { t: string; xp: number; done: boolean }[]; accent: string }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft">
      <h3 className="font-extrabold text-lg mb-3 text-foreground">{title}</h3>
      <ul className="space-y-2">
        {missions.map((m) => (
          <li key={m.t} className={`flex items-center justify-between p-3 rounded-2xl ${m.done ? 'bg-primary/10 border border-primary/30' : 'bg-muted/60'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.done ? accent : 'bg-muted-foreground/30'}`}>
                {m.done ? '✓' : ''}
              </div>
              <span className={`text-sm font-bold ${m.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{m.t}</span>
            </div>
            <span className="text-xs font-bold text-accent">+{m.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
