'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const trend = Array.from({ length: 12 }, (_, i) => ({
  m: `M${i + 1}`,
  s: 60 + Math.round(Math.sin(i / 2) * 5 + i * 1.5),
}));

const byGender = [
  { name: 'Perempuan', value: 52, fill: '#ec4899' },
  { name: 'Laki-laki', value: 48, fill: '#3b82f6' },
];

const gradeStats = [
  { grade: 'Grade 1-2', total: 128, avgPL: 71, active: 120, trend: 5 },
  { grade: 'Grade 3-4', total: 156, avgPL: 78, active: 148, trend: 8 },
  { grade: 'Grade 5-6', total: 132, avgPL: 82, active: 125, trend: 6 },
];

const classesManaged = [
  { id: '1A', name: '1A', grade: 1, students: 24, avgPL: 68, teacher: 'Bu Sari', active: 22 },
  { id: '1B', name: '1B', grade: 1, students: 22, avgPL: 65, teacher: 'Pak Budi', active: 20 },
  { id: '2A', name: '2A', grade: 2, students: 26, avgPL: 72, teacher: 'Bu Rina', active: 25 },
  { id: '2B', name: '2B', grade: 2, students: 24, avgPL: 70, teacher: 'Bu Dewi', active: 23 },
  { id: '3A', name: '3A', grade: 3, students: 28, avgPL: 78, teacher: 'Pak Joko', active: 26 },
  { id: '3B', name: '3B', grade: 3, students: 26, avgPL: 71, teacher: 'Bu Lina', active: 24 },
  { id: '4A', name: '4A', grade: 4, students: 30, avgPL: 83, teacher: 'Bu Ratna', active: 28 },
  { id: '4B', name: '4B', grade: 4, students: 27, avgPL: 76, teacher: 'Pak Rian', active: 25 },
  { id: '5A', name: '5A', grade: 5, students: 25, avgPL: 80, teacher: 'Bu Maya', active: 24 },
  { id: '5B', name: '5B', grade: 5, students: 24, avgPL: 74, teacher: 'Pak Adi', active: 22 },
  { id: '6A', name: '6A', grade: 6, students: 22, avgPL: 85, teacher: 'Bu Nina', active: 21 },
  { id: '6B', name: '6B', grade: 6, students: 20, avgPL: 81, teacher: 'Bu Sari', active: 19 },
];

const plBySkill = [
  { skill: 'Balance', school: 76, national: 68 },
  { skill: 'Coordination', school: 70, national: 62 },
  { skill: 'Agility', school: 74, national: 65 },
  { skill: 'Strength', school: 65, national: 60 },
  { skill: 'Flexibility', school: 62, national: 58 },
];

export default function SchoolDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [showAllClasses, setShowAllClasses] = useState(false);

  const totalStudents = classesManaged.reduce((a, c) => a + c.students, 0);
  const activeStudents = classesManaged.reduce((a, c) => a + c.active, 0);
  const avgSchoolPL = Math.round(classesManaged.reduce((a, c) => a + c.avgPL, 0) / classesManaged.length);
  const filteredClasses = selectedGrade ? classesManaged.filter((c) => c.grade === selectedGrade) : classesManaged;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🏫</div>
          <div>
            <div className="text-xs font-bold text-muted-foreground">School Analytics</div>
            <h1 className="text-3xl font-extrabold">{userData?.name || 'SDN Moveverse Academy'}</h1>
            <p className="text-sm text-foreground/70">Laporan performa PJOK seluruh sekolah · Evaluasi program berskala besar</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full font-bold bg-white border-2 border-border px-4 py-2 text-sm">📄 Export PDF</button>
          <button className="rounded-full font-bold bg-white border-2 border-border px-4 py-2 text-sm">📊 Export Excel</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { l: 'Total Siswa', v: totalStudents.toLocaleString(), t: 'gradient-sky' },
          { l: 'Aktif Hari Ini', v: activeStudents.toLocaleString(), t: 'gradient-grass' },
          { l: 'Rata-rata PL', v: avgSchoolPL.toString(), t: 'gradient-sunset' },
          { l: 'Total Kelas', v: classesManaged.length.toString(), t: 'gradient-magic' },
        ].map((s) => (
          <div key={s.l} className={`${s.t} text-white rounded-3xl p-5 shadow-soft`}>
            <div className="text-xs font-bold opacity-90">{s.l}</div>
            <div className="text-3xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      {/* 12-month trend + Gender */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold text-lg mb-4">Trend PL 12 Bulan</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} />
                <Tooltip />
                <Area dataKey="s" stroke="#3b82f6" fill="url(#g)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold text-lg mb-4">Gender Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byGender} dataKey="value" innerRadius={50} outerRadius={85}>
                  {byGender.map((g) => <Cell key={g.name} fill={g.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center text-xs font-bold">
            {byGender.map((g) => (
              <span key={g.name} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ background: g.fill }}></span> {g.name} ({g.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* PL vs National benchmark */}
      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <h3 className="font-extrabold text-lg mb-4">📊 PL Score vs National Benchmark</h3>
        <div className="h-52">
          <ResponsiveContainer>
            <BarChart data={plBySkill}>
              <XAxis dataKey="skill" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="school" name="Sekolah" radius={[6, 6, 0, 0]} fill="#3b82f6" />
              <Bar dataKey="national" name="National" radius={[6, 6, 0, 0]} fill="#cbd5e1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 justify-center text-xs font-bold mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500"></span> Sekolah</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-300"></span> National Avg</span>
        </div>
      </div>

      {/* Grade breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        {gradeStats.map((g) => (
          <div key={g.grade} className="bg-white rounded-3xl p-5 shadow-soft">
            <div className="text-sm font-bold text-muted-foreground">{g.grade}</div>
            <div className="text-3xl font-extrabold mt-1">{g.avgPL}</div>
            <div className="text-xs text-secondary-foreground font-bold mt-1">▲ +{g.trend}% vs last term</div>
            <div className="text-xs text-muted-foreground mt-2">{g.active}/{g.total} siswa aktif</div>
          </div>
        ))}
      </div>

      {/* Class Management */}
      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-lg">📋 Manajemen Kelas</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAllClasses(!showAllClasses)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                showAllClasses ? 'gradient-sky text-white' : 'bg-muted'
              }`}
            >
              {showAllClasses ? 'Semua Kelas' : 'Tampilkan Semua'}
            </button>
          </div>
        </div>

        {/* Grade filter pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedGrade(null)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${
              selectedGrade === null ? 'gradient-sunset text-white' : 'bg-muted/60 hover:bg-muted'
            }`}
          >
            Semua
          </button>
          {[1, 2, 3, 4, 5, 6].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${
                selectedGrade === g ? 'gradient-sunset text-white' : 'bg-muted/60 hover:bg-muted'
              }`}
            >
              Grade {g}
            </button>
          ))}
        </div>

        {/* Class cards grid */}
        <div className={`grid ${showAllClasses ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-3`}>
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-muted/40 rounded-2xl p-4 hover:shadow-soft transition-all border-2 border-transparent hover:border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-lg">Kelas {cls.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  cls.avgPL >= 80 ? 'bg-green-100 text-green-700' : cls.avgPL >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  PL {cls.avgPL}
                </span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>👩‍🏫 Guru</span><span className="font-bold text-foreground">{cls.teacher}</span></div>
                <div className="flex justify-between"><span>👤 Siswa</span><span className="font-bold text-foreground">{cls.students}</span></div>
                <div className="flex justify-between"><span>🟢 Aktif</span><span className="font-bold text-foreground">{cls.active}</span></div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>Partisipasi</span>
                  <span>{Math.round((cls.active / cls.students) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(cls.active / cls.students) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
