'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Camera, Upload, Video, Sparkles } from 'lucide-react';

const scores = [
  { label: 'Meliuk', value: 84, color: 'gradient-grass' },
  { label: 'Menekuk', value: 76, color: 'gradient-sky' },
  { label: 'Memutar', value: 82, color: 'gradient-magic' },
  { label: 'Mengayun', value: 71, color: 'gradient-sunset' },
  { label: 'Membungkuk', value: 78, color: 'gradient-gold' },
  { label: 'Mendorong', value: 90, color: 'gradient-sunset' },
];

export default function AssessmentPage() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const role = userData?.role;

  // For teacher: fetch students by class
  const classes = useQuery(
    api.classes.getClassesBySchool,
    role === 'teacher' && userData?.schoolId ? { schoolId: userData.schoolId } : 'skip'
  );
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const students = useQuery(
    api.users.getUsersByClass,
    selectedClassId ? { classId: selectedClassId as any } : 'skip'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // For parent: fetch children
  // In real app, use userData.childIds to fetch children
  const dummyChildren = [
    { _id: '1', name: 'Adi', avatar: '🧒' },
    { _id: '2', name: 'Sari', avatar: '👧' },
  ];
  const [selectedChildId, setSelectedChildId] = useState(dummyChildren[0]._id);

  const targetName = role === 'teacher'
    ? students?.find((s) => s._id === selectedStudentId)?.name
    : role === 'parent'
    ? dummyChildren.find((c) => c._id === selectedChildId)?.name
    : userData?.name;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8 animate-pop-in">
        <div className="inline-block bg-white/80 px-4 py-1 rounded-full text-sm font-bold mb-3">🎥 AI Pose Coach</div>
        <h1 className="text-4xl md:text-5xl font-extrabold">
          {role === 'teacher' ? 'Rekam Siswa' : role === 'parent' ? 'Pantau Anak' : 'Tunjukkan Gerakanmu!'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {role === 'teacher'
            ? 'Pilih siswa, lalu mulai AI Coach untuk merekam satu per satu.'
            : role === 'parent'
            ? 'Pilih anak untuk melihat hasil analisis gerak non-lokomotor.'
            : 'AI melacak kerangka tubuh dan kualitas gerakmu secara real time.'}
        </p>
      </div>

      {/* Role-based selector */}
      {role === 'teacher' && (
        <div className="bg-white rounded-3xl p-4 shadow-soft mb-6">
          <h3 className="font-extrabold mb-3">Pilih Kelas & Siswa</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {classes?.map((c) => (
              <button
                key={c._id}
                onClick={() => { setSelectedClassId(c._id); setSelectedStudentId(null); }}
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  selectedClassId === c._id ? 'gradient-sky text-white' : 'bg-muted'
                }`}
              >
                Kelas {c.name}
              </button>
            ))}
          </div>
          {selectedClassId && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {students?.filter((s) => s.role === 'student').map((s) => (
                <button
                  key={s._id}
                  onClick={() => setSelectedStudentId(s._id)}
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                    selectedStudentId === s._id ? 'gradient-grass text-white' : 'bg-muted'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {role === 'parent' && (
        <div className="bg-white rounded-3xl p-4 shadow-soft mb-6">
          <h3 className="font-extrabold mb-3">Pilih Anak</h3>
          <div className="flex gap-2">
            {dummyChildren.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedChildId(c._id)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  selectedChildId === c._id ? 'gradient-sunset text-white' : 'bg-muted'
                }`}
              >
                {c.avatar} {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Target label */}
      {targetName && (
        <div className="text-center mb-4">
          <span className="text-sm font-bold bg-primary/10 text-primary px-4 py-1 rounded-full">
            {role === 'teacher' ? '🎯 Siswa: ' : role === 'parent' ? '👶 Anak: ' : ''}{targetName}
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera area */}
        <div className="bg-foreground/90 text-white rounded-[2rem] p-6 shadow-pop relative overflow-hidden">
          <div className="aspect-video rounded-2xl bg-black/40 grid place-items-center relative overflow-hidden">
            <div className="absolute inset-0 grid place-items-center opacity-60">
              <svg viewBox="0 0 200 200" className="w-2/3 h-2/3">
                <circle cx="100" cy="40" r="14" fill="oklch(0.82 0.2 145)" />
                <line x1="100" y1="54" x2="100" y2="120" stroke="white" strokeWidth="4" />
                <line x1="100" y1="70" x2="60" y2="100" stroke="white" strokeWidth="4" />
                <line x1="100" y1="70" x2="140" y2="100" stroke="white" strokeWidth="4" />
                <line x1="100" y1="120" x2="70" y2="180" stroke="white" strokeWidth="4" />
                <line x1="100" y1="120" x2="130" y2="180" stroke="white" strokeWidth="4" />
                {[[60,100,"oklch(0.82 0.2 145)"],[140,100,"oklch(0.9 0.18 95)"],[70,180,"oklch(0.82 0.2 145)"],[130,180,"oklch(0.65 0.24 25)"],[100,70,"oklch(0.82 0.2 145)"],[100,120,"oklch(0.9 0.18 95)"]].map(([x,y,c],i)=>(
                  <circle key={i} cx={x as number} cy={y as number} r="6" fill={c as string} />
                ))}
              </svg>
            </div>
            <div className="absolute top-3 left-3 bg-red-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">● LIVE</div>
            <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur text-xs font-bold px-3 py-1 rounded-full">Pelacakan Pose</div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 rounded-full font-bold gradient-sunset text-white border-0 h-12 flex items-center justify-center">
              <Camera className="w-4 h-4 mr-1" /> Mulai Rekam
            </button>
            <button className="rounded-full font-bold h-12 w-12 bg-white/20 text-white flex items-center justify-center">
              <Video className="w-4 h-4" />
            </button>
            <button className="rounded-full font-bold h-12 w-12 bg-white/20 text-white flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs opacity-70 mt-3 flex gap-4">
            <span>🟢 Bagus</span><span>🟡 Cukup</span><span>🔴 Perlu Perbaikan</span>
          </div>
        </div>

        {/* MOVA feedback */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 shadow-pop">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-16 h-16 -mt-2 animate-wobble flex items-center justify-center text-4xl">🦊</div>
              <div className="bg-primary/10 rounded-2xl rounded-tl-none p-4 flex-1">
                <div className="font-bold text-sm text-primary">MOVA berkata</div>
                <p className="text-sm font-bold mt-1">
                  {role === 'teacher'
                    ? `"Rekaman untuk ${targetName} siap! Gerakan meliuk sudah bagus, coba tambah latihan menekuk."`
                    : role === 'parent'
                    ? `"${targetName} sudah menguasai 3 dari 6 gerakan. Semangat terus!"`
                    : `"Gerakan meliukmu bagus! 🎉 Coba tekuk lutut sedikit lagi. Minggu ini naik 15%!"`}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {scores.map((s) => (
                <div key={s.label} className={`${s.color} text-white rounded-2xl p-3 shadow-soft`}>
                  <div className="text-xs font-bold opacity-90">{s.label}</div>
                  <div className="text-2xl font-extrabold">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-soft">
            <h3 className="font-extrabold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Wawasan AI</h3>
            <ul className="text-sm space-y-2">
              <li><b>Kelebihan:</b> Meliuk & mengayun sudah optimal.</li>
              <li><b>Perlu Diperbaiki:</b> Perlu latihan menekuk & membungkuk lebih rutin.</li>
              <li><b>Saran:</b> Coba mainkan aktivitas Mendorong & Menarik berikutnya!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
