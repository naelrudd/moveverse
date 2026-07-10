'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import CopyButton from '@/components/CopyButton';
import Image from 'next/image';
import {
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

const SKILL_LABELS: Record<string, string> = {
  balance: 'Keseimbangan', coordination: 'Koordinasi', agility: 'Kelincahan',
  flexibility: 'Fleksibilitas', strength: 'Kekuatan',
};
const SKILL_COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

export default function SchoolDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const dashboard = useQuery(
    api.schools.getSchoolDashboard,
    userData?.schoolId ? { schoolId: userData.schoolId } : 'skip',
  );
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  if (!userData || !dashboard) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center">
        <div className="animate-float text-5xl mb-3">🏫</div>
        <p className="text-muted-foreground font-bold">Memuat data sekolah...</p>
      </div>
    );
  }

  if (!userData.schoolId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center">
        <div className="text-6xl mb-4">🏫</div>
        <h1 className="text-2xl font-extrabold">Belum Terdaftar di Sekolah</h1>
        <p className="text-muted-foreground mt-2">Akun kamu belum terkait dengan sekolah manapun.</p>
      </div>
    );
  }

  const { school, classes, totalStudents, activeToday, avgXp, avgPl } = dashboard;
  const filteredClasses = selectedGrade ? classes.filter((c) => c.grade === selectedGrade) : classes;
  const grades = [...new Set(classes.map((c) => c.grade))].sort((a, b) => a - b);

  const gradeStats = grades.map((g) => {
    const gc = classes.filter((c) => c.grade === g);
    const total = gc.reduce((a, c) => a + c.students, 0);
    const active = gc.reduce((a, c) => a + c.active, 0);
    const avg = total > 0 ? Math.round(gc.reduce((a, c) => a + c.avgXp * c.students, 0) / total) : 0;
    return { grade: g, total, active, avgXp: avg };
  });

  const plRadar = avgPl ? Object.entries(avgPl).map(([k, v]) => ({ skill: SKILL_LABELS[k] || k, value: v })) : [];
  const plBar = avgPl ? Object.entries(avgPl).map(([k, v], i) => ({ name: SKILL_LABELS[k] || k, value: v, fill: SKILL_COLORS[i % 5] })) : [];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-5 bg-theme-forest min-h-screen">
      {/* ── Hero: school info ── */}
      <div className="relative rounded-[2.5rem] p-6 sm:p-8 shadow-pop border-4 border-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.92 0.12 230), oklch(0.95 0.1 60), oklch(0.93 0.12 310))' }}
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-1 shadow-pop animate-float shrink-0 overflow-hidden">
            <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground/60">🏫 Analitik Sekolah</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{school.name}</h1>
            {school.address && <p className="text-sm text-foreground/70 mt-0.5">{school.address}</p>}
          </div>
        </div>
      </div>

      {/* ── Stat cards — candy style ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: '🎒', label: 'Peserta Didik', value: totalStudents, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
          { icon: '🏃', label: 'Aktif Hari Ini', value: activeToday, gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
          { icon: '⭐', label: 'Rata-rata XP', value: avgXp, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
          { icon: '📚', label: 'Total Kelas', value: classes.length, gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
        ].map((s, i) => (
          <div
            key={s.label}
            className="text-white rounded-3xl p-4 sm:p-5 shadow-pop relative overflow-hidden animate-slide-up hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-2 border-white/30"
            style={{ background: s.gradient, animationDelay: `${i * 0.1}s` } as React.CSSProperties}
          >
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <div className="text-2xl sm:text-3xl mb-1 drop-shadow-md relative z-10">{s.icon}</div>
            <div className="text-[10px] font-extrabold opacity-80 relative z-10 uppercase tracking-wider">{s.label}</div>
            <div className="text-2xl sm:text-3xl font-extrabold relative z-10 drop-shadow-sm">{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* ── Physical Literacy Charts ── */}
      {plRadar.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-pop relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
            <h3 className="font-extrabold text-base mb-3 flex items-center gap-2">🕸️ Rata-rata PL Sekolah</h3>
            <div className="h-56">
              <ResponsiveContainer>
                <RadarChart data={plRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Sekolah" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-pop relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
            <h3 className="font-extrabold text-base mb-3 flex items-center gap-2">📊 Skor PL per Keterampilan</h3>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={plBar}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {plBar.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Grade stats — candy cards ── */}
      {gradeStats.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {gradeStats.map((g, i) => (
            <div
              key={g.grade}
              className="bg-white rounded-3xl p-4 shadow-pop relative overflow-hidden animate-slide-up hover:scale-105 transition-all"
              style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl" style={{ background: SKILL_COLORS[i % 5] }} />
              <div className="text-3xl mb-1">🏫</div>
              <div className="text-xs font-bold text-muted-foreground">Kelas {g.grade}</div>
              <div className="text-2xl font-extrabold mt-0.5">{g.avgXp} XP</div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-bold text-green-600">{g.active}</span>/{g.total} aktif
              </div>
              <div className="mt-2 w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${g.total > 0 ? (g.active / g.total) * 100 : 0}%`, background: SKILL_COLORS[i % 5] }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Class management ── */}
      <div className="bg-white rounded-3xl p-5 shadow-pop relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
        <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">📚 Manajemen Kelas</h3>

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedGrade(null)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border-2 ${
              selectedGrade === null ? 'text-white border-transparent shadow-soft' : 'bg-muted/60 hover:bg-muted border-transparent'
            }`}
            style={selectedGrade === null ? { background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' } : {}}
          >
            Semua
          </button>
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border-2 ${
                selectedGrade === g ? 'text-white border-transparent shadow-soft' : 'bg-muted/60 hover:bg-muted border-transparent'
              }`}
              style={selectedGrade === g ? { background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' } : {}}
            >
              Kelas {g}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-muted/40 rounded-2xl p-4 hover:shadow-soft transition-all border-2 border-transparent hover:border-primary/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-lg">🏫 Kelas {cls.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                  XP {cls.avgXp}
                </span>
              </div>
              {(userData?.role === 'teacher' || userData?.role === 'admin' || userData?.role === 'school_admin') && cls.code && (
                <div className="flex items-center justify-between mb-2 p-2 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-xs font-bold text-amber-700">Kode: {cls.code}</span>
                  <CopyButton text={cls.code} label="Salin" />
                </div>
              )}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peserta Didik</span>
                  <span className="font-bold">{cls.students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aktif</span>
                  <span className="font-bold text-green-600">{cls.active}</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>Partisipasi</span>
                  <span>{cls.students > 0 ? Math.round((cls.active / cls.students) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cls.students > 0 ? (cls.active / cls.students) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #10b981, #34d399)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <p className="text-center text-muted-foreground py-6 font-bold">Tidak ada kelas di grade ini</p>
        )}
      </div>

      {/* ── MOVA tip ── */}
      <div className="flex justify-center">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-0.5 shadow-soft shrink-0 overflow-hidden">
            <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
          </div>
          <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 shadow-soft text-xs font-bold text-foreground/80 relative">
            <span className="absolute -left-1 top-3 w-2 h-2 bg-white rotate-45 shadow-soft" />
            🏫 Semangat belajar untuk semua kelas! 🌟
          </div>
        </div>
      </div>
    </div>
  );
}
