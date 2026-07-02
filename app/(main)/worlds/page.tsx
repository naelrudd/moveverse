'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { worlds } from '@/lib/worlds';

export default function WorldsPage() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const badges = userData?.badges ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8 animate-pop-in">
        <div className="inline-block bg-white/80 px-4 py-1 rounded-full text-sm font-bold mb-3">Peta Petualangan</div>
        <h1 className="text-4xl md:text-6xl font-extrabold">Dunia Gerak</h1>
        <p className="text-muted-foreground mt-2">Pilih dunia dan kumpulkan semua badge!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {worlds.map((w) => {
          const earnedCount = w.activities.filter((a) => badges.includes(a.badgeId)).length;
          const pct = Math.round((earnedCount / w.activities.length) * 100);
          return (
            <Link key={w.id} href={`/worlds/${w.id}`} className="block group">
              <div className="relative rounded-[2rem] overflow-hidden text-white shadow-pop border-4 border-white hover:scale-[1.02] transition-transform" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/world-map.jpg')" }} />
                <div className={`absolute inset-0 ${w.gradient} opacity-70`} />
                <div className="absolute inset-0 frosted-overlay" />
                <div className="relative p-6 flex flex-col justify-end min-h-[320px]">
                  <div className="flex items-start justify-between absolute top-5 left-6 right-6">
                    <div className="text-6xl drop-shadow-md animate-float">{w.emoji}</div>
                    <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold border border-white/30">
                      {earnedCount}/{w.activities.length} Badge
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h2 className="text-3xl font-extrabold drop-shadow-md">{w.name}</h2>
                    <p className="text-sm opacity-90 mt-1 drop-shadow-sm">{w.tagline}</p>
                    <div className="mt-4">
                      <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-xs font-bold mt-1.5 opacity-90">{pct}% selesai</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {w.activities.map((a) => {
                        const earned = badges.includes(a.badgeId);
                        return (
                          <div key={a.id} className={`bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center border border-white/20 ${earned ? 'ring-2 ring-white' : 'opacity-60'}`}>
                            <div className="text-lg">{a.icon}</div>
                            <div className="text-[10px] font-bold mt-0.5">{a.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
