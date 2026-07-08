'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const SKILL_LABELS: Record<string, string> = {
  balance: 'Keseimbangan',
  coordination: 'Koordinasi',
  agility: 'Kelincahan',
  flexibility: 'Fleksibilitas',
  strength: 'Kekuatan',
};

const SKILL_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

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
      <div className="max-w-7xl mx-auto px-4 py-10 text-center text-muted-foreground">
        Memuat data sekolah...
      </div>
    );
  }

  if (!userData.schoolId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <div className="text-5xl mb-4">🏫</div>
        <h1 className="text-2xl font-extrabold">Belum Terdaftar di Sekolah</h1>
        <p className="text-muted-foreground mt-2">
          Akun Anda belum terkait dengan sekolah manapun.
        </p>
      </div>
    );
  }

  const { school, classes, totalStudents, activeToday, avgXp, avgPl } = dashboard;
  const filteredClasses = selectedGrade
    ? classes.filter((c) => c.grade === selectedGrade)
    : classes;

  const grades = [...new Set(classes.map((c) => c.grade))].sort((a, b) => a - b);
  const gradeStats = grades.map((g) => {
    const gradeClasses = classes.filter((c) => c.grade === g);
    const total = gradeClasses.reduce((a, c) => a + c.students, 0);
    const active = gradeClasses.reduce((a, c) => a + c.active, 0);
    const avgXpGrade =
      total > 0
        ? Math.round(gradeClasses.reduce((a, c) => a + c.avgXp * c.students, 0) / total)
        : 0;
    return { grade: g, total, active, avgXp: avgXpGrade };
  });

  const plRadar = avgPl
    ? Object.entries(avgPl).map(([key, val]) => ({
        skill: SKILL_LABELS[key] || key,
        value: val,
      }))
    : [];

  const plBar = avgPl
    ? Object.entries(avgPl).map(([key, val], i) => ({
        name: SKILL_LABELS[key] || key,
        value: val,
        fill: SKILL_COLORS[i % SKILL_COLORS.length],
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🏫</div>
          <div>
            <div className="text-xs font-bold text-muted-foreground">Analitik Sekolah</div>
            <h1 className="text-3xl font-extrabold">{school.name}</h1>
            {school.address && (
              <p className="text-sm text-foreground/70">{school.address}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="gradient-sky text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Total Peserta Didik</div>
          <div className="text-3xl font-extrabold">{totalStudents.toLocaleString()}</div>
        </div>
        <div className="gradient-grass text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Aktif Hari Ini</div>
          <div className="text-3xl font-extrabold">{activeToday.toLocaleString()}</div>
        </div>
        <div className="gradient-sunset text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Rata-rata XP</div>
          <div className="text-3xl font-extrabold">{avgXp.toLocaleString()}</div>
        </div>
        <div className="gradient-magic text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Total Kelas</div>
          <div className="text-3xl font-extrabold">{classes.length.toString()}</div>
        </div>
      </div>

      {plRadar.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-extrabold text-lg mb-4">Rata-rata PL Sekolah</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <RadarChart data={plRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Sekolah" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-extrabold text-lg mb-4">Skor PL per Keterampilan</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={plBar}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {plBar.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {gradeStats.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {gradeStats.map((g) => (
            <div key={g.grade} className="bg-white rounded-3xl p-5 shadow-soft">
              <div className="text-sm font-bold text-muted-foreground">Kelas {g.grade}</div>
              <div className="text-3xl font-extrabold mt-1">{g.avgXp} XP</div>
              <div className="text-xs text-muted-foreground mt-2">
                {g.active}/{g.total} peserta didik aktif
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <h3 className="font-extrabold text-lg mb-4">Manajemen Kelas</h3>

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedGrade(null)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${
              selectedGrade === null ? 'gradient-sunset text-white' : 'bg-muted/60 hover:bg-muted'
            }`}
          >
            Semua
          </button>
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${
                selectedGrade === g ? 'gradient-sunset text-white' : 'bg-muted/60 hover:bg-muted'
              }`}
            >
              Kelas {g}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-muted/40 rounded-2xl p-4 hover:shadow-soft transition-all border-2 border-transparent hover:border-primary/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-lg">Kelas {cls.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                  XP {cls.avgXp}
                </span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Peserta Didik</span>
                  <span className="font-bold text-foreground">{cls.students}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aktif</span>
                  <span className="font-bold text-foreground">{cls.active}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>Partisipasi</span>
                  <span>
                    {cls.students > 0
                      ? Math.round((cls.active / cls.students) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${cls.students > 0 ? (cls.active / cls.students) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <p className="text-center text-muted-foreground py-6">Tidak ada kelas di grade ini</p>
        )}
      </div>
    </div>
  );
}
