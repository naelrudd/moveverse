'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { worlds, ALL_ACTIVITIES } from '@/lib/worlds';

/* ── Reusable bits ── */
function Sparkle({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <span className={`absolute text-yellow-300 animate-sparkle pointer-events-none ${className}`} style={{ animationDelay: `${delay}s` }}>✦</span>
  );
}

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {['🟡', '🔵', '🟢', '🟣', '🔴', '⭐', '✨', '💫', '🌟', '💎'].map((c, i) => (
        <span key={i} className="absolute text-sm animate-confetti-long" style={{ left: `${5 + i * 10}%`, animationDelay: `${i * 0.25}s`, opacity: 0.7 }}>{c}</span>
      ))}
    </div>
  );
}

function MovaTip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 animate-slide-up" style={{ animationDelay: '0.8s' }}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-soft animate-float flex-shrink-0 overflow-hidden">
        <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 shadow-soft text-xs font-bold text-foreground/80 relative">
        <span className="absolute -left-1 top-3 w-2 h-2 bg-white rotate-45 shadow-soft" />
        {text}
      </div>
    </div>
  );
}

/* ── RPP Data ── */
const RPP_DATA = [
  {
    worldId: 'pulau-naga',
    dunia: 'Pulau Naga',
    icon: '🐲',
    materi: 'Gerak Non-Lokomotor (di tempat)',
    kd: 'PJOK KD 3.1 — Gerak Dasar Non-Lokomotor',
    capaian: 'Siswa memahami dan melaksanakan 6 gerak non-lokomotor dengan benar dan percaya diri',
    alat: ['Area luas / ruang terbuka', 'Matras / alas empuk', 'Musik pengiring', 'Papan putih / poster gerakan'],
    metode: ['Demonstrasi oleh guru', 'Peniruan berulang', 'Praktik langsung berpasangan', 'Permainan gerak'],
    penilaian: [
      { aspek: 'Sikap', deskripsi: 'Semangat, kerjasama, disiplin, percaya diri' },
      { aspek: 'Pengetahuan', deskripsi: 'Menyebutkan dan menjelaskan 6 gerakan non-lokomotor' },
      { aspek: 'Keterampilan', deskripsi: 'Melakukan setiap gerakan dengan benar dan konsisten' },
    ],
  },
  {
    worldId: 'hutan-harimau',
    dunia: 'Hutan Harimau',
    icon: '🐯',
    materi: 'Gerak Lokomotor (berpindah tempat)',
    kd: 'PJOK KD 3.2 — Gerak Dasar Lokomotor',
    capaian: 'Siswa memahami dan melaksanakan 6 gerak lokomotor dengan ritme dan teknik yang benar',
    alat: ['Area terbuka / lapangan', 'Rintangan sederhana (cones, tali)', 'Bola kecil', 'Timer / stopwatch'],
    metode: ['Permainan beregu', 'Simulasi lintasan', 'Praktik bergerak berirama', 'Tantangan waktu'],
    penilaian: [
      { aspek: 'Sikap', deskripsi: 'Pantang menyerah, sportif, suka tantangan' },
      { aspek: 'Pengetahuan', deskripsi: 'Menyebutkan perbedaan gerak lokomotor' },
      { aspek: 'Keterampilan', deskripsi: 'Melakukan gerakan berpindah dengan teknik benar' },
    ],
  },
  {
    worldId: 'gunung-elang',
    dunia: 'Gunung Elang',
    icon: '🦅',
    materi: 'Gerak Manipulatif (dengan objek)',
    kd: 'PJOK KD 3.3 — Gerak Dasar Manipulatif',
    capaian: 'Siswa memahami dan melaksanakan 6 gerak manipulatif dengan koordinasi dan akurasi baik',
    alat: ['Bola kecil berbagai ukuran', 'Raket mini / bet', 'Ring / keranjang', 'Gawang mini', 'Papan target'],
    metode: ['Permainan bola', 'Kerja sama kelompok', 'Tantangan akurasi', 'Simulasi pertandingan'],
    penilaian: [
      { aspek: 'Sikap', deskripsi: 'Kerjasama, sportif, fokus, percaya diri' },
      { aspek: 'Pengetahuan', deskripsi: 'Menjelaskan teknik dasar melempar, menangkap, menendang' },
      { aspek: 'Keterampilan', deskripsi: 'Melakukan gerakan manipulatif dengan akurasi memadai' },
    ],
  },
];

export default function TeacherDashboard() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const classes = useQuery(api.classes.getClassesBySchool, userData?.schoolId ? { schoolId: userData.schoolId } : 'skip');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [editClass, setEditClass] = useState<{ id: string; name: string; grade: number } | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [rppOpen, setRppOpen] = useState(false);
  const [rppWorldIdx, setRppWorldIdx] = useState(0);

  const createClassMut = useMutation(api.classes.createClass);
  const updateClassMut = useMutation(api.classes.updateClass);
  const deleteClassMut = useMutation(api.classes.deleteClass);

  const students = useQuery(
    api.users.getUsersByClass,
    selectedClassId ? { classId: selectedClassId as any } : 'skip'
  );

  const selectedStudent = students?.find((s) => s._id === selectedStudentId);

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !userData?.schoolId) return;
    await createClassMut({ schoolId: userData.schoolId, name: newClassName.trim(), grade: newClassGrade });
    setNewClassName('');
    setNewClassGrade(1);
    setShowAddClass(false);
  };

  const handleUpdateClass = async () => {
    if (!editClass) return;
    await updateClassMut({ classId: editClass.id as any, name: editClass.name, grade: editClass.grade });
    setEditClass(null);
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Yakin hapus kelas ini?')) return;
    await deleteClassMut({ classId: classId as any });
    if (selectedClassId === classId) setSelectedClassId(null);
  };

  const studentList = students?.filter((s) => s.role === 'student') ?? [];
  const totalStudents = studentList.length;
  const currentRpp = RPP_DATA[rppWorldIdx];
  const currentWorld = worlds[rppWorldIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* ═══════ HERO ═══════ */}
      <div className="relative rounded-[2.5rem] p-8 shadow-pop border-4 border-white animate-pop-in overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.92 0.12 230), oklch(0.95 0.1 60), oklch(0.93 0.12 310))' }}
      >
        <ConfettiBurst />
        <Sparkle className="top-4 left-8 text-lg" delay={0} />
        <Sparkle className="top-12 left-24 text-xs" delay={0.4} />
        <Sparkle className="bottom-8 left-16 text-base" delay={0.8} />
        <Sparkle className="top-6 right-20 text-sm" delay={1.2} />
        <Sparkle className="bottom-4 right-12 text-lg" delay={0.6} />

        <div className="flex items-center gap-6 relative z-10 flex-wrap">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 p-1.5 shadow-pop animate-dance-slow flex-shrink-0 overflow-hidden relative">
            <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain drop-shadow-lg" />
            <div className="absolute inset-0 rounded-full animate-pulse-glow" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Selamat Mengajar, {userData?.name || 'Guru'}! 👩‍🏫
            </h1>
            <p className="text-sm font-bold text-foreground/60 mt-1">Pantau siswa, kelola kelas, analisis perkembangan 📚</p>
            <div className="mt-2"><MovaTip text="💡 Klik 'Lihat RPP' untuk membuka dokumen rencana pelajaran lengkap!" /></div>
          </div>
        </div>
      </div>

      {/* ═══════ STAT CARDS ═══════ */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: '🏫', l: 'Total Kelas', v: classes?.length ?? 0, gradient: 'linear-gradient(135deg, #a78bfa, #818cf8, #6366f1)' },
          { icon: '👨‍🎓', l: 'Total Siswa', v: totalStudents, gradient: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)' },
          { icon: '📋', l: 'Kelas Aktif', v: selectedClassId ? classes?.find((c) => c._id === selectedClassId)?.name ?? '-' : '-', gradient: 'linear-gradient(135deg, #fb923c, #f97316, #ea580c)' },
        ].map((s, i) => (
          <div key={s.l} className="text-white rounded-3xl p-5 shadow-pop animate-slide-up relative overflow-hidden group hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-2 border-white/30" style={{ background: s.gradient, animationDelay: `${i * 0.1}s` } as React.CSSProperties}>
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <div className="text-3xl mb-1 drop-shadow-md relative z-10">{s.icon}</div>
            <div className="text-xs font-extrabold opacity-80 relative z-10 uppercase tracking-wider">{s.l}</div>
            <div className="text-2xl font-extrabold relative z-10 drop-shadow-sm">{s.v}</div>
            <Sparkle className="top-2 right-2 text-xs" delay={i * 0.3} />
          </div>
        ))}
      </div>

      {/* ═══════ CLASS SELECTOR ═══════ */}
      <div className="bg-white rounded-3xl p-5 shadow-pop border-2 border-primary/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-lg">📌 Pilih Kelas</h3>
          <button onClick={() => setShowAddClass(!showAddClass)} className="px-4 py-2 rounded-full font-extrabold text-sm text-white shadow-soft hover:shadow-pop hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)' }}>
            + Tambah Kelas
          </button>
        </div>

        {showAddClass && (
          <div className="mb-3 p-4 bg-muted/40 rounded-2xl flex items-center gap-3 flex-wrap animate-pop-in">
            <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Nama kelas (misal: 4A)" className="p-2 rounded-xl border-2 border-border font-bold text-sm w-32" />
            <select value={newClassGrade} onChange={(e) => setNewClassGrade(Number(e.target.value))} className="p-2 rounded-xl border-2 border-border font-bold text-sm">
              {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>Kelas {g}</option>)}
            </select>
            <button onClick={handleCreateClass} className="px-4 py-2 rounded-full font-extrabold text-sm text-white shadow-soft" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>Simpan</button>
            <button onClick={() => setShowAddClass(false)} className="px-4 py-2 rounded-full font-bold bg-muted text-sm">Batal</button>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {classes?.map((c) => (
            <div key={c._id} className="relative group">
              <button onClick={() => { setSelectedClassId(c._id); setSelectedStudentId(null); }} className={`px-5 py-3 rounded-2xl font-extrabold text-sm whitespace-nowrap transition-all ${selectedClassId === c._id ? 'text-white shadow-pop' : 'bg-muted/60 hover:bg-muted hover:scale-105'}`} style={selectedClassId === c._id ? { background: 'linear-gradient(135deg, #818cf8, #6366f1)' } : {}}>
                Kelas {c.name}
              </button>
              <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                <button onClick={(e) => { e.stopPropagation(); setEditClass({ id: c._id, name: c.name, grade: c.grade }); }} className="w-5 h-5 rounded-full bg-amber-400 text-white text-[10px] flex items-center justify-center shadow-sm">E</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(c._id); }} className="w-5 h-5 rounded-full bg-red-400 text-white text-[10px] flex items-center justify-center shadow-sm">X</button>
              </div>
            </div>
          ))}
          {(!classes || classes.length === 0) && <p className="text-sm text-muted-foreground font-bold">Belum ada kelas. Klik &quot;Tambah Kelas&quot; untuk membuat.</p>}
        </div>
      </div>

      {/* ═══════ EDIT CLASS ═══════ */}
      {editClass && (
        <div className="bg-white rounded-3xl p-6 shadow-pop border-2 border-amber-200 animate-pop-in">
          <h3 className="font-extrabold text-lg mb-3">✏️ Edit Kelas</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <input value={editClass.name} onChange={(e) => setEditClass({ ...editClass, name: e.target.value })} className="p-2 rounded-xl border-2 border-border font-bold text-sm w-32" />
            <select value={editClass.grade} onChange={(e) => setEditClass({ ...editClass, grade: Number(e.target.value) })} className="p-2 rounded-xl border-2 border-border font-bold text-sm">
              {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>Kelas {g}</option>)}
            </select>
            <button onClick={handleUpdateClass} className="px-4 py-2 rounded-full font-extrabold text-sm text-white shadow-soft" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>Update</button>
            <button onClick={() => setEditClass(null)} className="px-4 py-2 rounded-full font-bold bg-muted text-sm">Batal</button>
          </div>
        </div>
      )}

      {/* ═══════ STUDENT TABLE ═══════ */}
      {selectedClassId && (
        <div className="bg-white rounded-3xl p-6 shadow-pop border-2 border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">👨‍🎓 Siswa — {classes?.find((c) => c._id === selectedClassId)?.name}</h3>
            <span className="text-sm font-extrabold text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">{totalStudents} siswa</span>
          </div>
          {studentList.length === 0 ? (
            <p className="text-sm text-muted-foreground font-bold">Belum ada siswa di kelas ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b text-xs font-extrabold uppercase">
                    <th className="p-2">Nama</th><th>Level</th><th>XP</th><th>Badge</th><th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((s, i) => (
                    <tr key={s._id} className={`border-b last:border-0 cursor-pointer transition-all ${selectedStudentId === s._id ? 'bg-primary/5' : 'hover:bg-muted/30 hover:scale-[1.01]'}`} onClick={() => setSelectedStudentId(selectedStudentId === s._id ? null : s._id)} style={{ animationDelay: `${i * 0.05}s` }}>
                      <td className="p-2 font-bold">{s.name}</td>
                      <td className="font-bold">Lv {s.level}</td>
                      <td className="font-bold">{s.xp.toLocaleString()}</td>
                      <td className="font-bold">{s.badges?.length ?? 0}/6</td>
                      <td><span className="text-xs font-extrabold text-primary px-2 py-1 rounded-full bg-primary/10">{selectedStudentId === s._id ? 'Tutup' : 'Lihat'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════ STUDENT DETAIL ═══════ */}
      {selectedStudent && (
        <div className="bg-white rounded-3xl p-6 shadow-pop border-2 border-primary/20 animate-pop-in relative overflow-hidden">
          <Sparkle className="top-3 right-4 text-lg" delay={0.2} />
          <Sparkle className="bottom-3 left-6 text-sm" delay={0.7} />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">👤 Profil: {selectedStudent.name}</h3>
            <button onClick={() => setSelectedStudentId(null)} className="text-sm font-extrabold px-3 py-1 rounded-full bg-muted hover:scale-105 transition-all">Tutup</button>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { icon: '⭐', l: 'Level', v: selectedStudent.level, gradient: 'linear-gradient(135deg, #a78bfa, #818cf8, #6366f1)' },
              { icon: '✨', l: 'XP', v: selectedStudent.xp.toLocaleString(), gradient: 'linear-gradient(135deg, #fb923c, #f97316, #ea580c)' },
              { icon: '🪙', l: 'Coins', v: selectedStudent.coins.toLocaleString(), gradient: 'linear-gradient(135deg, #facc15, #eab308, #ca8a04)' },
              { icon: '🏅', l: 'Badge', v: `${selectedStudent.badges?.length ?? 0}/${ALL_ACTIVITIES.length}`, gradient: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)' },
            ].map((s) => (
              <div key={s.l} className="text-white rounded-3xl p-4 shadow-soft text-center relative overflow-hidden" style={{ background: s.gradient }}>
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                <div className="text-2xl mb-1 relative z-10">{s.icon}</div>
                <div className="text-xs font-bold opacity-80 relative z-10">{s.l}</div>
                <div className="text-2xl font-extrabold relative z-10">{s.v}</div>
              </div>
            ))}
          </div>
          {/* Aktivitas Belum Selesai */}
          <div className="mt-4 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200">
            <div className="font-extrabold text-sm mb-2">📋 Aktivitas Belum Selesai</div>
            <div className="flex flex-wrap gap-2">
              {ALL_ACTIVITIES.filter((a) => !selectedStudent.badges?.includes(a.badgeId)).map((a) => (
                <span key={a.id} className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-amber-200 shadow-sm">{a.icon} {a.name}</span>
              ))}
            </div>
          </div>
          {/* Contact Parent */}
          {(selectedStudent as any).phone && (
            <div className="mt-3 p-3 bg-blue-50 rounded-2xl border-2 border-blue-200 flex items-center gap-3">
              <span className="text-lg">📞</span>
              <div>
                <div className="font-extrabold text-sm">Hubungi Orang Tua</div>
                <a href={`tel:${selectedStudent.phone}`} className="text-sm text-blue-600 font-bold underline">{(selectedStudent as any).phone}</a>
              </div>
            </div>
          )}
          <div className="mt-4 p-3 bg-primary/5 rounded-2xl text-sm font-bold">
            🤖 <b>AI Coach:</b> Mulai sesi AI Coach untuk {selectedStudent.name}{' '}
            <Link href="/assessment" className="text-primary underline">di sini</Link>
          </div>
        </div>
      )}

      {/* ═══════ RPP — DOCUMENT VIEWER ═══════ */}
      <section>
        <div className="bg-white rounded-3xl p-6 shadow-pop border-2 border-primary/10 relative overflow-hidden">
          <ConfettiBurst />
          <Sparkle className="top-3 right-4 text-lg" delay={0.1} />
          <Sparkle className="bottom-4 left-8 text-sm" delay={0.5} />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-extrabold text-xl">📚 RPP & Materi Ajar</h3>
            <span className="text-xs font-extrabold px-3 py-1.5 rounded-full text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>Dokumen</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4 font-bold relative z-10">Rencana Pelaksanaan Pembelajaran (RPP) untuk setiap dunia gerak. Klik untuk melihat lengkap!</p>
          <div className="grid sm:grid-cols-3 gap-4 relative z-10">
            {RPP_DATA.map((rpp, i) => (
              <div key={i} className="bg-muted/40 rounded-2xl p-5 hover:shadow-pop transition-all duration-300 border-2 border-transparent hover:border-primary/20 hover:-translate-y-1 group cursor-pointer" onClick={() => { setRppWorldIdx(i); setRppOpen(true); }}>
                <div className="text-4xl mb-2 group-hover:animate-bounce-sm">{rpp.icon}</div>
                <div className="font-extrabold text-lg">{rpp.dunia}</div>
                <div className="text-xs text-primary font-bold mt-1">{rpp.materi}</div>
                <div className="text-xs text-muted-foreground mt-2 font-bold">{rpp.kd}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] font-bold text-muted-foreground">2 JP</span>
                  <button className="text-xs font-extrabold px-4 py-1.5 rounded-full text-white shadow-soft group-hover:shadow-pop group-hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
                    Lihat RPP 📖
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ RPP MODAL ═══════ */}
      {rppOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm no-print" onClick={() => setRppOpen(false)}>
          <div className="bg-white rounded-[2rem] shadow-pop border-4 border-white w-full max-w-3xl max-h-[90vh] flex flex-col animate-pop-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="p-5 border-b-2 border-primary/10 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, oklch(0.92 0.12 230), oklch(0.95 0.1 60))' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-soft overflow-hidden animate-dance-slow">
                  <img src="/mova-hero.png" alt="MOVA" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg">📖 RPP Document Viewer</h2>
                  <p className="text-xs text-muted-foreground font-bold">Rencana Pelaksanaan Pembelajaran PJOK</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 rounded-full font-extrabold text-xs text-white shadow-soft hover:shadow-pop hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>🖨️ Cetak</button>
                <button onClick={() => setRppOpen(false)} className="w-8 h-8 rounded-full bg-white shadow-soft hover:shadow-pop flex items-center justify-center font-extrabold text-sm hover:scale-110 transition-all">✕</button>
              </div>
            </div>

            {/* World tabs */}
            <div className="flex border-b-2 border-primary/10 overflow-x-auto no-scrollbar">
              {RPP_DATA.map((r, i) => (
                <button key={i} onClick={() => setRppWorldIdx(i)} className={`flex-1 min-w-[120px] py-3 px-4 font-extrabold text-sm transition-all border-b-3 ${rppWorldIdx === i ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-transparent hover:bg-muted/30'}`}>
                  <span className="text-lg mr-1">{r.icon}</span> {r.dunia}
                </button>
              ))}
            </div>

            {/* RPP Content — book-like */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              {/* Cover */}
              <div className="text-center py-6 rounded-3xl border-4 animate-rainbow-border relative overflow-hidden" style={{ background: 'linear-gradient(135deg, oklch(0.92 0.12 230 / 0.15), oklch(0.95 0.1 60 / 0.15), oklch(0.93 0.12 310 / 0.15))' }}>
                <Sparkle className="top-4 left-8 text-lg" delay={0} />
                <Sparkle className="top-8 right-12 text-sm" delay={0.5} />
                <div className="text-6xl mb-3 animate-float-strong">{currentRpp.icon}</div>
                <h2 className="text-2xl font-extrabold">{currentRpp.dunia}</h2>
                <p className="text-sm font-bold text-muted-foreground mt-1">{currentRpp.materi}</p>
                <div className="mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-extrabold text-white" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>{currentRpp.kd}</div>
              </div>

              {/* Capaian */}
              <div className="p-4 rounded-2xl border-2 border-green-200 bg-green-50">
                <h3 className="font-extrabold text-sm flex items-center gap-2">🎯 <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs">Capaian Pembelajaran</span></h3>
                <p className="text-sm font-bold mt-2 text-green-800">{currentRpp.capaian}</p>
              </div>

              {/* Alat & Metode */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
                  <h3 className="font-extrabold text-sm flex items-center gap-2 mb-2">🧰 Alat & Bahan</h3>
                  <ul className="space-y-1">
                    {currentRpp.alat.map((a, i) => <li key={i} className="text-xs font-bold text-blue-800 flex items-center gap-1.5"><span className="text-blue-400">●</span> {a}</li>)}
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200">
                  <h3 className="font-extrabold text-sm flex items-center gap-2 mb-2">🎮 Metode Pembelajaran</h3>
                  <ul className="space-y-1">
                    {currentRpp.metode.map((m, i) => <li key={i} className="text-xs font-bold text-purple-800 flex items-center gap-1.5"><span className="text-purple-400">●</span> {m}</li>)}
                  </ul>
                </div>
              </div>

              {/* Aktivitas per dunia */}
              <div>
                <h3 className="font-extrabold text-sm mb-3 flex items-center gap-2">🏃 Aktivitas Gerak</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {currentWorld?.activities.map((act, i) => (
                    <div key={act.id} className="p-4 rounded-2xl bg-white border-2 border-primary/10 shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all group" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl group-hover:animate-bounce-sm">{act.icon}</span>
                        <div>
                          <div className="font-extrabold text-sm">{act.name}</div>
                          <div className="text-[10px] font-bold text-accent">+{act.xpReward} XP · {act.badgeName}</div>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">{act.description}</p>
                      <div className="mt-2 p-2 bg-primary/5 rounded-xl text-[10px] font-extrabold text-primary">🎯 {act.objective}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Penilaian */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
                <h3 className="font-extrabold text-sm mb-2 flex items-center gap-2">📝 Aspek Penilaian</h3>
                <div className="space-y-2">
                  {currentRpp.penilaian.map((p, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-sm">{i === 0 ? '❤️' : i === 1 ? '🧠' : '💪'}</span>
                      <div>
                        <span className="text-xs font-extrabold text-amber-800">{p.aspek}: </span>
                        <span className="text-xs font-bold text-amber-700">{p.deskripsi}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MOVA tip */}
              <div className="flex justify-center pt-2">
                <MovaTip text="💡 Rencana ini bisa dicetak dengan menekan tombol 'Cetak' di atas. Selamat mengajar! 🎉" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ BOTTOM TIP ═══════ */}
      <div className="flex justify-center animate-slide-up" style={{ animationDelay: '1s' }}>
        <MovaTip text="👩‍🏫 Semangat mengajar! Siswa yang aktif bergerak belajar lebih cepat! 💪" />
      </div>
    </div>
  );
}
