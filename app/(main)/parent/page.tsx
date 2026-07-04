'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { worlds, ALL_ACTIVITIES } from '@/lib/worlds';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

/* ── Confetti Burst ── */
function ConfettiBurst() {
  const particles = ['🟡','🔵','🟢','🟣','🔴','⭐','✨','💫','🌟','💎'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute text-xl animate-confetti-long"
          style={{
            left: `${5 + i * 9.5}%`,
            top: `${-5 + (i % 3) * 10}%`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${3 + (i % 3)}s`,
          }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

/* ── Sparkle Dots ── */
function SparkleRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-2 justify-center mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="text-yellow-300 text-xs animate-sparkle"
          style={{ animationDelay: `${i * 0.4}s` }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

/* ── World chibi emojis ── */
const worldChibi: Record<string, string> = {
  'pulau-naga': '🐲',
  'hutan-harimau': '🐯',
  'gunung-elang': '🦅',
};

/* ── Main Page ── */
export default function ParentDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const children = useQuery(api.users.getChildren, userData?._id ? { parentId: userData._id } : 'skip');
  const linkChildMut = useMutation(api.users.linkChild);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [nisInput, setNisInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [extraChildren, setExtraChildren] = useState<{ _id: string; name: string; avatar: string; level: number; xp: number; coins: number; badges?: string[] }[]>([]);

  const childList = [...((children ?? []).filter((c): c is NonNullable<typeof c> => c !== null)), ...extraChildren];
  const activeChildId = selectedChildId || childList[0]?._id || null;
  const activeChild = childList.find((c) => c && c._id === activeChildId);

  const sideQuests = useQuery(
    api.sideQuests.getByParentAndChild,
    activeChildId && userData?._id ? { parentId: userData._id, childId: activeChildId as any } : 'skip'
  );
  const createSideQuest = useMutation(api.sideQuests.create);
  const markQuestComplete = useMutation(api.sideQuests.markCompleteByParent);
  const removeQuest = useMutation(api.sideQuests.remove);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestXp, setNewQuestXp] = useState(15);
  const [showQuestForm, setShowQuestForm] = useState(false);

  const motorikData = [
    { skill: 'Keseimbangan', value: 78, avg: 65, prev: 72 },
    { skill: 'Koordinasi', value: 65, avg: 58, prev: 60 },
    { skill: 'Kelincahan', value: 72, avg: 63, prev: 68 },
    { skill: 'Kekuatan', value: 60, avg: 55, prev: 55 },
    { skill: 'Fleksibilitas', value: 55, avg: 52, prev: 50 },
  ];

  const weeklyActivity = [
    { d: 'Sen', sekolah: 45, rumah: 30 },
    { d: 'Sel', sekolah: 60, rumah: 20 },
    { d: 'Rab', sekolah: 50, rumah: 45 },
    { d: 'Kam', sekolah: 40, rumah: 35 },
    { d: 'Jum', sekolah: 55, rumah: 25 },
    { d: 'Sab', sekolah: 0, rumah: 60 },
    { d: 'Min', sekolah: 0, rumah: 50 },
  ];

  const getSportRecommendations = () => {
    const kaki = (motorikData.find((m) => m.skill === 'Kelincahan')?.value ?? 0) + (motorikData.find((m) => m.skill === 'Kekuatan')?.value ?? 0);
    const tangan = (motorikData.find((m) => m.skill === 'Koordinasi')?.value ?? 0) + (motorikData.find((m) => m.skill === 'Fleksibilitas')?.value ?? 0);
    const badan = (motorikData.find((m) => m.skill === 'Keseimbangan')?.value ?? 0);

    const recs = [];
    if (kaki >= tangan) {
      recs.push({ name: 'Lari Ringan', icon: '🏃', reason: 'Kelincahan kaki sudah bagus, tambah latihan lari', kategori: 'Kaki' });
      recs.push({ name: 'Skipping', icon: '🪢', reason: 'Koordinasi kaki & lompat', kategori: 'Kaki' });
      recs.push({ name: 'Sepak Bola', icon: '⚽', reason: 'Teknik tendangan', kategori: 'Kaki' });
    } else {
      recs.push({ name: 'Bulu Tangkis', icon: '🏸', reason: 'Koordinasi tangan sudah bagus', kategori: 'Tangan' });
      recs.push({ name: 'Volli', icon: '🏐', reason: 'Kekuatan tangan & lompat', kategori: 'Tangan' });
      recs.push({ name: 'Lempar Tangkap', icon: '🤾', reason: 'Akurasi lemparan', kategori: 'Tangan' });
    }
    if (badan >= 65) {
      recs.push({ name: 'Senam Ringan', icon: '🤸', reason: 'Keseimbangan tubuh baik', kategori: 'Badan' });
    } else {
      recs.push({ name: 'Yoga Anak', icon: '🧘', reason: 'Perbaiki keseimbangan', kategori: 'Badan' });
    }
    return recs;
  };

  const linkChild = async () => {
    if (!nisInput.trim() || !userData?._id) return;
    setLinkError(null);
    const child = await linkChildMut({ parentId: userData._id, childNis: nisInput.trim() });
    if (child) {
      const alreadyInList = childList.some((c) => c._id === child._id);
      if (!alreadyInList) {
        setExtraChildren((prev) => [child, ...prev]);
      }
      setNisInput('');
      setSelectedChildId(child._id);
    } else {
      setLinkError('NIS tidak ditemukan. Pastikan NIS sudah terdaftar.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-theme-dragon min-h-screen" style={{ fontFamily: 'Nunito, sans-serif' }}>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative rounded-[2rem] overflow-hidden shadow-pop border-4 border-white animate-pop-in">
        {/* Gradient rainbow background */}
        <div className="absolute inset-0" style={{
          background: 'oklch(0.82 0.12 310) 0%, oklch(0.78 0.14 330) 25%, oklch(0.75 0.16 350) 50%, oklch(0.78 0.15 25) 75%, oklch(0.82 0.14 55) 100%',
          backgroundSize: '200% 200%',
        }} />
        <div className="absolute inset-0 bg-white/30" />

        <ConfettiBurst />

        {/* Sparkle dots */}
        {[15, 30, 50, 70, 88].map((left, i) => (
          <span
            key={i}
            className="absolute text-yellow-300 text-sm animate-sparkle z-10"
            style={{ left: `${left}%`, top: `${10 + (i % 3) * 15}%`, animationDelay: `${i * 0.5}s` }}
          >
            ✦
          </span>
        ))}

        <div className="relative z-10 p-6 md:p-8">
          {/* MOVA + Title Row */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            {/* MOVA fox — big! */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-soft overflow-hidden animate-dance-slow border-4 border-white">
                <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
              </div>
              {/* pulse glow ring */}
              <div className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none" />
              {/* Crystals */}
              <div className="absolute -bottom-4 -right-6">
                <img src="/crystals.png" alt="" className="h-20 w-auto animate-float relative" style={{ animationDelay: '0.5s' }} />
                <span className="absolute top-0 left-2 text-xs animate-sparkle text-yellow-300" style={{ animationDelay: '0.2s' }}>✨</span>
              </div>
            </div>

            {/* Text */}
            <div className="text-center md:text-left flex-1">
              <h1
                className="text-4xl md:text-5xl font-extrabold drop-shadow-sm"
                style={{ fontFamily: 'Fredoka, sans-serif', background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Halo, {userData?.name || 'Orang Tua'}! 👋
              </h1>
              <p className="text-lg font-bold text-foreground/70 mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Pantau petualangan anak hari ini! 🚀
              </p>
            </div>
          </div>

          {/* Child selector buttons */}
          {childList.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
              {childList.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedChildId(c._id)}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all border-4 border-white shadow-soft ${
                    activeChildId === c._id
                      ? 'gradient-magic text-white animate-bounce-sm scale-105'
                      : 'bg-white/80 hover:bg-white hover:scale-105'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {c.avatar} {c.name}
                </button>
              ))}
            </div>
          )}

          {/* NIS Input — Candy Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 shadow-soft border-2 border-white max-w-xl mx-auto md:mx-0">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-bold text-foreground/80 whitespace-nowrap">🧒 Tambah Anak:</span>
              <input
                value={nisInput}
                onChange={(e) => { setNisInput(e.target.value); setLinkError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && linkChild()}
                placeholder="Masukkan NIS anak..."
                className="flex-1 p-2.5 rounded-xl border-2 border-purple-200 bg-white font-bold text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
              <button
                onClick={linkChild}
                className="px-5 py-2.5 rounded-full font-bold gradient-grass text-white text-sm shadow-soft hover:shadow-pop hover:scale-105 transition-all"
              >
                Tambah ✨
              </button>
            </div>
            {linkError && (
              <div className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                ⚠️ {linkError}
              </div>
            )}
          </div>

          {/* Floating MovaTip */}
          <div className="mt-4 flex justify-center">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-5 py-2.5 shadow-soft inline-flex items-center gap-2 animate-wobble">
              <span className="text-lg">💡</span>
              <span className="text-xs font-bold text-yellow-700">
                Masukkan NIS anak untuk menghubungkan akun!
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STAT CARDS (Candy Style) ═══════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Level', v: `Level ${activeChild?.level ?? 0}`, icon: '🏆', gradient: 'from-violet-500 to-purple-600' },
          { l: 'XP Total', v: (activeChild?.xp ?? 0).toLocaleString(), icon: '⚡', gradient: 'from-orange-400 to-red-500' },
          { l: 'Badge', v: `${(activeChild as any)?.badges?.length ?? 0}/${ALL_ACTIVITIES.length}`, icon: '🏅', gradient: 'from-yellow-400 to-amber-500' },
          { l: 'Dunia', v: '3 Dunia', icon: '🌍', gradient: 'from-green-400 to-emerald-500' },
        ].map((s, i) => (
          <div
            key={s.l}
            className={`relative rounded-3xl p-5 shadow-pop border-4 border-white overflow-hidden hover:scale-105 transition-all animate-slide-up group`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            {/* Sparkle */}
            <span className="absolute top-2 right-3 text-yellow-200 text-xs animate-sparkle" style={{ animationDelay: `${i * 0.3}s` }}>✦</span>
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-3xl drop-shadow-sm group-hover:animate-bounce-sm">{s.icon}</span>
              <div>
                <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide">{s.l}</div>
                <div className="text-2xl font-extrabold text-white drop-shadow-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>{s.v}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ═══════════════════ WORLD CARDS ═══════════════════ */}
      <section>
        <div className="rounded-[2rem] overflow-hidden shadow-pop mb-6 border-4 border-white">
          <div
            className="relative p-6"
            style={{ backgroundImage: "url('/world-map.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 via-pink-500/70 to-orange-500/60" />
            <div className="relative flex items-center gap-4">
              <img src="/crystals.png" alt="Crystals" className="h-16 w-auto animate-float drop-shadow-lg" />
              <div>
                <h3 className="font-extrabold text-2xl text-white drop-shadow-md" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  🌍 Dunia Petualangan Anak
                </h3>
                <p className="text-sm text-white/90 font-bold">3 dunia penuh seru! Lihat perkembangan buah hati 💖</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {worlds.map((w) => {
            const earnedCount = activeChild?.badges ? w.activities.filter((a) => (activeChild as any)?.badges?.includes(a.badgeId)).length : 0;
            const pct = Math.round((earnedCount / w.activities.length) * 100);
            return (
              <Link key={w.id} href={`/worlds/${w.id}`} className="block group">
                <div
                  className="relative rounded-[2rem] overflow-hidden text-white shadow-pop hover:shadow-pop border-4 border-white hover:scale-[1.02] transition-all duration-300"
                  style={{ minHeight: '340px' }}
                >
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/world-map.jpg')" }} />
                  <div className={`absolute inset-0 ${w.gradient} opacity-70`} />
                  <div className="absolute inset-0 frosted-overlay" />

                  {/* Chibi emoji floating top-left */}
                  <div className="absolute top-4 left-5 z-10">
                    <span className="text-5xl drop-shadow-md animate-float" style={{ animationDelay: '0.3s' }}>
                      {worldChibi[w.id] || w.emoji}
                    </span>
                  </div>

                  {/* Badge counter top-right frosted pill */}
                  <div className="absolute top-4 right-5 z-10 bg-white/25 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-bold border border-white/30 shadow-soft">
                    {earnedCount}/{w.activities.length} Badge 🏅
                  </div>

                  {/* Mini MOVA on hover */}
                  <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <img src="/mova-hero.png" alt="MOVA" className="w-10 h-10 rounded-full border-2 border-white shadow-soft animate-wobble" />
                  </div>

                  <div className="relative p-5 flex flex-col justify-end min-h-[340px] z-10">
                    <div className="mt-auto">
                      <h3 className="text-2xl font-extrabold drop-shadow-md" style={{ fontFamily: 'Fredoka, sans-serif' }}>{w.name}</h3>
                      <p className="text-xs opacity-90 mt-0.5 drop-shadow-sm font-bold">{w.tagline}</p>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                          <div className="h-full bg-white rounded-full transition-all shadow-inner" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-[10px] font-bold mt-1 opacity-80">{pct}% selesai ⭐</div>
                      </div>

                      {/* 3-col activity grid */}
                      <div className="grid grid-cols-3 gap-1.5 mt-3">
                        {w.activities.map((a) => {
                          const earned = (activeChild as any)?.badges?.includes(a.badgeId);
                          return (
                            <div
                              key={a.id}
                              className={`bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center border border-white/20 transition-all ${earned ? 'ring-2 ring-white shadow-soft' : 'opacity-60'}`}
                            >
                              <div className="text-lg">{a.icon}</div>
                              <div className="text-[9px] font-bold mt-0.5 leading-tight">{a.name}</div>
                              {earned && <div className="text-[8px] mt-0.5">✅</div>}
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
      </section>

      {/* ═══════════════════ ANALYSIS SECTION ═══════════════════ */}
      <section>
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Radar motorik — candy card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white relative overflow-hidden">
            <span className="absolute top-4 right-4 text-yellow-300 text-sm animate-sparkle">✦</span>
            <span className="absolute bottom-4 left-4 text-pink-300 text-xs animate-sparkle" style={{ animationDelay: '1s' }}>✦</span>
            <h3 className="font-extrabold text-xl mb-4 flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="text-2xl">📊</span> Analisis Perkembangan Motorik
            </h3>
            <div className="h-72">
              <ResponsiveContainer>
                <RadarChart data={motorikData}>
                  <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fontWeight: 700, fill: 'currentColor' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name="Sekarang" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} strokeWidth={2.5} />
                  <Radar name="Bulan Lalu" dataKey="prev" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center text-xs font-bold mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-500 inline-block" /> Sekarang</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 inline-block" style={{ borderTop: '1px dashed #94a3b8', height: 0 }} /> Bulan Lalu</span>
            </div>
            <div className="mt-4 space-y-2">
              {motorikData.map((m) => (
                <div key={m.skill} className="flex items-center gap-3 text-sm">
                  <span className="w-24 font-bold">{m.skill}</span>
                  <div className="flex-1 h-3 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all" style={{ width: `${m.value}%` }} />
                  </div>
                  <span className="font-bold w-8 text-right">{m.value}</span>
                  <span className={`text-xs font-bold ${m.value >= m.prev ? 'text-green-500' : 'text-red-400'}`}>
                    {m.value >= m.prev ? '▲' : '▼'} {Math.abs(m.value - m.prev)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hasil Rekaman AI — candy card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white relative overflow-hidden">
            <span className="absolute top-4 right-4 text-blue-300 text-sm animate-sparkle" style={{ animationDelay: '0.6s' }}>✦</span>
            <h3 className="font-extrabold text-xl mb-4 flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="text-2xl">📹</span> Hasil Rekaman AI
            </h3>
            <div className="space-y-3">
              {[
                { date: '2026-06-28', type: 'Meliuk', score: 82, durasi: '1:23' },
                { date: '2026-06-27', type: 'Menekuk', score: 75, durasi: '0:58' },
                { date: '2026-06-25', type: 'Memutar', score: 68, durasi: '2:01' },
                { date: '2026-06-22', type: 'Mengayun', score: 90, durasi: '1:45' },
              ].map((rec, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:from-purple-100 hover:to-pink-100 transition-all cursor-pointer border-2 border-transparent hover:border-purple-200 hover:shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-lg shadow-soft">🎥</div>
                    <div>
                      <div className="font-bold text-sm">{rec.type}</div>
                      <div className="text-xs text-muted-foreground font-semibold">{rec.date} · {rec.durasi}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${rec.score >= 80 ? 'text-green-500' : rec.score >= 65 ? 'text-amber-500' : 'text-red-400'}`}>
                      {rec.score}%
                    </span>
                    <button className="text-xs font-bold px-3 py-1.5 rounded-full gradient-magic text-white shadow-soft hover:shadow-pop hover:scale-105 transition-all">
                      Lihat 👀
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ REKOMENDASI ═══════════════════ */}
      <section>
        <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white relative overflow-hidden">
          <span className="absolute top-5 right-5 text-yellow-300 text-sm animate-sparkle">✦</span>
          <span className="absolute bottom-5 left-5 text-pink-300 text-xs animate-sparkle" style={{ animationDelay: '0.8s' }}>✦</span>

          {/* MOVA floating tip */}
          <div className="flex items-center gap-3 mb-5 bg-orange-50 rounded-2xl p-3 border-2 border-orange-200">
            <img src="/mova-hero.png" alt="MOVA" className="w-8 h-8 rounded-full animate-wobble flex-shrink-0" />
            <span className="text-xs font-bold text-orange-700">💡 MOVA kasih rekomendasi kegiatan seru buat {activeChild?.name || 'anak'}!</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-xl flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="text-2xl">🏠</span> Rekomendasi Kegiatan di Rumah
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full gradient-magic text-white shadow-soft">Berdasarkan Stat ✨</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getSportRecommendations().map((r) => (
              <div
                key={r.name}
                className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-5 hover:shadow-pop transition-all border-2 border-transparent hover:border-orange-200 hover:scale-105 group cursor-pointer"
              >
                <div className="text-4xl mb-2 group-hover:animate-bounce-sm">{r.icon}</div>
                <div className="font-extrabold text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>{r.name}</div>
                <div className="text-[10px] font-bold text-orange-500 mt-1 px-2 py-0.5 rounded-full bg-orange-100 inline-block">{r.kategori}</div>
                <div className="text-xs text-muted-foreground mt-1 font-semibold">{r.reason}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-semibold">* Rekomendasi ini hanya saran kegiatan tambahan di rumah, bukan bagian dari poin peserta didik 🏡</p>
        </div>
      </section>

      {/* ═══════════════════ SIDE QUEST ═══════════════════ */}
      <section>
        <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white relative overflow-hidden">
          <span className="absolute top-5 right-5 text-yellow-300 text-sm animate-sparkle" style={{ animationDelay: '0.4s' }}>✦</span>
          <span className="absolute bottom-5 left-5 text-green-300 text-xs animate-sparkle" style={{ animationDelay: '1.2s' }}>✦</span>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-xl flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="text-2xl">🎯</span> Side Quest di Rumah
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full gradient-sunset text-white shadow-soft">Tambahan Poin ⚡</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4 font-semibold">
            Bantu <span className="text-purple-600 font-extrabold">{activeChild?.name || 'anak'}</span> nambah poin dengan tugas tambahan di rumah! 💪
          </p>

          <div className="space-y-3">
            {(sideQuests ?? []).length === 0 && (
              <div className="p-8 text-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl border-2 border-dashed border-yellow-300">
                <img src="/mova-hero.png" alt="MOVA" className="w-16 h-16 mx-auto rounded-full animate-float mb-3" />
                <div className="font-extrabold text-sm text-orange-700" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  Belum ada side quest! 📋
                </div>
                <div className="text-xs text-muted-foreground font-semibold mt-1">Yuk buat tugas baru buat {activeChild?.name || 'anak'}! ✨</div>
              </div>
            )}

            {(sideQuests ?? []).map((q) => (
              <div
                key={q._id}
                className={`p-4 rounded-2xl flex items-center gap-3 border-2 transition-all ${
                  q.completed
                    ? 'bg-green-50 border-green-200 shadow-soft'
                    : 'bg-gradient-to-r from-orange-50 to-pink-50 border-orange-100 hover:border-orange-200 hover:shadow-soft'
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-soft ${q.completed ? 'gradient-grass text-white' : 'bg-white border-2 border-orange-200'}`}>
                  {q.completed ? '✅' : q.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-extrabold text-sm ${q.completed ? 'line-through text-muted-foreground' : ''}`} style={{ fontFamily: 'Fredoka, sans-serif' }}>{q.title}</div>
                  <div className="text-xs font-bold text-amber-500">+{q.xpReward} XP ⚡</div>
                </div>
                {!q.completed && (
                  <button
                    onClick={async () => {
                      if (!userData) return;
                      if (activeChildId) await markQuestComplete({ questId: q._id, parentId: userData._id });
                    }}
                    className="px-4 py-2 rounded-full font-bold text-xs gradient-grass text-white shadow-soft hover:shadow-pop hover:scale-105 transition-all"
                  >
                    Tandai ✓ 🎉
                  </button>
                )}
                {q.completed && <span className="text-xs font-bold text-green-500">Selesai! 🌟</span>}
                {!q.completed && (
                  <button
                    onClick={async () => {
                      if (!userData) return;
                      await removeQuest({ questId: q._id, parentId: userData._id });
                    }}
                    className="text-xs text-red-300 hover:text-red-500 font-bold px-2 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Create new quest form */}
          {showQuestForm && activeChildId && (
            <div className="mt-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl space-y-3 animate-pop-in border-2 border-purple-200 shadow-soft">
              <input
                value={newQuestTitle}
                onChange={(e) => setNewQuestTitle(e.target.value)}
                placeholder="Nama tugas (e.g. Bantu cuci piring) 🧹"
                className="w-full p-3 rounded-xl border-2 border-purple-200 bg-white font-bold text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">⚡ XP Reward:</span>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={newQuestXp}
                  onChange={(e) => setNewQuestXp(Number(e.target.value))}
                  className="w-20 p-2 rounded-xl border-2 border-purple-200 bg-white font-bold text-sm text-center outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!newQuestTitle.trim() || !activeChildId || !userData?._id) return;
                    const iconList = ['🧹', '🫶', '🛏️', '🌿', '📚', '🎒', '👟', '💪'];
                    const icon = iconList[Math.floor(Math.random() * iconList.length)];
                    await createSideQuest({
                      parentId: userData._id,
                      childId: activeChildId as any,
                      title: newQuestTitle.trim(),
                      icon,
                      xpReward: newQuestXp,
                    });
                    setNewQuestTitle('');
                    setNewQuestXp(15);
                    setShowQuestForm(false);
                  }}
                  disabled={!newQuestTitle.trim()}
                  className="flex-1 py-3 rounded-full font-bold gradient-grass text-white text-sm shadow-soft hover:shadow-pop hover:scale-105 transition-all disabled:opacity-50"
                >
                  Simpan Tugas ✨
                </button>
                <button
                  onClick={() => setShowQuestForm(false)}
                  className="px-4 py-3 rounded-full font-bold bg-white text-sm border-2 border-gray-200 hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowQuestForm(true)}
            className="w-full mt-4 py-3.5 rounded-full font-bold gradient-sunset text-white text-sm shadow-pop hover:scale-[1.02] transition-all"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            + Tambah Side Quest Baru 🎯
          </button>
        </div>
      </section>

      {/* ═══════════════════ WEEKLY CHART ═══════════════════ */}
      <section>
        <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white relative overflow-hidden">
          <span className="absolute top-4 right-4 text-blue-300 text-sm animate-sparkle">✦</span>
          <h3 className="font-extrabold text-xl mb-4 flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <span className="text-2xl">📊</span> Aktivitas Mingguan
          </h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={weeklyActivity}>
                <XAxis dataKey="d" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="sekolah" name="Di Sekolah" radius={[6, 6, 0, 0]} fill="#a855f7" />
                <Bar dataKey="rumah" name="Di Rumah" radius={[6, 6, 0, 0]} fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center text-xs font-bold mt-2">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-500" /> Di Sekolah</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500" /> Di Rumah</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM MovaTip ═══════════════════ */}
      <div className="flex justify-center pb-8">
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 border-2 border-purple-200 rounded-3xl px-6 py-4 shadow-soft inline-flex items-center gap-3 animate-wobble max-w-md text-center">
          <img src="/mova-hero.png" alt="MOVA" className="w-10 h-10 rounded-full animate-dance-slow flex-shrink-0" />
          <div>
            <div className="text-sm font-extrabold text-purple-700" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Hebat banget, {userData?.name || 'Orang Tua'}! 💖
            </div>
            <div className="text-xs font-bold text-purple-500 mt-0.5">
              Terus pantau perkembangan {activeChild?.name || 'anak'} ya! Setiap langkah kecil itu berarti 🌟
            </div>
          </div>
          <SparkleRow count={3} />
        </div>
      </div>
    </div>
  );
}
