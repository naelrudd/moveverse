'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { worlds, getLevelInfo, ALL_ACTIVITIES } from '@/lib/worlds';
import { useState } from 'react';

export default function StudentDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const badges = userData?.badges ?? [];
  const totalBadges = ALL_ACTIVITIES.length;
  const levelInfo = getLevelInfo(badges, userData?.xp ?? 0);
  const sideQuests = useQuery(
    api.sideQuests.getByChildActive,
    userData?._id ? { childId: userData._id } : 'skip'
  );
  const markQuestComplete = useMutation(api.sideQuests.markComplete);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in relative overflow-hidden">
        {/* Confetti background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          {['🟡', '🔵', '🟢', '🟣', '🔴'].map((c, i) => (
            <span key={i} className="absolute text-xs animate-confetti-long" style={{ left: `${15 + i * 18}%`, animationDelay: `${i * 0.4}s`, opacity: 0.6 }}>{c}</span>
          ))}
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-soft animate-dance-slow flex-shrink-0 overflow-hidden">
              <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
            </div>
            <img src="/crystals.png" alt="Energy Crystals" className="h-12 w-auto opacity-80 animate-float" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold">Halo, {userData?.name || 'Petualang'}! 👋</h1>
            <p className="text-sm text-foreground/70">Yuk latihan gerak seru hari ini!</p>
          </div>
          <Link href="/profile" className="text-sm font-bold px-4 py-2 rounded-full bg-muted">
            Profil
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { l: '⭐ Level', v: `Lv ${levelInfo.level}`, t: 'gradient-sky' },
          { l: '✨ XP', v: (userData?.xp || 0).toLocaleString(), t: 'gradient-sunset' },
          { l: '🪙 Koin', v: (userData?.coins || 0).toLocaleString(), t: 'gradient-magic' },
          { l: '🏅 Badge', v: `${badges.length}/${totalBadges}`, t: 'gradient-grass' },
        ].map((s, i) => (
          <div key={s.l} className={`${s.t} text-white rounded-3xl p-4 shadow-soft animate-slide-up relative overflow-hidden`} style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}>
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <div className="text-xs font-bold opacity-90 relative z-10">{s.l}</div>
            <div className="text-2xl font-extrabold relative z-10">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Level Progress + Completion Stats */}
      <div className="bg-white rounded-3xl p-5 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="font-extrabold">⭐ Level {levelInfo.level}</span>
          <span className="text-xs font-bold text-muted-foreground">
            {userData?.xp || 0} / {Math.max(levelInfo.level * 100, 100)} XP
          </span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-sky rounded-full transition-all"
            style={{ width: `${Math.min(((userData?.xp || 0) % 100) || 0, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-muted-foreground font-bold">
            {levelInfo.level >= 10 ? 'Max Level! 🎉' : `${levelInfo.xpForNext - (userData?.xp || 0)} XP lagi ke level berikutnya`}
          </div>
          <div className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full" title={`Butuh ${levelInfo.badgesForNextLevel} badge lagi untuk naik ke level ${Math.min(levelInfo.level + 1, 10)}`}>
            🏅 {badges.length}/{totalBadges} aktivitas selesai
          </div>
        </div>
        {levelInfo.isBadgeCapped && (
          <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-700 flex items-center gap-2 animate-wiggle">
            🔒 Selesaikan {levelInfo.badgesForNextLevel} aktivitas lagi untuk naik ke level {Math.min(levelInfo.level + 1, 10)}
          </div>
        )}
      </div>

      {/* Aktivitas per Dunia */}
      <div className="relative rounded-[2rem] overflow-hidden shadow-soft mb-4">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/world-map.jpg')" }} />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative p-5 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-2xl text-white">🗺️ Pilih Dunia</h2>
            <p className="text-sm text-white/80">Klik aktivitas untuk mulai latihan!</p>
          </div>
          <Link href="/worlds" className="px-4 py-2 rounded-full font-bold text-sm bg-white/25 backdrop-blur-sm text-white border border-white/30 hover:bg-white/40 transition-all">
            Semua Dunia →
          </Link>
        </div>
      </div>
      {worlds.map((w) => {
        const worldBadges = w.activities.filter((a) => badges.includes(a.badgeId)).length;
        return (
          <section key={w.id} className="animate-slide-up" style={{ animationDelay: `${(worlds.indexOf(w) * 0.15)}s` } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-xl">{w.emoji} Dunia {w.name}</h2>
              <Link href={`/worlds/${w.id}`} className="text-sm font-bold text-primary">Lihat Semua →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {w.activities.map((a) => {
                const earned = badges.includes(a.badgeId);
                return (
                  <Link key={a.id} href={`/worlds/${w.id}`}
                    className={`block bg-white rounded-3xl p-5 shadow-soft hover:shadow-pop transition-all duration-300 border-2 hover:-translate-y-1 group ${
                      earned ? 'border-green-300 bg-green-50' : 'border-transparent hover:border-primary/20'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl group-hover:animate-bounce-sm">{a.icon}</div>
                      {earned && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full animate-pop-in">✓ Dapat!</span>}
                    </div>
                    <h3 className="font-extrabold mt-2">{a.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                    <div className="mt-2 text-[10px] font-bold text-primary bg-primary/5 rounded-lg px-2 py-1">🎯 {a.objective}</div>
                    <div className="mt-2 text-xs font-bold text-accent">+{a.xpReward} XP</div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Side Quest di Rumah */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-xl">🎯 Side Quest di Rumah</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full gradient-sunset text-white">Tambahan</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Tugas tambahan dari orang tua — selesaikan untuk poin ekstra!</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(sideQuests ?? []).length === 0 ? (
              <div className="sm:col-span-2 p-6 text-center bg-muted/30 rounded-2xl">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-xs font-bold text-muted-foreground">Belum ada side quest dari orang tua</div>
              </div>
            ) : (
              (sideQuests ?? []).map((q) => (
                <div key={q._id} className={`p-3 rounded-2xl flex items-center gap-3 ${q.completed ? 'bg-green-50 border border-green-200' : 'bg-muted/40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${q.completed ? 'gradient-grass text-white' : 'bg-white'}`}>
                    {q.completed ? '✓' : q.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${q.completed ? 'line-through text-muted-foreground' : ''}`}>{q.title}</div>
                    <div className="text-xs text-accent font-bold">+{q.xpReward} XP</div>
                  </div>
                  {!q.completed && (
                    <button
                      onClick={async () => {
                        if (userData?._id) await markQuestComplete({ questId: q._id, childId: userData._id });
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-full bg-primary text-white"
                    >
                      Selesai
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Badge Koleksiku */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h2 className="font-extrabold text-xl mb-4">🏅 Badge Koleksiku</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3">
            {ALL_ACTIVITIES.map((a) => {
              const earned = badges.includes(a.badgeId);
              return (
                <div key={a.id} className={`rounded-2xl p-3 text-center transition-all ${earned ? 'bg-amber-50 border-2 border-amber-200 scale-105' : 'bg-muted/40 opacity-40'}`}>
                  <div className="text-2xl mb-1">{earned ? a.icon : '🔒'}</div>
                  <div className="font-extrabold text-[10px] leading-tight">{a.badgeName}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
