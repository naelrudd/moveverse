'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { world } from '@/lib/worlds';

export default function WorldsPage() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const badges = userData?.badges ?? [];
  const earnedCount = world.activities.filter((a) => badges.includes(a.badgeId)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8 animate-pop-in">
        <div className="inline-block bg-white/80 px-4 py-1 rounded-full text-sm font-bold mb-3">Peta Petualangan</div>
        <h1 className="text-4xl md:text-6xl font-extrabold">Dunia Gerak Non-Lokomotor</h1>
        <p className="text-muted-foreground mt-2">Kuasai 6 gerakan dasar dan kumpulkan semua badge!</p>
      </div>

      {/* Single World Card */}
      <Link href={`/worlds/${world.id}`} className="block group">
        <div className={`relative rounded-[2rem] overflow-hidden ${world.gradient} text-white shadow-pop border-4 border-white hover:scale-[1.01] transition-transform p-8`}>
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="text-8xl drop-shadow-md">{world.emoji}</div>
              <div className="bg-white/20 rounded-full px-4 py-2 text-sm font-bold">
                {earnedCount}/{world.activities.length} Badge
              </div>
            </div>
            <h2 className="text-4xl font-extrabold mt-4">{world.name}</h2>
            <p className="text-lg opacity-95 mt-1">{world.tagline}</p>

            {/* Progress */}
            <div className="mt-6">
              <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(earnedCount / world.activities.length) * 100}%` }}
                />
              </div>
              <div className="text-sm font-bold mt-2 opacity-90">
                {Math.round((earnedCount / world.activities.length) * 100)}% selesai
              </div>
            </div>

            {/* Activities preview */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
              {world.activities.map((a) => {
                const earned = badges.includes(a.badgeId);
                return (
                  <div key={a.id} className={`bg-white/20 rounded-2xl p-3 text-center ${earned ? 'ring-2 ring-white' : 'opacity-60'}`}>
                    <div className="text-2xl">{a.icon}</div>
                    <div className="text-xs font-bold mt-1">{a.name}</div>
                    {earned && <div className="text-[10px] mt-0.5">✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
