'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { worlds } from '@/lib/worlds';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

export default function ParentDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const children = useQuery(api.users.getChildren, userData?._id ? { parentId: userData._id } : 'skip');
  const linkChildMut = useMutation(api.users.linkChild);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [nisInput, setNisInput] = useState('');

  const childList = (children ?? []).filter((c): c is NonNullable<typeof c> => c !== null);
  const activeChildId = selectedChildId || childList[0]?._id || null;
  const activeChild = childList.find((c) => c && c._id === activeChildId);

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

  // Rekomendasi berdasarkan stat motorik anak
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
    const child = await linkChildMut({ parentId: userData._id, childNis: nisInput.trim() });
    if (child) {
      setNisInput('');
      setSelectedChildId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in">
        <div className="flex items-center gap-4">
          <div className="text-5xl animate-float">👨‍👩‍👧</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-muted-foreground">Dashboard Orang Tua</div>
            <h1 className="text-3xl font-extrabold">Pantau Aktivitas Anak</h1>
            <p className="text-sm text-foreground/70">Lihat perkembangan gerak dan aktivitas anak</p>
          </div>
          {/* Child selector */}
          <div className="flex gap-2">
            {childList.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedChildId(c._id)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  activeChildId === c._id ? 'gradient-sky text-white shadow-soft' : 'bg-muted'
                }`}
              >
                {c.avatar} {c.name}
              </button>
            ))}
          </div>
        </div>
        {/* Link child by NIS */}
        <div className="mt-4 flex gap-2 items-center bg-sunny/20 rounded-2xl p-3">
          <span className="text-sm font-bold">Tambah Anak:</span>
          <input
            value={nisInput}
            onChange={(e) => setNisInput(e.target.value)}
            placeholder="Masukkan NIS anak..."
            className="flex-1 p-2 rounded-xl border-2 border-border font-bold text-sm"
          />
          <button onClick={linkChild} className="px-4 py-2 rounded-full font-bold gradient-grass text-white text-sm">
            Tambah
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { l: 'Level', v: `Level ${activeChild?.level ?? 0}`, t: 'gradient-sky' },
          { l: 'XP Total', v: (activeChild?.xp ?? 0).toLocaleString(), t: 'gradient-sunset' },
          { l: 'Badge', v: `${(activeChild as any)?.badges?.length ?? 0}/18`, t: 'gradient-grass' },
          { l: 'Dunia', v: '3 Dunia', t: 'gradient-magic' },
        ].map((s) => (
          <div key={s.l} className={`${s.t} text-white rounded-3xl p-5 shadow-soft`}>
            <div className="text-xs font-bold opacity-90">{s.l}</div>
            <div className="text-3xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Dunia Gerak — klik ke detail */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">🌍 Dunia Gerak</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full gradient-grass text-white">3 Dunia</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {worlds.map((w) => (
              <Link key={w.id} href={`/worlds/${w.id}`} className={`relative rounded-2xl p-5 text-white ${w.gradient} hover:shadow-soft hover:scale-[1.02] transition-all border-2 border-white/30 block`}>
                <div className="text-4xl mb-2">{w.emoji}</div>
                <div className="font-extrabold text-lg">{w.name}</div>
                <div className="text-xs opacity-80 mt-1">{w.tagline}</div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {w.activities.map((a) => (
                    <span key={a.id} className="text-[10px] font-bold bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">{a.icon} {a.name}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Analisis Perkembangan — bukan quest */}
      <section>
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Radar motorik */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-extrabold text-lg mb-4">📊 Analisis Perkembangan Motorik</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <RadarChart data={motorikData}>
                  <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fontWeight: 700, fill: 'currentColor' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name="Sekarang" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2.5} />
                  <Radar name="Bulan Lalu" dataKey="prev" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center text-xs font-bold mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block"></span> Sekarang</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 inline-block" style={{borderTop: '1px dashed #94a3b8', height:0}}></span> Bulan Lalu</span>
            </div>
            <div className="mt-4 space-y-2">
              {motorikData.map((m) => (
                <div key={m.skill} className="flex items-center gap-3 text-sm">
                  <span className="w-24 font-bold">{m.skill}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${m.value}%` }} />
                  </div>
                  <span className="font-bold w-8 text-right">{m.value}</span>
                  <span className={`text-xs ${m.value >= m.prev ? 'text-green-600' : 'text-red-500'}`}>
                    {m.value >= m.prev ? '▲' : '▼'} {Math.abs(m.value - m.prev)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hasil Rekaman AI */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-extrabold text-lg mb-4">📹 Hasil Rekaman AI</h3>
            <div className="space-y-3">
              {[
                { date: '2026-06-28', type: 'Meliuk', score: 82, durasi: '1:23' },
                { date: '2026-06-27', type: 'Menekuk', score: 75, durasi: '0:58' },
                { date: '2026-06-25', type: 'Memutar', score: 68, durasi: '2:01' },
                { date: '2026-06-22', type: 'Mengayun', score: 90, durasi: '1:45' },
              ].map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl hover:bg-muted/80 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">🎥</div>
                    <div>
                      <div className="font-bold text-sm">{rec.type}</div>
                      <div className="text-xs text-muted-foreground">{rec.date} · {rec.durasi}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${rec.score >= 80 ? 'text-green-600' : rec.score >= 65 ? 'text-amber-600' : 'text-red-500'}`}>
                      {rec.score}%
                    </span>
                    <button className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">Lihat</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rekomendasi Kegiatan di Rumah — berdasarkan stat */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">🏠 Rekomendasi Kegiatan di Rumah</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full gradient-magic text-white">Berdasarkan Stat</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getSportRecommendations().map((r) => (
              <div key={r.name} className="bg-muted/40 rounded-3xl p-5 hover:shadow-soft transition-all border-2 border-transparent hover:border-primary/20">
                <div className="text-4xl mb-2">{r.icon}</div>
                <div className="font-extrabold text-lg">{r.name}</div>
                <div className="text-[10px] font-bold text-primary mt-1">{r.kategori}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.reason}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">* Rekomendasi ini hanya saran kegiatan tambahan di rumah, bukan bagian dari poin siswa.</p>
        </div>
      </section>

      {/* Side Quest di Rumah — pengawasan ortu */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">🎯 Side Quest di Rumah</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full gradient-sunset text-white">Tambahan Poin</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Bantu anak nambah poin dengan tugas tambahan di rumah!</p>
          <div className="space-y-3">
            {[
              { icon: '🧹', tugas: 'Bantu sapu rumah 10 menit', poin: 15, selesai: false },
              { icon: '🫶', tugas: 'Cuci piring sendiri', poin: 15, selesai: true },
              { icon: '🛏️', tugas: 'Rapikan tempat tidur', poin: 10, selesai: false },
              { icon: '🌿', tugas: 'Siram tanaman 5 pot', poin: 10, selesai: false },
            ].map((q, i) => (
              <div key={i} className={`p-4 rounded-2xl flex items-center gap-3 ${q.selesai ? 'bg-green-50 border border-green-200' : 'bg-muted/40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${q.selesai ? 'gradient-grass text-white' : 'bg-white'}`}>
                  {q.selesai ? '✓' : q.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${q.selesai ? 'line-through text-muted-foreground' : ''}`}>{q.tugas}</div>
                  <div className="text-xs text-accent font-bold">+{q.poin} XP</div>
                </div>
                {!q.selesai && (
                  <button className="px-3 py-1.5 rounded-full font-bold text-xs gradient-grass text-white">Tandai ✓</button>
                )}
                {q.selesai && <span className="text-xs font-bold text-green-600">Selesai!</span>}
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 rounded-full font-bold gradient-sunset text-white text-sm shadow-soft hover:shadow-pop transition-all">
            + Tambah Side Quest Baru
          </button>
        </div>
      </section>

      {/* Aktivitas Mingguan */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold text-lg mb-4">📊 Aktivitas Mingguan</h3>
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={weeklyActivity}>
                <XAxis dataKey="d" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="sekolah" name="Di Sekolah" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                <Bar dataKey="rumah" name="Di Rumah" radius={[6, 6, 0, 0]} fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center text-xs font-bold mt-2">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500"></span> Di Sekolah</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500"></span> Di Rumah</span>
          </div>
        </div>
      </section>
    </div>
  );
}
