'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { worlds } from '@/lib/worlds';

export default function WorldsPage() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const badges = userData?.badges ?? [];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-10">
      {/* Cloud decorations */}
      <svg className="fixed top-16 left-4 w-24 h-12 animate-float-cloud pointer-events-none opacity-30" viewBox="0 0 100 50" fill="white"><ellipse cx="50" cy="30" rx="45" ry="20" /><ellipse cx="30" cy="25" rx="25" ry="15" /><ellipse cx="72" cy="28" rx="28" ry="14" /></svg>
      <svg className="fixed top-32 right-8 w-20 h-10 animate-float-cloud-reverse pointer-events-none opacity-25" viewBox="0 0 100 50" fill="white"><ellipse cx="50" cy="30" rx="40" ry="18" /><ellipse cx="30" cy="25" rx="25" ry="15" /><ellipse cx="70" cy="28" rx="28" ry="14" /></svg>

      <div className="text-center mb-6 sm:mb-8 animate-pop-in relative">
        <div className="w-14 h-14 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-1 shadow-soft overflow-hidden mx-auto mb-3 animate-mascot-float">
          <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
        </div>
        <div className="inline-block bg-white/80 px-4 py-1 rounded-full text-sm font-bold mb-3">🗺️ Peta Petualangan</div>
        <h1 className="text-4xl md:text-6xl font-extrabold">Dunia Gerak</h1>
        <p className="text-muted-foreground mt-2">Pilih dunia dan kumpulkan semua badge!</p>
        {/* Star decorations */}
        <span className="absolute -top-2 left-1/4 text-lg animate-twinkle text-yellow-500 pointer-events-none">⭐</span>
        <span className="absolute top-2 right-1/4 text-sm animate-twinkle text-amber-400 pointer-events-none" style={{ animationDelay: '0.7s' }}>✨</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {worlds.map((w, i) => {
          const earnedCount = w.activities.filter((a) => badges.includes(a.badgeId)).length;
          const pct = Math.round((earnedCount / w.activities.length) * 100);
          return (
            <Link key={w.id} href={`/worlds/${w.id}`} className="block group animate-slide-up" style={{ animationDelay: `${i * 0.12}s` } as React.CSSProperties}>
              <div className="relative rounded-[2rem] overflow-hidden text-white shadow-pop border-4 border-white hover:scale-[1.02] transition-all duration-200 interactive-card" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${w.bgImage}')` }} />
                <div className={`absolute inset-0 ${w.gradient} opacity-50`} />
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
                            {a.iconImage ? (
                              <div className="w-8 h-8 relative mx-auto">
                                <Image src={a.iconImage} alt={a.name} fill className="object-contain" />
                              </div>
                            ) : (
                              <div className="text-lg">{a.icon}</div>
                            )}
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
