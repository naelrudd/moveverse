'use client';

import Link from 'next/link';
import { worlds } from '@/lib/worlds';
import { Lock } from 'lucide-react';

export default function WorldsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8 animate-pop-in">
        <div className="inline-block bg-white/80 px-4 py-1 rounded-full text-sm font-bold mb-3">🗺️ Adventure Map</div>
        <h1 className="text-4xl md:text-6xl font-extrabold">Choose Your World</h1>
        <p className="text-muted-foreground mt-2">Travel between 5 magical lands and recover all 5 Crystals.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {worlds.map((w) => (
          <Link
            key={w.id}
            href={w.unlocked ? `/worlds/${w.id}` : '#'}
            className={`group relative rounded-3xl overflow-hidden p-6 ${w.gradient} text-white shadow-pop border-4 border-white hover:scale-[1.02] transition-transform ${!w.unlocked ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="text-6xl drop-shadow-md">{w.emoji}</div>
              {!w.unlocked && (
                <div className="bg-black/30 rounded-full p-2"><Lock className="w-5 h-5" /></div>
              )}
            </div>
            <div className="mt-4">
              <div className="text-xs uppercase font-bold opacity-90">World {w.number} · {w.theme}</div>
              <h3 className="text-2xl font-extrabold leading-tight mt-1">{w.name}</h3>
              <p className="text-sm opacity-90 mt-1">{w.tagline}</p>
            </div>
            <div className="mt-5">
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${w.progress}%` }} />
              </div>
              <div className="flex justify-between text-xs font-bold mt-1 opacity-90">
                <span>{w.progress}% complete</span>
                <span>🪙 {w.rewards.coins}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
