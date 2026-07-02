'use client';

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { worlds } from '@/lib/worlds';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';

export default function WorldDetailPage() {
  const params = useParams();
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const badges = userData?.badges ?? [];

  const world = worlds.find((w) => w.id === params.worldId);
  if (!world) return notFound();

  return (
    <div className={`min-h-[80vh] ${world.gradient} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-white/10" />
      <div className="relative max-w-6xl mx-auto px-4 py-10 text-white">
        <Link href="/worlds" className="inline-flex items-center gap-2 font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center mb-10">
          <div className="animate-pop-in">
            <div className="text-7xl mb-2 drop-shadow-lg">{world.emoji}</div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-none">{world.name}</h1>
            <p className="text-xl mt-2 opacity-95">{world.tagline}</p>
          </div>
          <div className="text-9xl drop-shadow-2xl animate-float hidden md:block">🦊</div>
        </div>

        {/* Activities */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {world.activities.map((a, i) => {
            const earned = badges.includes(a.badgeId);
            return (
              <div key={a.id} className="bg-white text-foreground rounded-3xl p-5 shadow-pop border-4 border-white animate-pop-in" style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-muted-foreground">AKTIVITAS {i + 1}</div>
                  {earned ? (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Selesai</span>
                  ) : (
                    <Sparkles className="w-4 h-4 text-accent" />
                  )}
                </div>
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="text-xl font-extrabold">{a.name}</h3>
                <p className="text-sm text-foreground/70 mt-1">{a.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-accent">+{a.xpReward} XP</span>
                  <button className="rounded-full font-bold gradient-sunset text-white border-0 px-4 py-2 text-sm">
                    {earned ? 'Main Lagi' : 'Mulai'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Badge Collection */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white text-foreground rounded-3xl p-6 shadow-pop">
            <div className="flex items-center gap-2 text-accent font-bold uppercase text-xs">
              <Trophy className="w-4 h-4" /> Koleksi Badge
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {world.activities.map((a) => {
                const earned = badges.includes(a.badgeId);
                return (
                  <div key={a.id} className={`rounded-2xl p-3 text-center ${earned ? 'bg-amber-50 border-2 border-amber-200' : 'bg-muted/40 opacity-50'}`}>
                    <div className="text-2xl">{earned ? a.icon : '🔒'}</div>
                    <div className="text-[10px] font-bold mt-1">{a.badgeName}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-foreground/90 text-white rounded-3xl p-6 shadow-pop">
            <div className="flex items-center gap-2 text-sunny font-bold uppercase text-xs">
              🎯 {world.name}
            </div>
            <h3 className="text-2xl font-extrabold mt-1">Yang Akan Kamu Kuasai</h3>
            <ul className="mt-3 space-y-2 font-bold text-sm">
              {world.activities.map((a) => (
                <li key={a.id}>{a.icon} {a.name} — {a.description}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
