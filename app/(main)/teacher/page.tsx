'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from 'recharts';

// Dummy class data — nanti ganti ke real query
const classesData = [
  { name: '3A', studentCount: 28, avgScore: 78, trend: 3 },
  { name: '3B', studentCount: 26, avgScore: 71, trend: -1 },
  { name: '4A', studentCount: 30, avgScore: 83, trend: 5 },
  { name: '4B', studentCount: 27, avgScore: 76, trend: 2 },
  { name: '5A', studentCount: 25, avgScore: 80, trend: 4 },
];

const students3A = [
  { id: '1', name: 'Adi', level: 3, balance: 82, coordination: 65, agility: 72, strength: 60, flexibility: 55, lastActive: '2j lalu' },
  { id: '2', name: 'Mira', level: 4, balance: 88, coordination: 75, agility: 80, strength: 70, flexibility: 68, lastActive: '1j lalu' },
  { id: '3', name: 'Joko', level: 2, balance: 64, coordination: 58, agility: 62, strength: 50, flexibility: 48, lastActive: '3j lalu' },
  { id: '4', name: 'Sari', level: 3, balance: 75, coordination: 70, agility: 68, strength: 62, flexibility: 65, lastActive: '30m lalu' },
  { id: '5', name: 'Budi', level: 2, balance: 58, coordination: 52, agility: 55, strength: 48, flexibility: 45, lastActive: 'Hari ini' },
  { id: '6', name: 'Nina', level: 4, balance: 91, coordination: 85, agility: 82, strength: 75, flexibility: 78, lastActive: '10m lalu' },
  { id: '7', name: 'Rian', level: 3, balance: 70, coordination: 68, agility: 65, strength: 58, flexibility: 52, lastActive: '1j lalu' },
  { id: '8', name: 'Putri', level: 2, balance: 62, coordination: 55, agility: 60, strength: 50, flexibility: 48, lastActive: '4j lalu' },
];

const trendData = [
  { week: 'W1', avg: 65 }, { week: 'W2', avg: 68 }, { week: 'W3', avg: 72 },
  { week: 'W4', avg: 70 }, { week: 'W5', avg: 75 }, { week: 'W6', avg: 78 },
];

export default function TeacherDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const [selectedClass, setSelectedClass] = useState('3A');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const student = selectedStudent ? students3A.find((s) => s.id === selectedStudent) : null;

  const radarData = student ? [
    { skill: 'Balance', value: student.balance },
    { skill: 'Coordination', value: student.coordination },
    { skill: 'Agility', value: student.agility },
    { skill: 'Strength', value: student.strength },
    { skill: 'Flexibility', value: student.flexibility },
  ] : [];

  const totalStudents = classesData.reduce((a, c) => a + c.studentCount, 0);
  const activeToday = 18;
  const avgParticipation = 88;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-5xl">👩‍🏫</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-muted-foreground">Teacher Dashboard</div>
            <h1 className="text-3xl font-extrabold">Selamat Mengajar, {userData?.name || 'Guru'}!</h1>
            <p className="text-sm text-foreground/70">Pantau seluruh siswa, analisis perkembangan, rancang program latihan</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { l: 'Total Siswa', v: totalStudents.toString(), t: 'gradient-sky' },
          { l: 'Aktif Hari Ini', v: activeToday.toString(), t: 'gradient-grass' },
        ].map((s, i) => (
          <div key={s.l} className={`${s.t} text-white rounded-3xl p-5 shadow-soft`}>
            <div className="text-xs font-bold opacity-90">{s.l}</div>
            <div className="text-3xl font-extrabold">{s.v}</div>
          </div>
        ))}
        <div className="gradient-sunset text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Rata-rata PL Score</div>
          <div className="text-3xl font-extrabold">76</div>
        </div>
        <div className="gradient-magic text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Partisipasi</div>
          <div className="text-3xl font-extrabold">{avgParticipation}%</div>
        </div>
      </div>

      {/* Class selector */}
      <div className="bg-white rounded-3xl p-4 shadow-soft">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {classesData.map((c) => (
            <button
              key={c.name}
              onClick={() => { setSelectedClass(c.name); setSelectedStudent(null); }}
              className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                selectedClass === c.name
                  ? 'gradient-sky text-white shadow-soft'
                  : 'bg-muted/60 hover:bg-muted'
              }`}
            >
              <div>Kelas {c.name}</div>
              <div className="text-[10px] opacity-80">{c.studentCount} siswa · PL {c.avgScore}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Trend + AI Grouping */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold text-lg mb-4">Trend PL Score (6 Minggu)</h3>
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <XAxis dataKey="week" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[50, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold text-lg mb-3">AI Grouping</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-2xl">
              <div className="font-extrabold text-green-700 text-sm">🟢 Group A — Enrichment</div>
              <div className="text-xs text-green-600 mt-1">3 siswa · Advanced agility drills & skill challenges</div>
              <div className="text-xs text-muted-foreground mt-1">Nina, Mira, Sari</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="font-extrabold text-blue-700 text-sm">🔵 Group B — On Track</div>
              <div className="text-xs text-blue-600 mt-1">3 siswa · Balance & coordination focus</div>
              <div className="text-xs text-muted-foreground mt-1">Adi, Rian, Putri</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="font-extrabold text-amber-700 text-sm">🟡 Group C — Support</div>
              <div className="text-xs text-amber-600 mt-1">2 siswa · Fundamental jumping & landing</div>
              <div className="text-xs text-muted-foreground mt-1">Joko, Budi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Heatmap */}
      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-lg">Siswa — Kelas {selectedClass}</h3>
          <button onClick={() => setShowBuilder(!showBuilder)} className="px-4 py-2 rounded-full font-bold gradient-grass text-white text-sm">
            🎯 Program Latihan
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b text-xs">
                <th className="p-2">Nama</th>
                <th>Lv</th>
                <th>Balance</th>
                <th>Coord</th>
                <th>Agility</th>
                <th>PL Score</th>
                <th>Trend</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students3A.map((s) => {
                const avg = Math.round((s.balance + s.coordination + s.agility + s.strength + s.flexibility) / 5);
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStudent(selectedStudent === s.id ? null : s.id)}
                    className={`border-b last:border-0 cursor-pointer transition-all ${
                      selectedStudent === s.id ? 'bg-primary/5' : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="p-2 font-bold">{s.name}</td>
                    <td>Lv {s.level}</td>
                    <td>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.balance}%` }} />
                      </div>
                    </td>
                    <td>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.coordination}%` }} />
                      </div>
                    </td>
                    <td>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${s.agility}%` }} />
                      </div>
                    </td>
                    <td className="font-bold">{avg}</td>
                    <td className="text-green-600 font-bold">▲</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        avg >= 80 ? 'bg-green-100 text-green-700' : avg >= 65 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {avg >= 80 ? 'Thriving' : avg >= 65 ? 'On Track' : 'Support'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student detail panel */}
      {student && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-primary/20 animate-pop-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">Profil: {student.name} — Kelas {selectedClass}</h3>
            <button onClick={() => setSelectedStudent(null)} className="text-sm font-bold px-3 py-1 rounded-full bg-muted">✕ Tutup</button>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <div className="h-64">
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fontWeight: 700, fill: 'currentColor' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { l: 'Balance', v: student.balance, c: 'bg-blue-500' },
                { l: 'Coordination', v: student.coordination, c: 'bg-green-500' },
                { l: 'Agility', v: student.agility, c: 'bg-purple-500' },
                { l: 'Strength', v: student.strength, c: 'bg-red-500' },
                { l: 'Flexibility', v: student.flexibility, c: 'bg-amber-500' },
              ].map((m) => (
                <div key={m.l} className="flex items-center gap-3">
                  <span className="w-28 text-sm font-bold">{m.l}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${m.c} rounded-full transition-all`} style={{ width: `${m.v}%` }} />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{m.v}</span>
                </div>
              ))}
              <div className="mt-4 p-3 bg-primary/5 rounded-2xl text-sm font-bold">
                💡 <b>Rekomendasi AI:</b> {student.name} perlu fokus pada coordination & flexibility drills. 
                Sarankan latihan throwing & stretching 3x seminggu.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Builder */}
      {showBuilder && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-grape/20 animate-pop-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">🎯 Program Latihan — Kelas {selectedClass}</h3>
            <button onClick={() => setShowBuilder(false)} className="text-sm font-bold px-3 py-1 rounded-full bg-muted">✕ Tutup</button>
          </div>
          <div className="space-y-4">
            {[
              { day: 'Senin', focus: 'Jumping & Landing', exercises: ['Jumping Jacks 3x10', 'Squat Jumps 3x8', 'Broad Jump 5x'] },
              { day: 'Rabu', focus: 'Balance & Coordination', exercises: ['One Leg Stand 3x30s', 'Heel-to-Toe Walk 5x', 'Star Balance 3x20s'] },
              { day: 'Jumat', focus: 'Agility & Speed', exercises: ['Shuttle Run 5x', 'Ladder Drill 3 sets', 'Cone Zigzag 5x'] },
            ].map((day) => (
              <div key={day.day} className="p-4 bg-muted/40 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-extrabold">{day.day}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full gradient-grass text-white">{day.focus}</span>
                </div>
                <div className="space-y-1">
                  {day.exercises.map((ex) => (
                    <div key={ex} className="text-sm pl-4 before:content-['•'] before:mr-2 before:text-primary">{ex}</div>
                  ))}
                </div>
              </div>
            ))}
            <button className="w-full py-3 rounded-full font-bold gradient-sunset text-white text-sm">
              + Tambah Sesi Latihan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
