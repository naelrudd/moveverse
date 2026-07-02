'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { ACTIVITIES } from '@/lib/worlds';

export default function StudentDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const badges = userData?.badges ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in">
        <div className="flex items-center gap-4">
          <div className="text-5xl animate-float">🧒</div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold">Halo, {userData?.name || 'Petualang'}!</h1>
            <p className="text-sm text-foreground/70">Latihan gerak non-lokomotor & kumpulkan badge!</p>
          </div>
          <Link href="/profile" className="text-sm font-bold px-4 py-2 rounded-full bg-muted">
            Profil
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { l: 'Level', v: `Lv ${userData?.level || 1}`, t: 'gradient-sky' },
          { l: 'XP', v: (userData?.xp || 0).toLocaleString(), t: 'gradient-sunset' },
          { l: 'Coins', v: (userData?.coins || 0).toLocaleString(), t: 'gradient-magic' },
          { l: 'Badge', v: `${badges.length}/6`, t: 'gradient-grass' },
        ].map((s) => (
          <div key={s.l} className={`${s.t} text-white rounded-3xl p-4 shadow-soft`}>
            <div className="text-xs font-bold opacity-90">{s.l}</div>
            <div className="text-2xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Level Progress */}
      <div className="bg-white rounded-3xl p-5 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="font-extrabold">Level {userData?.level || 1}</span>
          <span className="text-xs font-bold text-muted-foreground">
            {userData?.xp || 0} / {((userData?.level || 1) * 100)} XP
          </span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-sky rounded-full transition-all"
            style={{ width: `${Math.min(((userData?.xp || 0) % 100), 100)}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1 font-bold">
          {(userData?.level || 0) >= 10 ? 'Max Level! 🎉' : `${100 - ((userData?.xp || 0) % 100)} XP ke level berikutnya`}
        </div>
      </div>

      {/* Aktivitas Non-Lokomotor */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-xl">Aktivitas Gerak</h2>
          <Link href="/worlds" className="text-sm font-bold text-primary">Lihat Semua →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACTIVITIES.map((a) => {
            const earned = badges.includes(a.badgeId);
            return (
              <Link key={a.id} href={`/worlds/non-lokomotor`}
                className={`bg-white rounded-3xl p-5 shadow-soft hover:shadow-pop transition-all border-2 ${
                  earned ? 'border-green-300 bg-green-50' : 'border-transparent hover:border-primary/20'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{a.icon}</div>
                  {earned && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Badge</span>}
                </div>
                <h3 className="font-extrabold mt-2">{a.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                <div className="mt-2 text-xs font-bold text-accent">+{a.xpReward} XP</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h2 className="font-extrabold text-xl mb-4">Badge Koleksiku</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ACTIVITIES.map((a) => {
              const earned = badges.includes(a.badgeId);
              return (
                <div key={a.id} className={`rounded-2xl p-4 text-center ${earned ? 'bg-amber-50 border-2 border-amber-200' : 'bg-muted/40 opacity-50'}`}>
                  <div className="text-3xl mb-1">{earned ? a.icon : '🔒'}</div>
                  <div className="font-extrabold text-xs">{a.badgeName}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
