'use client';

import { Suspense, useState, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Camera, Upload, Video, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const scores = [
  { label: 'Meliuk', value: 84, color: 'gradient-grass', emoji: '🐍' },
  { label: 'Menekuk', value: 76, color: 'gradient-sky', emoji: '🦵' },
  { label: 'Memutar', value: 82, color: 'gradient-magic', emoji: '🌀' },
  { label: 'Mengayun', value: 71, color: 'gradient-sunset', emoji: '🌊' },
  { label: 'Membungkuk', value: 78, color: 'gradient-gold', emoji: '🙇' },
  { label: 'Mendorong', value: 90, color: 'gradient-sunset', emoji: '💪' },
];

/* ─── confetti burst (top of page) ─── */
// Seeded pseudo-random for stable render
const seed = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function ConfettiBurst() {
  const pieces = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: seed(i) * 100,
    delay: seed(i + 30) * 2,
    size: 6 + seed(i + 60) * 6,
    color: ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ec4899'][i % 6],
    rotate: seed(i + 90) * 360,
  })), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute animate-confetti-long"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── sparkle dots scattered around ─── */
function SparkleDots({ count = 12 }: { count?: number }) {
  const dots = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 5 + seed(i + 200) * 90,
    top: 5 + seed(i + 300) * 90,
    delay: seed(i + 400) * 3,
    size: 10 + seed(i + 500) * 10,
  })), [count]);
  return (
    <div className="pointer-events-none absolute inset-0">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute animate-sparkle text-amber-400/60"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            fontSize: d.size,
            animationDelay: `${d.delay}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

/* ─── floating MOVA tip at page bottom ─── */
function MovaTip() {
  const tips = [
    '🌟 Tahukah kamu? Bergerak setiap hari membuat otakmu lebih pintar!',
    '🎉 Hebat! Kamu sudah belajar 6 gerakan hari ini!',
    '💪 Semangat terus ya! MOVA selalu mendukungmu!',
    '🌈 Aktivitas fisik bikin hati senang dan tubuh sehat!',
  ];
  const tip = useMemo(() => {
    const dayIndex = new Date().getDate() % tips.length;
    return tips[dayIndex];
  }, []);
  return (
    <div className="mt-10 bg-gradient-to-r from-amber-50 to-orange-50 rounded-[2rem] border-4 border-amber-200 shadow-pop p-5 text-center animate-pop-in relative overflow-hidden">
      <SparkleDots count={6} />
      <div className="text-2xl mb-1 animate-bounce-sm">🐾</div>
      <p className="font-bold text-sm text-amber-800 relative z-10">{tip}</p>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center">
          <span className="text-sm font-bold text-muted-foreground animate-pulse">
            Memuat...
          </span>
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}

function AssessmentContent() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const role = userData?.role;
  const searchParams = useSearchParams();
  const activityObjective = searchParams?.get('objective') ?? null;
  const activityName = searchParams?.get('activity') ?? null;
  const worldName = searchParams?.get('world') ?? null;

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

  const children = useQuery(
    api.users.getChildren,
    role === 'parent' && userData?._id ? { parentId: userData._id } : 'skip'
  );
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const targetName =
    role === 'teacher'
      ? students?.find((s) => s._id === selectedStudentId)?.name
      : role === 'parent'
        ? children?.find((c) => c && c._id === selectedChildId)?.name
        : userData?.name;

  const masteredCount = scores.filter((s) => s.value >= 80).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 relative">
      {/* ─── confetti + sparkle layer ─── */}
      <ConfettiBurst />
      <SparkleDots count={18} />

      {/* ─── HEADER ─── */}
      <div className="text-center mb-8 animate-pop-in relative">
        <div className="inline-block bg-white/80 px-5 py-1.5 rounded-full text-sm font-bold mb-3 shadow-soft border-2 border-amber-300">
          {role === 'parent' ? '📊 Analisis Gerak' : '🎥 AI Pose Coach'}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-green-500 flex items-center justify-center gap-3">
          <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-pop inline-block animate-float overflow-hidden flex-shrink-0">
            <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
          </span>
          {role === 'teacher'
            ? 'Rekam Siswa'
            : role === 'parent'
              ? 'Analisis Anak'
              : 'Tunjukkan Gerakanmu!'}
          <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-pop inline-block animate-float overflow-hidden flex-shrink-0" style={{ animationDelay: '0.5s' }}>
            <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
          </span>
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          {role === 'teacher'
            ? 'Pilih siswa, lalu mulai AI Coach untuk merekam satu per satu.'
            : role === 'parent'
              ? 'Lihat hasil analisis gerak anak kamu.'
              : 'AI melacak kerangka tubuh dan kualitas gerakmu secara real time.'}
        </p>
      </div>

      {/* ─── ROLE-BASED SELECTORS ─── */}
      {role === 'teacher' && (
        <div className="bg-white rounded-3xl p-4 shadow-pop border-4 border-sky-200 mb-6 animate-slide-up">
          <h3 className="font-extrabold mb-3 flex items-center gap-2">
            <span className="text-lg">🏫</span> Pilih Kelas & Siswa
          </h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {classes?.map((c) => (
              <button
                key={c._id}
                onClick={() => {
                  setSelectedClassId(c._id);
                  setSelectedStudentId(null);
                }}
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all hover:animate-bounce-sm ${
                  selectedClassId === c._id
                    ? 'gradient-sky text-white shadow-pop scale-105'
                    : 'bg-muted hover:bg-sky-100'
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
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all hover:animate-bounce-sm ${
                    selectedStudentId === s._id
                      ? 'gradient-grass text-white shadow-pop scale-105'
                      : 'bg-muted hover:bg-green-100'
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
        <div className="bg-white rounded-3xl p-4 shadow-pop border-4 border-orange-200 mb-6 animate-slide-up">
          <h3 className="font-extrabold mb-3 flex items-center gap-2">
            <span className="text-lg">👨‍👩‍👧</span> Pilih Anak
          </h3>
          <div className="flex gap-2">
            {(children ?? [])
              .filter((c): c is NonNullable<typeof c> => c !== null)
              .map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedChildId(c._id)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all hover:animate-bounce-sm ${
                    selectedChildId === c._id
                      ? 'gradient-sunset text-white shadow-pop scale-105'
                      : 'bg-muted hover:bg-orange-100'
                  }`}
                >
                  {c.avatar} {c.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ─── Target label ─── */}
      {targetName && (
        <div className="text-center mb-4 animate-pop-in">
          <span className="text-sm font-bold bg-primary/10 text-primary px-5 py-1.5 rounded-full shadow-soft border-2 border-primary/20">
            {role === 'teacher' ? '🎯 Siswa: ' : role === 'parent' ? '👶 Anak: ' : ''}
            {targetName}
          </span>
        </div>
      )}

      {/* ─── Learning Objective Banner ─── */}
      {activityObjective && (
        <div className="mb-8 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-[2rem] border-4 border-green-300 shadow-pop p-5 animate-pop-in relative overflow-hidden">
          <SparkleDots count={6} />
          <div className="flex items-start gap-4 relative z-10">
            <span className="text-4xl animate-wiggle flex-shrink-0">🌍</span>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-extrabold px-3 py-1 rounded-full mb-2">
                <span>🎯</span> Tujuan Pembelajaran
              </div>
              <div className="font-extrabold text-lg text-green-800">
                {worldName ? `Dunia ${worldName}` : 'Aktivitas'} — {activityName}
              </div>
              <div className="text-sm font-bold text-green-700 mt-1">{activityObjective}</div>
            </div>
            <span className="text-3xl animate-bounce-sm flex-shrink-0">✨</span>
          </div>
        </div>
      )}

      {/* ─── PARENT VIEW: analysis only, no camera ─── */}
      {role === 'parent' ? (
        <div className="space-y-6 relative">
          <SparkleDots count={10} />

          {/* MOVA speech bubble — parent */}
          <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-amber-200 animate-pop-in relative">
            <SparkleDots count={5} />
            <div className="flex items-start gap-4 mb-4 relative z-10">
              <div className="w-20 h-20 -mt-1 animate-dance-slow flex-shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 shadow-pop overflow-hidden">
                <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
              </div>
              <div className="bg-primary/10 rounded-2xl rounded-tl-none p-5 flex-1 shadow-soft">
                <div className="font-extrabold text-sm text-primary mb-1 flex items-center gap-1">
                  <span className="animate-sparkle">✨</span> MOVA berkata
                </div>
                <p className="text-sm font-bold leading-relaxed">
                  {targetName ? (
                    <>
                      <span className="text-lg">{targetName} sudah menguasai {masteredCount} dari {scores.length} gerakan!{' '}
                      </span>
                      <span className="animate-celebrate inline-block">🎉</span>
                      <span className="text-lg"> Hebat banget! Terus semangat ya! 💪</span>
                    </>
                  ) : (
                    <span className="text-lg">Pilih anak terlebih dahulu untuk melihat analisis ya! 🌟</span>
                  )}
                </p>
              </div>
            </div>

            {/* score cards — parent */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
              {scores.map((s, i) => (
                <div
                  key={s.label}
                  className={`${s.color} text-white rounded-2xl p-4 shadow-soft transition-all hover:scale-105 hover:shadow-pop cursor-default relative overflow-hidden animate-slide-up`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="absolute top-1 right-2 text-xs opacity-50 animate-sparkle" style={{ animationDelay: `${i * 0.3}s` }}>✦</div>
                  <div className="text-xs font-bold opacity-90">{s.emoji} {s.label}</div>
                  <div className="text-3xl font-extrabold">{s.value}</div>
                  <div className="text-[10px] font-bold opacity-70 mt-0.5">
                    {s.value >= 80 ? '⭐ Mantap!' : s.value >= 70 ? '👍 Bagus' : '💪 Semangat!'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI insights — parent */}
          <div className="bg-white rounded-[2rem] p-6 shadow-soft border-4 border-purple-200 animate-slide-up relative overflow-hidden">
            <SparkleDots count={4} />
            <h3 className="font-extrabold mb-3 flex items-center gap-2 relative z-10">
              <span className="text-xl animate-wiggle">🧠</span>
              <Sparkles className="w-5 h-5 text-accent" /> Wawasan AI
            </h3>
            <ul className="text-sm space-y-3 relative z-10">
              <li className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">🌟</span>
                <span><b>Kelebihan:</b> Meliuk & mengayun sudah optimal! Keren sekali!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">💪</span>
                <span><b>Perlu Diperbaiki:</b> Ayo latihan menekuk & membungkuk lebih rutin!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">🎮</span>
                <span><b>Saran:</b> Coba mainkan aktivitas Mendorong & Menarik berikutnya!</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /* ─── TEACHER & STUDENT: camera + coach ─── */
        <div className="grid lg:grid-cols-2 gap-6 relative">
          <SparkleDots count={8} />

          {/* Camera panel */}
          <div className="bg-foreground/90 text-white rounded-[2rem] p-6 shadow-pop relative overflow-hidden border-4 border-white/10 animate-slide-up">
            {/* sparkle decoration around frame */}
            <div className="absolute top-2 left-1/4 animate-sparkle text-amber-300/70 text-sm" style={{ animationDelay: '0.5s' }}>✦</div>
            <div className="absolute top-4 right-6 animate-sparkle text-green-300/70 text-xs" style={{ animationDelay: '1s' }}>✦</div>
            <div className="absolute bottom-20 left-6 animate-sparkle text-blue-300/70 text-sm" style={{ animationDelay: '1.5s' }}>✦</div>
            <div className="absolute bottom-16 right-1/4 animate-sparkle text-pink-300/70 text-xs" style={{ animationDelay: '0.8s' }}>✦</div>

            <div className="aspect-video rounded-2xl bg-black/40 grid place-items-center relative overflow-hidden border-2 border-white/20">
              <div className="absolute inset-0 grid place-items-center opacity-60">
                <svg viewBox="0 0 200 200" className="w-2/3 h-2/3">
                  <circle cx="100" cy="40" r="14" fill="oklch(0.82 0.2 145)" />
                  <line x1="100" y1="54" x2="100" y2="120" stroke="white" strokeWidth="4" />
                  <line x1="100" y1="70" x2="60" y2="100" stroke="white" strokeWidth="4" />
                  <line x1="100" y1="70" x2="140" y2="100" stroke="white" strokeWidth="4" />
                  <line x1="100" y1="120" x2="70" y2="180" stroke="white" strokeWidth="4" />
                  <line x1="100" y1="120" x2="130" y2="180" stroke="white" strokeWidth="4" />
                  {[
                    [60, 100, 'oklch(0.82 0.2 145)'],
                    [140, 100, 'oklch(0.9 0.18 95)'],
                    [70, 180, 'oklch(0.82 0.2 145)'],
                    [130, 180, 'oklch(0.65 0.24 25)'],
                    [100, 70, 'oklch(0.82 0.2 145)'],
                    [100, 120, 'oklch(0.9 0.18 95)'],
                  ].map(([x, y, c], i) => (
                    <circle key={i} cx={x as number} cy={y as number} r="6" fill={c as string} />
                  ))}
                </svg>
              </div>
              <div className="absolute top-3 left-3 bg-red-500 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse shadow-pop">
                ● LIVE
              </div>
              <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur text-xs font-bold px-3 py-1 rounded-full">
                Pelacakan Pose
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 rounded-full font-bold gradient-sunset text-white border-0 h-12 flex items-center justify-center shadow-pop transition-all hover:scale-105 active:scale-95">
                <Camera className="w-4 h-4 mr-1.5" /> Mulai Rekam
              </button>
              <button className="rounded-full font-bold h-12 w-12 bg-white/20 text-white flex items-center justify-center transition-all hover:bg-white/30 hover:scale-105">
                <Video className="w-4 h-4" />
              </button>
              <button className="rounded-full font-bold h-12 w-12 bg-white/20 text-white flex items-center justify-center transition-all hover:bg-white/30 hover:scale-105">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs opacity-70 mt-3 flex gap-4 font-medium">
              <span>🟢 Bagus</span>
              <span>🟡 Cukup</span>
              <span>🔴 Perlu Perbaikan</span>
            </div>
          </div>

          {/* Right column: MOVA bubble + scores + insights */}
          <div className="space-y-4 relative">
            <SparkleDots count={6} />

            {/* MOVA speech bubble — teacher/student */}
            <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-amber-200 animate-pop-in relative overflow-hidden">
              <SparkleDots count={4} />
              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className="w-20 h-20 -mt-1 animate-wobble flex-shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 shadow-pop overflow-hidden">
                  <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
                </div>
                <div className="bg-primary/10 rounded-2xl rounded-tl-none p-5 flex-1 shadow-soft">
                  <div className="font-extrabold text-sm text-primary mb-1 flex items-center gap-1">
                    <span className="animate-sparkle">✨</span> MOVA berkata
                  </div>
                  <p className="text-sm font-bold leading-relaxed">
                    {role === 'teacher' ? (
                      <>
                        Rekaman untuk {targetName ?? '...'} siap! 🎬 Gerakan meliuk sudah bagus, coba tambah latihan menekuk! 💪
                      </>
                    ) : (
                      <>
                        Keren! Gerakan meliukmu bagus banget! 🌟 Coba tekuk lutut sedikit lagi ya! Minggu ini naik 15%! 📈
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* score cards — teacher/student */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
                {scores.map((s, i) => (
                  <div
                    key={s.label}
                    className={`${s.color} text-white rounded-2xl p-4 shadow-soft transition-all hover:scale-105 hover:shadow-pop cursor-default relative overflow-hidden animate-slide-up`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="absolute top-1 right-2 text-xs opacity-50 animate-sparkle" style={{ animationDelay: `${i * 0.3}s` }}>✦</div>
                    <div className="text-xs font-bold opacity-90">{s.emoji} {s.label}</div>
                    <div className="text-3xl font-extrabold">{s.value}</div>
                    <div className="text-[10px] font-bold opacity-70 mt-0.5">
                      {s.value >= 80 ? '⭐ Mantap!' : s.value >= 70 ? '👍 Bagus' : '💪 Semangat!'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI insights — teacher/student */}
            <div className="bg-white rounded-[2rem] p-6 shadow-soft border-4 border-purple-200 animate-slide-up relative overflow-hidden">
              <SparkleDots count={4} />
              <h3 className="font-extrabold mb-3 flex items-center gap-2 relative z-10">
                <span className="text-xl animate-wiggle">🧠</span>
                <Sparkles className="w-5 h-5 text-accent" /> Wawasan AI
              </h3>
              <ul className="text-sm space-y-3 relative z-10">
                <li className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">🌟</span>
                  <span><b>Kelebihan:</b> Meliuk & mengayun sudah optimal! Keren sekali!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">💪</span>
                  <span><b>Perlu Diperbaiki:</b> Ayo latihan menekuk & membungkuk lebih rutin!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">🎮</span>
                  <span><b>Saran:</b> Coba mainkan aktivitas Mendorong & Menarik berikutnya!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating MOVA Tip ─── */}
      <MovaTip />
    </div>
  );
}
