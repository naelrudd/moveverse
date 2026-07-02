'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  LineChart, Line,
} from 'recharts';

const dummyChildren = [
  { _id: '1', name: 'Adi', avatar: '🧒', level: 3, xp: 2450, coins: 320, classId: '3A' },
  { _id: '2', name: 'Sari', avatar: '👧', level: 2, xp: 1800, coins: 250, classId: '2B' },
];

  const sportRecommendations = [
    { sport: 'Basket', icon: '🏀', match: 92, reason: 'Lompatan & koordinasi excellent' },
    { sport: 'Renang', icon: '🏊', match: 85, reason: 'Fleksibilitas & keseimbangan kuat' },
    { sport: 'Senam', icon: '🤸', match: 78, reason: 'Agilitas & kekuatan bagus' },
    { sport: 'Sepak Bola', icon: '⚽', match: 74, reason: 'Lari & koordinasi berkembang' },
  ];

export default function ParentDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const linkChildMut = useMutation(api.users.linkChild);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [nisInput, setNisInput] = useState('');

  // Dulu: pake dummy children, ntar kalo ada data real dari convex, pake itu
  const children = userData?.childIds?.length ? dummyChildren : dummyChildren;
  const activeChild = selectedChild || children[0]?._id || null;
  const childData = children.find((c) => c._id === activeChild);

  const motorikData = [
    { skill: 'Keseimbangan', value: 78, avg: 65, prev: 72 },
    { skill: 'Koordinasi', value: 65, avg: 58, prev: 60 },
    { skill: 'Kelincahan', value: 72, avg: 63, prev: 68 },
    { skill: 'Kekuatan', value: 60, avg: 55, prev: 55 },
    { skill: 'Fleksibilitas', value: 55, avg: 52, prev: 50 },
    { skill: 'Confidence', value: 85, avg: 70, prev: 80 },
  ];

  const weeklyActivity = [
    { d: 'Mon', school: 45, home: 30 },
    { d: 'Tue', school: 60, home: 20 },
    { d: 'Wed', school: 50, home: 45 },
    { d: 'Thu', school: 40, home: 35 },
    { d: 'Fri', school: 55, home: 25 },
    { d: 'Sat', school: 0, home: 60 },
    { d: 'Sun', school: 0, home: 50 },
  ];

  const homeQuests = [
    { icon: '🌊', title: 'Meliuk 5 kali', reward: '+20 XP', done: true },
    { icon: '🦩', title: 'Menekuk tangan 10 kali', reward: '+20 XP', done: true },
    { icon: '🌀', title: 'Memutar kepala 5 kali', reward: '+25 XP', done: false },
    { icon: '🎪', title: 'Mengayun kaki 10 kali', reward: '+25 XP', done: false },
  ];

  const linkChild = async () => {
    if (!nisInput.trim()) return;
    const child = await linkChildMut({ parentId: userData!._id, childNis: nisInput.trim() });
    if (child) setNisInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in">
        <div className="flex items-center gap-4">
          <div className="text-5xl animate-float">👨‍👩‍👧</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-muted-foreground">Parent Dashboard</div>
            <h1 className="text-3xl font-extrabold">Pantau Aktivitas Anak</h1>
            <p className="text-sm text-foreground/70">Lihat perkembangan gerak non-lokomotor dan aktivitas anak</p>
          </div>
          {/* Child selector */}
          <div className="flex gap-2">
            {children.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedChild(c._id)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  activeChild === c._id ? 'gradient-sky text-white shadow-soft' : 'bg-muted'
                }`}
              >
                {c.avatar} {c.name}
              </button>
            ))}
          </div>
        </div>
        {/* Link child by NIS */}
        {(!userData?.childIds?.length) && (
          <div className="mt-4 flex gap-2 items-center bg-sunny/20 rounded-2xl p-3">
            <span className="text-sm font-bold">Link anak:</span>
            <input
              value={nisInput}
              onChange={(e) => setNisInput(e.target.value)}
              placeholder="Masukkan NIS anak..."
              className="flex-1 p-2 rounded-xl border-2 border-border font-bold text-sm"
            />
            <button onClick={linkChild} className="px-4 py-2 rounded-full font-bold gradient-grass text-white text-sm">
              Link
            </button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { l: 'Level', v: `Level ${childData?.level || 0}`, t: 'gradient-sky' },
          { l: 'XP Total', v: (childData?.xp || 0).toLocaleString(), t: 'gradient-sunset' },
          { l: 'PL Score', v: '69', t: 'gradient-grass' },
          { l: 'Quest Selesai', v: '12/18', t: 'gradient-magic' },
        ].map((s, i) => (
          <div key={s.l} className={`${s.t} text-white rounded-3xl p-5 shadow-soft`}>
            <div className="text-xs font-bold opacity-90">{s.l}</div>
            <div className="text-3xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Motorik Detail */}
      <section>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-extrabold text-lg mb-4">📊 Detail Perkembangan Motorik</h3>
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
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 border-dashed inline-block" style={{borderTop: '1px dashed #94a3b8', height:0}}></span> Bulan Lalu</span>
            </div>
            {/* Breakdown per skill */}
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

          {/* Akses Rekaman Kamera AI */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-extrabold text-lg mb-4">📹 Hasil Rekaman AI</h3>
            <div className="space-y-3">
              {[
                { date: '2026-06-28', type: 'Jumping Jacks', score: 82, duration: '1:23' },
                { date: '2026-06-27', type: 'Tes Keseimbangan', score: 75, duration: '0:58' },
                { date: '2026-06-25', type: 'Running Form', score: 68, duration: '2:01' },
                { date: '2026-06-22', type: 'Throw & Catch', score: 90, duration: '1:45' },
              ].map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl hover:bg-muted/80 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">🎥</div>
                    <div>
                      <div className="font-bold text-sm">{rec.type}</div>
                      <div className="text-xs text-muted-foreground">{rec.date} · {rec.duration}</div>
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

      {/* Rekomendasi Cabang Olahraga */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">🏆 Rekomendasi Olahraga</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full gradient-magic text-white">Otomatis AI</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sportRecommendations.map((s) => (
              <div key={s.sport} className="bg-muted/40 rounded-3xl p-5 hover:shadow-soft transition-all border-2 border-transparent hover:border-primary/20">
                <div className="text-4xl mb-2">{s.icon}</div>
                <div className="font-extrabold text-lg">{s.sport}</div>
                <div className="flex items-center gap-1 mt-1 mb-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full gradient-grass rounded-full" style={{ width: `${s.match}%` }} />
                  </div>
                  <span className="text-sm font-bold">{s.match}%</span>
                </div>
                <div className="text-xs text-muted-foreground">{s.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activity + Home Quests */}
      <section>
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Aktivitas Sekolah */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-extrabold text-lg mb-4">Aktivitas Mingguan</h3>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={weeklyActivity}>
                  <XAxis dataKey="d" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="school" name="Di Sekolah" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                  <Bar dataKey="home" name="Di Rumah" radius={[6, 6, 0, 0]} fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center text-xs font-bold mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500"></span> Di Sekolah</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500"></span> Di Rumah</span>
            </div>
          </div>

          {/* Quest di Rumah */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-extrabold text-lg mb-4">🏠 Quest di Rumah</h3>
            <div className="space-y-2">
              {homeQuests.map((q, i) => (
                <div key={i} className={`p-3 rounded-2xl flex items-center gap-3 ${q.done ? 'bg-green-50 border border-green-200' : 'bg-muted/60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${q.done ? 'gradient-grass text-white' : 'bg-muted-foreground/20'}`}>
                    {q.done ? '✓' : q.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${q.done ? 'line-through text-muted-foreground' : ''}`}>{q.title}</div>
                    <div className="text-xs text-accent font-bold">{q.reward}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 rounded-full font-bold gradient-sunset text-white text-sm">
              + Tambah Quest Baru
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
