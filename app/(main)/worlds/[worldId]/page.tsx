'use client';

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { worlds } from '@/lib/worlds';
import { ArrowLeft, Trophy, Sparkles, Zap } from 'lucide-react';

export default function WorldDetailPage() {
  const params = useParams();
  const world = worlds.find((w) => w.id === params.worldId);

  if (!world) return notFound();

  return (
    <div className={`min-h-[80vh] ${world.gradient} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-white/10" />
      <div className="relative max-w-6xl mx-auto px-4 py-10 text-white">
        <Link href="/worlds" className="inline-flex items-center gap-2 font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition mb-6 w-fit">
          <ArrowLeft className="w-4 h-4" /> All Worlds
        </Link>

        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center mb-10">
          <div className="animate-pop-in">
            <div className="text-7xl mb-2 drop-shadow-lg">{world.emoji}</div>
            <div className="text-sm uppercase font-bold opacity-90">World {world.number} · {world.theme}</div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-none">{world.name}</h1>
            <p className="text-xl mt-2 opacity-95">{world.tagline}</p>
          </div>
          <div className="text-9xl drop-shadow-2xl animate-float hidden md:block">🦊</div>
        </div>

        {/* Activities */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {world.activities.map((a: string, i: number) => (
            <div key={a} className="bg-white text-foreground rounded-3xl p-5 shadow-pop border-4 border-white animate-pop-in" style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-muted-foreground">CHALLENGE {i + 1}</div>
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <h3 className="text-xl font-extrabold">{a}</h3>
              <p className="text-sm text-foreground/70 mt-1">Tap to play. Earn XP and coins.</p>
              <button className="mt-4 rounded-full font-bold gradient-sunset text-white border-0 px-4 py-2 text-sm">Play ▶</button>
            </div>
          ))}
        </div>

        {/* Boss + Rewards */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-foreground/90 text-white rounded-3xl p-6 shadow-pop">
            <div className="flex items-center gap-2 text-sunny font-bold uppercase text-xs">
              <Zap className="w-4 h-4" /> Boss Challenge
            </div>
            <h3 className="text-2xl font-extrabold mt-1">{world.boss}</h3>
            <p className="opacity-80 text-sm mt-1">Defeat the boss to claim the Crystal Fragment!</p>
            <button className="mt-4 rounded-full font-bold gradient-gold border-0 text-foreground px-4 py-2">Challenge Boss</button>
          </div>
          <div className="bg-white text-foreground rounded-3xl p-6 shadow-pop">
            <div className="flex items-center gap-2 text-accent font-bold uppercase text-xs">
              <Trophy className="w-4 h-4" /> Rewards
            </div>
            <ul className="mt-2 space-y-2 font-bold">
              <li>🏅 {world.rewards.badge} Badge</li>
              <li>🪙 {world.rewards.coins} Coins</li>
              <li>💎 {world.rewards.crystal} Fragment</li>
            </ul>
            <div className="mt-4 text-sm">
              <div className="font-bold mb-1">Skills you&apos;ll grow:</div>
              <div className="flex flex-wrap gap-2">
                {world.skills.map((s: string) => (
                  <span key={s} className="bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
