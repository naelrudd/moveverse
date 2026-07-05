'use client';

import { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useLiveCoachEngine, type SessionResult } from '@/hooks/useLiveCoachEngine';
import { type MovementType, movementToPhysicalLiteracy } from '@/lib/fms-scoring';
import { MovementSelector } from '@/components/coach/MovementSelector';
import { LivePoseCoach } from '@/components/coach/LivePoseCoach';

/* ─── confetti burst ─── */
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

/* ─── sparkle dots ─── */
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
          style={{ left: `${d.left}%`, top: `${d.top}%`, fontSize: d.size, animationDelay: `${d.delay}s` }}
        >✦</span>
      ))}
    </div>
  );
}

/* ─── Session Complete Screen (after Selesai) ─── */
function SessionComplete({ result, newBadges, onDismiss }: { result: SessionResult; newBadges?: string[]; onDismiss: () => void }) {
  const BADGE_MAP: Record<string, { emoji: string; label: string }> = {
    first_session: { emoji: '🌟', label: 'Sesi Pertama!' },
    perfect_score: { emoji: '💎', label: 'Skor Sempurna!' },
    excellent_form: { emoji: '🏅', label: 'Form Hebat!' },
    rep_master: { emoji: '🔄', label: 'Master Repetisi!' },
    max_level: { emoji: '👑', label: 'Max Level!' },
    all_rounder: { emoji: '🎯', label: 'Serba Bisa!' },
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-green-200 animate-pop-in relative overflow-hidden">
      <SparkleDots count={8} />
      <div className="text-center relative z-10">
        <div className="text-5xl mb-3 animate-celebrate">🎉</div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-1">Sesi Selesai!</h2>
        <p className="text-sm font-bold text-muted-foreground mb-4">
          {result.activity} Lv.{result.level} • {result.duration.toFixed(0)} detik
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3 border-2 border-green-200">
            <div className="text-2xl font-extrabold text-green-700">{result.reps}</div>
            <div className="text-xs font-bold text-green-600">Repetisi</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border-2 border-amber-200">
            <div className="text-2xl font-extrabold text-amber-700">{result.avgScore}</div>
            <div className="text-xs font-bold text-amber-600">Skor Avg</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 border-2 border-purple-200">
            <div className="text-2xl font-extrabold text-purple-700">{result.holdTime.toFixed(1)}s</div>
            <div className="text-xs font-bold text-purple-600">Best Hold</div>
          </div>
        </div>

        {/* New Badges */}
        {newBadges && newBadges.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-extrabold text-amber-700 mb-2">🏆 Badge Baru!</div>
            <div className="flex gap-2 flex-wrap justify-center">
              {newBadges.map((b) => {
                const info = BADGE_MAP[b] ?? { emoji: '⭐', label: b };
                return (
                  <div key={b} className="bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-2 text-center animate-pop-in">
                    <div className="text-2xl">{info.emoji}</div>
                    <div className="text-[10px] font-bold text-amber-800">{info.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* XP earned */}
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-3 border-2 border-amber-300 mb-4">
          <span className="text-sm font-extrabold text-amber-800">⭐ +{Math.round(result.avgScore * 0.5 + result.reps * 2 + result.level * 3)} XP</span>
          <span className="text-xs font-bold text-amber-600 ml-2">({result.reps} rep × 2 + Lv.{result.level} × 3 + avgScore × 0.5)</span>
        </div>

        {/* Mini Radar Chart (Physical Literacy) */}
        <div className="bg-white rounded-xl p-3 border-2 border-sky-200 mb-4">
          <div className="text-xs font-extrabold text-sky-700 mb-2">🎯 Kontribusi Literasi Fisik</div>
          <div className="flex justify-center">
            <svg width="140" height="140" viewBox="0 0 200 200">
              {(() => {
                const metrics = movementToPhysicalLiteracy(result.activity, result.avgScore);
                const entries = Object.entries(metrics);
                const cx = 100, cy = 100, r = 70;
                const levels = [0.25, 0.5, 0.75, 1];
                const labels = ['B', 'K', 'A', 'F', 'S']; // Balance, Coordination, Agility, Flexibility, Strength
                const n = entries.length;
                const angleStep = (2 * Math.PI) / n;

                return (
                  <>
                    {/* Grid circles */}
                    {levels.map((l) => (
                      <circle key={l} cx={cx} cy={cy} r={r * l} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    ))}
                    {/* Axes */}
                    {entries.map((_, i) => {
                      const angle = angleStep * i - Math.PI / 2;
                      return (
                        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="#cbd5e1" strokeWidth="1" />
                      );
                    })}
                    {/* Data polygon */}
                    <polygon
                      points={entries.map(([, val], i) => {
                        const angle = angleStep * i - Math.PI / 2;
                        const score = Math.min(100, val * 10) / 100; // scale delta to 0-100
                        return `${cx + r * score * Math.cos(angle)},${cy + r * score * Math.sin(angle)}`;
                      }).join(' ')}
                      fill="rgba(59,130,246,0.2)"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    {/* Labels */}
                    {labels.map((label, i) => {
                      const angle = angleStep * i - Math.PI / 2;
                      return (
                        <text key={i} x={cx + (r + 15) * Math.cos(angle)} y={cy + (r + 15) * Math.sin(angle)} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-bold fill-sky-700">
                          {label}
                        </text>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* MOVA message */}
        <div className="flex items-start gap-3 text-left bg-primary/5 rounded-2xl p-4 border-2 border-primary/10 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-soft flex-shrink-0 overflow-hidden">
            <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-extrabold text-primary mb-0.5">✨ MOVA berkata</div>
            <p className="text-sm font-bold leading-snug">
              {result.avgScore >= 80
                ? '🌟 Luar biasa! Gerakanmu sudah sempurna! Terus semangat ya!'
                : result.avgScore >= 60
                  ? '💪 Bagus sekali! Tingkatkan sedikit lagi, pasti bisa lebih baik!'
                  : '🔥 Hebat sudah mencoba! Ayo latihan lagi minggu depan!'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const text = `🎮 MOVEVERSE — Sesi Latihan!\n${result.activity} Lv.${result.level}\n⭐ Skor: ${result.avgScore} | 🔄 Rep: ${result.reps} | ⏱️ ${result.duration.toFixed(0)}s\n${result.newBadges?.length ? '🏆 ' + result.newBadges.join(', ') : ''}\n\n#MOVEVERSE #PJOKDigital`;
            if (navigator.share) {
              navigator.share({ title: 'MOVEVERSE', text }).catch(() => {});
            } else {
              navigator.clipboard.writeText(text).then(() => alert('Disalin ke clipboard! 📋'));
            }
          }}
          className="w-full rounded-full font-bold bg-white text-sky-600 border-2 border-sky-300 h-11 flex items-center justify-center shadow-soft transition-all hover:scale-105 active:scale-95 mb-2"
        >
          📤 Bagikan Hasil
        </button>

        <button
          onClick={onDismiss}
          className="w-full rounded-full font-bold gradient-sky text-white border-0 h-12 flex items-center justify-center shadow-pop transition-all hover:scale-105 active:scale-95"
        >
          ✨ Kembali ke Coach
        </button>
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="p-10 text-center">
        <span className="text-sm font-bold text-muted-foreground animate-pulse">Memuat...</span>
      </div>
    }>
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
  const worldId = searchParams?.get('worldId') ?? null;
  const logSession = useMutation(api.liveCoach.logMovementSession);

  // Role-based selectors
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

  // Coach state
  const [activity, setActivity] = useState<MovementType>('menekuk');
  const [level, setLevel] = useState(1);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showCalibration, setShowCalibration] = useState(false);

  const targetUserId = role === 'teacher'
    ? selectedStudentId
    : role === 'parent'
      ? selectedChildId
      : userData?._id;

  // Thresholds from Convex (saved by guru)
  const savedThresholds = useQuery(
    api.users.getCoachThresholds,
    targetUserId ? { userId: targetUserId as any } : 'skip'
  );
  const saveThresholdsMutation = useMutation(api.users.saveCoachThresholds);

  // Live session data for teacher/parent monitoring
  const liveSessionData = useQuery(
    api.users.getLiveSessionData,
    (role === 'teacher' || role === 'parent') && targetUserId
      ? { userId: targetUserId as any }
      : 'skip'
  );

  const handleComplete = useCallback((result: SessionResult) => {
    setSessionResult(result);
    // Audio feedback
    if (audioEnabled) {
      try {
        const audioCtx = new AudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = result.avgScore >= 80 ? 523 : result.avgScore >= 60 ? 440 : 349;
        gain.gain.value = 0.15;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch { /* ignore audio errors */ }
    }
    // Log to Convex in background + get new badges
    if (targetUserId) {
      logSession({
        userId: targetUserId as any,
        activity: result.activity,
        level: result.level,
        reps: result.reps,
        avgScore: result.avgScore,
        holdTime: result.holdTime,
        duration: result.duration,
        scoreHistory: result.scoreHistory,
      }).then((res) => {
        if (res?.newBadges?.length) {
          setSessionResult((prev) => prev ? { ...prev, newBadges: res.newBadges } : prev);
        }
      }).catch(console.error);
    }
  }, [targetUserId, logSession, audioEnabled]);

  const handleSaveThresholds = useCallback((key: string, value: number) => {
    if (!targetUserId) return;
    saveThresholdsMutation({ userId: targetUserId as any, thresholds: { [key]: value } }).catch(console.error);
  }, [targetUserId, saveThresholdsMutation]);

  const coach = useLiveCoachEngine({
    activity,
    level,
    userId: targetUserId ?? '',
    role: (role as 'student' | 'teacher' | 'parent') ?? 'student',
    thresholds: savedThresholds,
    onComplete: handleComplete,
  });

  return (
    <div className={`min-h-screen relative ${coach.isFullScreen ? '' : 'bg-theme-tiger'}`}>
      {/* Full Screen Mode — portal ke body, bypass header/footer */}
      {coach.isFullScreen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          <LivePoseCoach state={coach} videoRef={coach.videoRef} canvasRef={coach.canvasRef} levelConfig={coach.levelConfig} />
        </div>,
        document.body
      )}

      {/* Split View Mode — only when NOT fullscreen */}
      {!coach.isFullScreen && (
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-10 relative">
          <ConfettiBurst />
          <SparkleDots count={18} />

          {/* HEADER */}
          <div className="text-center mb-8 animate-pop-in relative">
            <div className="inline-block bg-white/80 px-5 py-1.5 rounded-full text-sm font-bold mb-3 shadow-soft border-2 border-amber-300">
              {role === 'parent' ? '📊 Analisis Gerak' : '🎥 AI Pose Coach'}
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-green-500 flex items-center justify-center gap-2 sm:gap-3">
              <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-pop inline-block animate-float overflow-hidden flex-shrink-0">
                <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
              </span>
              {role === 'teacher'
                ? 'Rekam Peserta Didik'
                : role === 'parent'
                  ? 'Analisis Anak'
                  : 'Tunjukkan Gerakanmu!'}
              <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-pop inline-block animate-float overflow-hidden flex-shrink-0" style={{ animationDelay: '0.5s' }}>
                <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
              </span>
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">
              {role === 'teacher'
                ? 'Pilih peserta didik, lalu mulai AI Coach.'
                : role === 'parent'
                  ? 'Lihat hasil analisis gerak anak kamu.'
                  : 'AI melacak gerakmu secara real time. Pilih gerakan & level, lalu mulai!'}
            </p>
          </div>

          {/* ROLE-BASED SELECTORS */}
          {role === 'teacher' && (
            <div className="bg-white rounded-3xl p-4 shadow-pop border-4 border-sky-200 mb-6 animate-slide-up">
              <h3 className="font-extrabold mb-3 flex items-center gap-2">
                <span className="text-lg">🏫</span> Pilih Kelas & Peserta Didik
              </h3>
              <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar mb-3">
                {classes?.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => { setSelectedClassId(c._id); setSelectedStudentId(null); }}
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
                <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
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
                {(children ?? []).filter((c): c is NonNullable<typeof c> => c !== null).map((c) => (
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

          {/* Target label */}
          {targetName && (
            <div className="text-center mb-4 animate-pop-in">
              <span className="text-sm font-bold bg-primary/10 text-primary px-5 py-1.5 rounded-full shadow-soft border-2 border-primary/20">
                {role === 'teacher' ? '🎯 Peserta Didik: ' : role === 'parent' ? '👶 Anak: ' : ''}{targetName}
              </span>
            </div>
          )}

          {/* Learning Objective Banner */}
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

          {/* PARENT VIEW: analysis only, no camera */}
          {role === 'parent' ? (
            <div className="space-y-6 relative">
              <SparkleDots count={10} />
              <div className="bg-white rounded-2xl p-4 shadow-pop border-2 border-amber-200 animate-pop-in relative">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-14 h-14 animate-dance-slow flex-shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-pop overflow-hidden">
                    <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
                  </div>
                  <div className="bg-primary/10 rounded-xl rounded-tl-none px-3 py-2 flex-1 shadow-soft">
                    <div className="font-extrabold text-xs text-primary mb-0.5 flex items-center gap-1">
                      <span className="animate-sparkle">✨</span> MOVA
                    </div>
                    <p className="text-xs font-bold leading-snug">
                      {targetName ? (
                        <>Pilih aktivitas untuk lihat analisis {targetName}! 🌟</>
                      ) : (
                        <>Pilih anak terlebih dahulu! 👶</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─── STUDENT & TEACHER: Split View (Camera 60% + Panel 40%) ─── */
            <div className="relative">
              {/* Session complete overlay */}
              {sessionResult && (
                <div className="mb-6">
                  <SessionComplete result={sessionResult} newBadges={sessionResult.newBadges} onDismiss={() => setSessionResult(null)} />
                </div>
              )}

              {/* Movement Selector */}
              <div className="bg-white rounded-[2rem] p-4 shadow-pop border-4 border-sky-200 mb-4 animate-slide-up">
                <h3 className="font-extrabold mb-3 flex items-center gap-2 text-sm">
                  <span className="text-lg">🎮</span> Pilih Gerakan & Level
                </h3>
                <MovementSelector
                  activity={activity}
                  level={level}
                  onActivityChange={setActivity}
                  onLevelChange={setLevel}
                  worldId={worldId ?? undefined}
                />
              </div>

              {/* Split View: 60% camera + 40% panel */}
              <div className="grid lg:grid-cols-5 gap-4 relative">
                <SparkleDots count={8} />

                {/* Camera (3/5 = 60%) */}
                <div className="lg:col-span-3 animate-slide-up">
                  <LivePoseCoach state={coach} videoRef={coach.videoRef} canvasRef={coach.canvasRef} levelConfig={coach.levelConfig} />
                </div>

                {/* Panel (2/5 = 40%) */}
                <div className="lg:col-span-2 space-y-4 relative">
                  <SparkleDots count={6} />

                  {/* MOVA bubble */}
                  <div className="bg-white rounded-2xl p-3 shadow-pop border-2 border-amber-200 animate-pop-in relative overflow-hidden">
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="w-10 h-10 animate-wobble flex-shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-pop overflow-hidden">
                        <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
                      </div>
                      <div className="bg-primary/10 rounded-xl rounded-tl-none px-3 py-2 flex-1 shadow-soft">
                        <div className="font-extrabold text-[10px] text-primary mb-0.5 flex items-center gap-1">
                          <span className="animate-sparkle">✨</span> MOVA
                        </div>
                        <p className="text-[11px] font-bold leading-snug">
                          {role === 'teacher' ? (
                            <>Rekaman untuk {targetName ?? '...'}! 🎬 Pilih gerakan & mulai! 💪</>
                          ) : (
                            <>Siap latihan {activity} Lv.{level}? Tekan Mulai! 🌟</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick tips */}
                  <div className="bg-white rounded-2xl p-4 shadow-soft border-3 border-purple-200 animate-slide-up relative overflow-hidden">
                    <SparkleDots count={3} />
                    <h3 className="font-extrabold mb-2 flex items-center gap-2 text-xs relative z-10">
                      <span className="text-lg animate-wiggle">💡</span>
                      <Sparkles className="w-4 h-4 text-accent" /> Tips Cepat
                    </h3>
                    <ul className="text-xs space-y-1.5 font-bold text-muted-foreground relative z-10">
                      <li>🟢 Skor ≥85: Gerakan sempurna!</li>
                      <li>🟡 Skor 60-84: Cukup bagus, tingkatkan</li>
                      <li>🔴 Skor {'<'}60: Perlu perbaikan</li>
                      <li>⏱️ Tahan posisi sesuai target waktu</li>
                      <li>🔄 Ulangi untuk menambah repetisi</li>
                      <li>⌨️ SPACE = Mulai/Stop, ESC = Keluar Full Screen</li>
                    </ul>
                  </div>

                  {/* Audio Toggle */}
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`w-full rounded-xl p-3 text-sm font-bold border-2 transition-all ${
                      audioEnabled
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    {audioEnabled ? '🔊 Suara Aktif' : '🔇 Suara Mati'}
                  </button>

                  {/* Calibration Panel (teacher only) */}
                  {(role === 'teacher' || role === 'admin') && (
                    <div className="bg-white rounded-2xl p-4 shadow-soft border-2 border-amber-200">
                      <button
                        onClick={() => setShowCalibration(!showCalibration)}
                        className="w-full text-left font-bold text-xs flex items-center gap-2"
                      >
                        ⚙️ Kalibrasi Threshold {showCalibration ? '▲' : '▼'}
                      </button>
                      {showCalibration && (
                        <div className="mt-3 space-y-2 text-xs">
                          <p className="text-muted-foreground font-medium">Atur threshold untuk {activity} Lv.{level}:</p>
                          {[
                            { key: `${activity}_minScore`, label: 'Min Score', def: [60,70,80,85,90][level-1] },
                            { key: `${activity}_holdSec`, label: 'Hold (detik)', def: [3,5,5,3,2][level-1] },
                          ].map(({ key, label, def }) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="font-bold flex-1">{label}:</span>
                              <input
                                type="number"
                                defaultValue={savedThresholds?.[key] ?? def}
                                className="w-16 text-center rounded-lg border-2 border-amber-300 px-2 py-1 font-bold"
                                onChange={(e) => handleSaveThresholds(key, Number(e.target.value))}
                              />
                              <span className="text-muted-foreground">({def})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live Monitor Card (teacher/parent) */}
                  {((role as string) === 'teacher' || (role as string) === 'parent') && liveSessionData && (
                    <div className="bg-white rounded-2xl p-4 shadow-soft border-2 border-sky-200">
                      <h3 className="font-extrabold text-xs mb-2 flex items-center gap-2">
                        📊 Live Monitor: {liveSessionData.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-xl">{liveSessionData.avatar}</span>
                        <div className="flex-1">
                          <div className="font-bold">Lv.{liveSessionData.level} • {liveSessionData.xp} XP</div>
                        </div>
                      </div>
                      {liveSessionData.physicalLiteracy && (
                        <div className="mt-2 grid grid-cols-5 gap-1 text-center">
                          {(['balance', 'coordination', 'agility', 'flexibility', 'strength'] as const).map((k) => (
                            <div key={k} className="bg-sky-50 rounded-lg p-1">
                              <div className="text-[10px] font-bold text-sky-700">{liveSessionData.physicalLiteracy![k]}</div>
                              <div className="text-[8px] text-sky-500">{k.slice(0,3).toUpperCase()}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
