'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { worlds, ALL_ACTIVITIES } from '@/lib/worlds';
// ponytail: useState/useEffect not needed; removed

/* ── Inline confetti burst component ── */
function ConfettiBurst() {
  const particles = ['🟡', '🔵', '🟢', '🟣', '🔴', '⭐', '✨', '💫', '🌟', '💎'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((c, i) => (
        <span
          key={i}
          className="absolute text-sm animate-confetti-long"
          style={{
            left: `${5 + i * 10}%`,
            animationDelay: `${i * 0.25}s`,
            opacity: 0.7,
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

/* ── Sparkle dot ── */
function Sparkle({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <span
      className={`absolute text-yellow-300 animate-sparkle pointer-events-none ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      ✦
    </span>
  );
}

/* ── Floating MOVA tip bubble ── */
function MovaTip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 animate-slide-up" style={{ animationDelay: '0.8s' }}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-soft animate-float flex-shrink-0 overflow-hidden">
        <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 shadow-soft text-xs font-bold text-foreground/80 relative">
        <span className="absolute -left-1 top-3 w-2 h-2 bg-white rotate-45 shadow-soft" />
        {text}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const badges = userData?.badges ?? [];
  const activityLevels = userData?.activityLevels ?? {};
  const totalBadges = ALL_ACTIVITIES.length;
  const levelStatus = useQuery(api.users.getLevelStatus, userData?._id ? { userId: userData._id } : 'skip');
  const sideQuests = useQuery(
    api.sideQuests.getByChildActive,
    userData?._id ? { childId: userData._id } : 'skip'
  );
  const markQuestComplete = useMutation(api.sideQuests.markComplete);

  const xp = userData?.xp ?? 0;
  const currentLevel = levelStatus?.level ?? userData?.level ?? 1;
  const needsTutor = levelStatus?.needsTutor ?? false;
  const nextTarget = levelStatus?.nextLevelXp ?? 50;
  const xpToFull = levelStatus?.xpToFull ?? 0;
  const xpToCond = levelStatus?.xpToCond ?? 0;
  const xpPercent = Math.min(nextTarget > 0 ? (xp / nextTarget) * 100 : 100, 100);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 bg-theme-forest min-h-screen">
      {/* ══════════════════════════════════════════
          HERO — Super kid entrance
          ══════════════════════════════════════════ */}
      <div className="relative rounded-[2.5rem] p-8 shadow-pop border-4 border-white animate-pop-in overflow-hidden glass-card" style={{ background: 'linear-gradient(135deg, oklch(0.92 0.12 230), oklch(0.95 0.1 60), oklch(0.93 0.12 310))' }}>
        <ConfettiBurst />

        {/* Sparkles around MOVA */}
        <Sparkle className="top-4 left-8 text-lg" delay={0} />
        <Sparkle className="top-12 left-24 text-xs" delay={0.4} />
        <Sparkle className="bottom-8 left-16 text-base" delay={0.8} />
        <Sparkle className="top-6 right-20 text-sm" delay={1.2} />
        <Sparkle className="bottom-4 right-12 text-lg" delay={0.6} />

        <div className="flex items-center gap-6 relative z-10">
          {/* MOVA — 2x bigger, stronger dance */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 p-1.5 shadow-pop animate-dance-slow flex-shrink-0 overflow-hidden relative">
              <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain drop-shadow-lg" />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full animate-pulse-glow" />
            </div>
            {/* Crystals — bigger, shinier */}
            <div className="relative">
              <img src="/crystals.png" alt="Energy Crystals" className="h-20 w-auto drop-shadow-lg animate-float" />
              <Sparkle className="-top-2 -right-1 text-xl" delay={0.3} />
              <Sparkle className="bottom-2 -left-2 text-sm" delay={1.0} />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
              <span className="text-5xl inline-block animate-wobble">{userData?.avatar || '🦊'}</span>
              Halo, {userData?.name || 'Explorer'}! 🎉
            </h1>
            <p className="text-base font-bold text-foreground/60 mt-1">
              Siap petualangan seru hari ini? 🚀
            </p>
            {/* Floating tip */}
            <div className="mt-3">
              <MovaTip text="💡 Coba selesaikan 1 aktivitas hari ini untuk dapat XP!" />
            </div>
          </div>

          <Link
            href="/profile"
            className="text-sm font-extrabold px-5 py-2.5 rounded-full bg-white shadow-soft hover:shadow-pop hover:scale-105 transition-all border-2 border-primary/20"
          >
            👤 Profil
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS — Candy / Game style
          ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '⭐', l: 'Level', v: `Lv ${currentLevel}`, gradient: 'linear-gradient(135deg, #a78bfa, #818cf8, #6366f1)', border: 'border-violet-300' },
          { icon: '✨', l: 'XP', v: xp.toLocaleString(), gradient: 'linear-gradient(135deg, #fb923c, #f97316, #ea580c)', border: 'border-orange-300' },
          { icon: '🪙', l: 'Koin', v: (userData?.coins || 0).toLocaleString(), gradient: 'linear-gradient(135deg, #facc15, #eab308, #ca8a04)', border: 'border-yellow-300' },
          { icon: '🏅', l: 'Badge', v: `${badges.length}/${totalBadges}`, gradient: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)', border: 'border-green-300' },
        ].map((s, i) => (
          <div
            key={s.l}
            className="text-white rounded-3xl p-5 shadow-pop animate-slide-up relative overflow-hidden group hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-default border-2 border-white/30"
            style={{
              background: s.gradient,
              animationDelay: `${i * 0.1}s`,
            } as React.CSSProperties}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-3xl" />
            {/* Big icon */}
            <div className="text-3xl mb-1 drop-shadow-md relative z-10">{s.icon}</div>
            <div className="text-xs font-extrabold opacity-80 relative z-10 uppercase tracking-wider">{s.l}</div>
            <div className="text-2xl font-extrabold relative z-10 drop-shadow-sm">{s.v}</div>
            {/* Corner sparkle */}
            <Sparkle className="top-2 right-2 text-xs" delay={i * 0.3} />
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          LEVEL PROGRESS — Moveverse leveling
          ══════════════════════════════════════════ */}
      <div className={`bg-white rounded-3xl p-5 shadow-pop border-2 relative overflow-hidden ${needsTutor ? 'border-amber-300' : 'border-primary/10'}`}>
        {/* Stars background decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {['⭐', '✨', '💫', '⭐', '✨'].map((s, i) => (
            <span key={i} className="absolute text-xs" style={{ left: `${10 + i * 20}%`, top: `${20 + (i % 2) * 50}%` }}>{s}</span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="font-extrabold text-lg">⭐ Level {currentLevel}</span>
          <span className="text-xs font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {xp} / {nextTarget} XP
          </span>
        </div>

        {/* Energy bar with glow */}
        <div className="relative w-full h-7 bg-muted rounded-full overflow-hidden shadow-inner border-2 border-primary/5">
          <div
            className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${needsTutor ? '' : 'animate-pulse-glow'}`}
            style={{
              width: `${xpPercent}%`,
              background: needsTutor
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d)'
                : 'linear-gradient(90deg, #6366f1, #a78bfa, #c084fc, #e879f9)',
            }}
          >
            {/* Animated shine */}
            <div className="absolute inset-0 animate-shimmer" />
            {/* Stars inside bar */}
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs animate-sparkle">⭐</span>
          </div>
          {/* Star markers along bar */}
          {[25, 50, 75].map((pos) => (
            <div key={pos} className="absolute top-1/2 -translate-y-1/2 text-xs opacity-40" style={{ left: `${pos}%` }}>✦</div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 relative z-10">
          <div className="text-xs font-bold text-foreground/60">
            {currentLevel >= 5 ? (
              <span className="text-amber-500">🏆 Max Level tercapai! Kamu hebat!</span>
            ) : (
              <span>🔥 {xpToFull} XP lagi untuk Lulus Penuh ke Level {currentLevel + 1}!</span>
            )}
          </div>
          <div className="text-xs font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            🏅 {badges.length}/{totalBadges} selesai
          </div>
        </div>

        {/* Conditional pass warning */}
        {needsTutor && (
          <div className="mt-3 p-3 bg-amber-50 rounded-2xl border-2 border-amber-200 text-xs font-bold text-amber-700 flex items-center gap-2 animate-wiggle">
            ⚠️ Kamu naik Level {currentLevel} dengan jalur Dampingan Guru — kurang {xpToFull} poin dari target penuh ({nextTarget}). Ayo kejar lagi! 💪
          </div>
        )}

        {/* Next level threshold info */}
        {currentLevel < 5 && !needsTutor && (
          <div className="mt-2 text-[10px] font-bold text-muted-foreground/50 text-center">
            Jalur Dampingan: {xpToCond} XP lagi (Level {currentLevel + 1})
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          PILIH DUNIA — Section header
          ══════════════════════════════════════════ */}
      <div className="relative rounded-[2rem] overflow-hidden shadow-pop border-4 border-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/world-map.jpg')" }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, oklch(0.5 0.2 235 / 0.7), oklch(0.5 0.15 310 / 0.7))' }} />
        <div className="relative p-6 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-2xl text-white drop-shadow-md">🗺️ Pilih Dunia Petualangan!</h2>
            <p className="text-sm text-white/80 font-bold">Klik aktivitas untuk mulai latihan seru! 🎮</p>
          </div>
          <Link
            href="/worlds"
            className="px-5 py-2.5 rounded-full font-extrabold text-sm bg-white text-primary shadow-pop hover:scale-110 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 border-2 border-white"
          >
            Semua Dunia ✨ →
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          WORLD CARDS — Chibi, big gradients, sparkle badges
          ══════════════════════════════════════════ */}
      {worlds.map((w, wi) => {
        const worldBadges = w.activities.filter((a) => badges.includes(a.badgeId)).length;
        // Chibi emoji map
        const chibiMap: Record<string, { chibi: string; bg: string; accent: string }> = {
          'pulau-naga': { chibi: '🐲', bg: 'linear-gradient(135deg, #818cf8, #6366f1, #4f46e5)', accent: 'border-indigo-300' },
          'hutan-harimau': { chibi: '🐯', bg: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)', accent: 'border-green-300' },
          'gunung-elang': { chibi: '🦅', bg: 'linear-gradient(135deg, #fb923c, #f97316, #ea580c)', accent: 'border-orange-300' },
        };
        const chibi = chibiMap[w.id] || { chibi: w.emoji, bg: 'gradient-sky', accent: 'border-blue-300' };

        return (
          <section key={w.id} className="animate-slide-up" style={{ animationDelay: `${wi * 0.15}s` } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-xl">
                <span className="text-3xl mr-2 animate-wobble inline-block">{chibi.chibi}</span>
                Dunia {w.name}
              </h2>
              <Link href={`/worlds/${w.id}`} className="text-sm font-extrabold text-primary hover:scale-105 transition-transform">
                Lihat Semua ✨ →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {w.activities.map((a, ai) => {
                const earned = badges.includes(a.badgeId);
                const actLevel = activityLevels[a.id] ?? 0;
                const maxLvl = a.maxLevel ?? 5;
                return (
                  <Link
                    key={a.id}
                    href={`/worlds/${w.id}`}
                    className={`block rounded-3xl p-5 shadow-soft hover:shadow-pop transition-all duration-300 border-2 hover:-translate-y-1.5 hover:scale-[1.03] group relative overflow-hidden ${
                      earned
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-transparent hover:border-primary/20'
                    }`}
                    style={{ animationDelay: `${ai * 0.08}s` } as React.CSSProperties}
                  >
                    {/* Gradient accent top strip */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl opacity-60"
                      style={{ background: chibi.bg }}
                    />

                    <div className="flex items-center justify-between">
                      <div className="text-4xl group-hover:animate-bounce-sm drop-shadow-sm">{a.icon}</div>
                      {earned && (
                        <span className="text-xs font-extrabold text-green-700 bg-green-100 px-2.5 py-1 rounded-full animate-pop-in border border-green-200 flex items-center gap-1">
                          <span className="animate-sparkle inline-block">✨</span> Dapat!
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold mt-2 text-base">{a.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-bold">{a.description}</p>
                    <div className="mt-2 text-[10px] font-extrabold text-primary bg-primary/5 rounded-xl px-2.5 py-1.5 inline-block">
                      🎯 {a.objective}
                    </div>
                    <div className="mt-2 text-xs font-extrabold" style={{ color: 'oklch(0.7 0.2 60)' }}>
                      +{a.xpReward} XP ⚡
                    </div>

                    {/* Activity level bar */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: maxLvl }, (_, i) => (
                          <span key={i} className={`text-xs ${i < actLevel ? 'opacity-100' : 'opacity-25'}`}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      {actLevel > 0 && (
                        <span className="text-[10px] font-extrabold text-amber-600">
                          Lv.{actLevel}
                        </span>
                      )}
                      {actLevel === 0 && (
                        <span className="text-[10px] font-extrabold text-gray-400">
                          Belum mulai
                        </span>
                      )}
                    </div>
                    {actLevel > 0 && actLevel < maxLvl && (
                      <div className="mt-1 text-[10px] font-bold text-primary/60">
                        {a.levelNames?.[actLevel] ?? `Level ${actLevel + 1}`} → {a.levelNames?.[actLevel] ?? `Level ${actLevel + 2}`}
                      </div>
                    )}
                    {actLevel === maxLvl && (
                      <div className="mt-1 text-[10px] font-extrabold text-purple-600">
                        🏆 {a.levelNames?.[maxLvl - 1] ?? 'MAX'} — Sempurna!
                      </div>
                    )}

                    {/* Hover bounce MOVA tip */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 animate-bounce-sm overflow-hidden shadow-sm">
                        <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* World badge counter with sparkle */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-soft text-xs font-extrabold border border-primary/10">
                <span className="animate-sparkle inline-block">🏅</span>
                <span>{worldBadges}/{w.activities.length} badge terkumpul</span>
                {worldBadges === w.activities.length && (
                  <span className="animate-celebrate inline-block ml-1">🏆</span>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* ══════════════════════════════════════════
          SIDE QUEST — Candy card
          ══════════════════════════════════════════ */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-pop border-2 border-primary/10 relative overflow-hidden">
          {/* Corner decorations */}
          <Sparkle className="top-3 right-4 text-lg" delay={0.2} />
          <Sparkle className="bottom-4 left-6 text-sm" delay={0.7} />

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-xl">🎯 Side Quest di Rumah</h2>
            <span className="text-xs font-extrabold px-3 py-1.5 rounded-full text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #fb923c, #f97316, #ea580c)' }}
            >
              Tambahan XP! ⚡
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4 font-bold">
            Tugas tambahan dari orang tua — selesaikan untuk poin ekstra! 🌟
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(sideQuests ?? []).length === 0 ? (
              <div className="sm:col-span-2 p-8 text-center bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/20">
                <div className="text-3xl mb-2 animate-float">📋</div>
                <div className="text-xs font-bold text-muted-foreground">Belum ada side quest dari orang tua</div>
                <div className="text-[10px] text-muted-foreground/60 mt-1">Nanti orang tua bisa kasih tugas tambahan lho!</div>
              </div>
            ) : (
              (sideQuests ?? []).map((q) => (
                <div
                  key={q._id}
                  className={`p-4 rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] ${
                    q.completed
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-muted/40 border-2 border-transparent hover:border-primary/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${
                    q.completed ? 'text-white' : 'bg-white shadow-soft'
                  }`}
                    style={q.completed ? { background: 'linear-gradient(135deg, #4ade80, #22c55e)' } : {}}
                  >
                    {q.completed ? '✓' : q.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${q.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {q.title}
                    </div>
                    <div className="text-xs font-extrabold" style={{ color: 'oklch(0.7 0.2 60)' }}>
                      +{q.xpReward} XP ⚡
                    </div>
                  </div>
                  {!q.completed && (
                    <button
                      onClick={async () => {
                        if (userData?._id) await markQuestComplete({ questId: q._id, childId: userData._id });
                      }}
                      className="px-4 py-1.5 text-xs font-extrabold rounded-full text-white shadow-soft hover:shadow-pop hover:scale-105 active:scale-95 transition-all"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      Selesai ✅
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BADGE KOLEKSI — Sparkle grid
          ══════════════════════════════════════════ */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-pop border-2 border-primary/10">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="font-extrabold text-xl">🏅 Badge Koleksiku</h2>
            <span className="text-xs font-extrabold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {badges.length} terkumpul
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3">
            {ALL_ACTIVITIES.map((a) => {
              const earned = badges.includes(a.badgeId);
              return (
                <div
                  key={a.id}
                  className={`rounded-2xl p-3 text-center transition-all relative ${
                    earned
                      ? 'bg-amber-50 border-2 border-amber-200 scale-105 shadow-soft hover:scale-110'
                      : 'bg-muted/40 opacity-40 border-2 border-transparent'
                  }`}
                >
                  <div className="text-2xl mb-1 drop-shadow-sm">{earned ? a.icon : '🔒'}</div>
                  <div className="font-extrabold text-[10px] leading-tight">{a.badgeName}</div>
                  {earned && <Sparkle className="-top-1 -right-1 text-xs" delay={(a.id.charCodeAt(0) % 20) / 10} />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FLOATING MOVA TIPS — Bottom of page
          ══════════════════════════════════════════ */}
      <div className="flex justify-center animate-slide-up" style={{ animationDelay: '1s' }}>
        <MovaTip text="🦊 Ayo terus bergerak! Semakin banyak aktivitas, semakin banyak badge dan XP! 💪" />
      </div>
    </div>
  );
}
