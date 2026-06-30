'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';

const dummyQuests = [
  { icon: '🦘', title: 'Jumping Jacks', target: 10, done: 7, xp: 50, color: 'gradient-sky' },
  { icon: '🧘', title: 'One Leg Balance', target: 30, done: 22, xp: 40, color: 'gradient-grass' },
  { icon: '🏃', title: 'Run in Place', target: 60, done: 60, xp: 60, color: 'gradient-sunset' },
  { icon: '🎯', title: 'Throw & Catch', target: 5, done: 3, xp: 70, color: 'gradient-magic' },
];

export default function StudentDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in">
        <div className="flex items-center gap-4">
          <div className="text-5xl animate-float">🧒</div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold">Halo, {userData?.name || 'Petualang'}!</h1>
            <p className="text-sm text-foreground/70">Mainkan game interaktif & raih pencapaianmu!</p>
          </div>
          <Link href="/profile" className="text-sm font-bold px-4 py-2 rounded-full bg-muted">
            📋 Profil
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { l: 'Level', v: `Lv ${userData?.level || 1}`, t: 'gradient-sky' },
          { l: 'XP', v: (userData?.xp || 0).toLocaleString(), t: 'gradient-sunset' },
          { l: 'Coins 🪙', v: (userData?.coins || 0).toLocaleString(), t: 'gradient-magic' },
          { l: 'Pet', v: (userData?.pets?.[0] || '🐾 None'), t: 'gradient-grass' },
        ].map((s) => (
          <div key={s.l} className={`${s.t} text-white rounded-3xl p-4 shadow-soft`}>
            <div className="text-xs font-bold opacity-90">{s.l}</div>
            <div className="text-2xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Games */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-xl">🎮 Game Interaktif</h2>
          <Link href="/worlds" className="text-sm font-bold text-primary">Lihat Semua →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🦘', title: 'Jump Master', desc: 'Lompat & landing test', players: 128, color: 'from-blue-400 to-cyan-400' },
            { icon: '🧘', title: 'Balance Quest', desc: 'Keseimbangan tubuh', players: 95, color: 'from-green-400 to-emerald-400' },
            { icon: '🏃', title: 'Sprint Run', desc: 'Lari & agility', players: 72, color: 'from-amber-400 to-orange-400' },
            { icon: '🎯', title: 'Catch Lab', desc: 'Throw & coordination', players: 110, color: 'from-purple-400 to-pink-400' },
          ].map((g) => (
            <Link key={g.title} href={`/quest/${g.title.toLowerCase().replace(/\s/g, '-')}`} 
              className="bg-white rounded-3xl p-5 shadow-soft hover:shadow-pop transition-all border-2 border-transparent hover:border-primary/20">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center text-2xl shadow-soft`}>{g.icon}</div>
              <h3 className="font-extrabold mt-3">{g.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{g.desc}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <span>👥 {g.players} active</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Active Quests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-xl">⚡ Quest Aktif</h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
            {dummyQuests.filter((q) => q.done < q.target).length} remaining
          </span>
        </div>
        <div className="space-y-3">
          {dummyQuests.map((q) => {
            const pct = Math.round((q.done / q.target) * 100);
            return (
              <div key={q.title} className="bg-white rounded-3xl p-4 shadow-soft flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${q.color} flex items-center justify-center text-xl text-white`}>
                  {pct >= 100 ? '✓' : q.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold">{q.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">{q.done}/{q.target}</span>
                    </div>
                    <span className="text-xs font-bold text-accent">+{q.xp} XP</span>
                  </div>
                  <div className="mt-2 w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${q.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rewards */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h2 className="font-extrabold text-xl mb-4">🏆 Pencapaian</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '⭐', title: 'First Jump', desc: 'Complete 1 quest', earned: true },
              { icon: '🔥', title: 'Streak 3', desc: '3 hari berturut-turut', earned: true },
              { icon: '💪', title: 'Bronze Balance', desc: 'Balance score 60+', earned: false },
              { icon: '🏅', title: 'Silver Runner', desc: '100 jumping jacks', earned: false },
            ].map((a) => (
              <div key={a.title} className={`rounded-2xl p-4 text-center ${a.earned ? 'bg-amber-50 border-2 border-amber-200' : 'bg-muted/40 opacity-60'}`}>
                <div className="text-3xl mb-1">{a.earned ? a.icon : '🔒'}</div>
                <div className="font-extrabold text-sm">{a.title}</div>
                <div className="text-[10px] text-muted-foreground">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
