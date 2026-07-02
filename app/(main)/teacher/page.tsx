'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white animate-pop-in">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-5xl">👩‍🏫</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-muted-foreground">Teacher Dashboard</div>
            <h1 className="text-3xl font-extrabold">Selamat Mengajar, {userData?.name || 'Guru'}!</h1>
            <p className="text-sm text-foreground/70">Pantau siswa, kelola kelas, analisis perkembangan</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="gradient-sky text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Total Kelas</div>
          <div className="text-3xl font-extrabold">{classes?.length ?? 0}</div>
        </div>
        <div className="gradient-grass text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Total Siswa</div>
          <div className="text-3xl font-extrabold">{totalStudents}</div>
        </div>
        <div className="gradient-sunset text-white rounded-3xl p-5 shadow-soft">
          <div className="text-xs font-bold opacity-90">Kelas Dipilih</div>
          <div className="text-3xl font-extrabold">{selectedClassId ? classes?.find((c) => c._id === selectedClassId)?.name ?? '-' : '-'}</div>
        </div>
      </div>

      {/* Class selector + CRUD */}
      <div className="bg-white rounded-3xl p-4 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-lg">Pilih Kelas</h3>
          <button onClick={() => setShowAddClass(!showAddClass)} className="px-4 py-2 rounded-full font-bold gradient-grass text-white text-sm">
            + Tambah Kelas
          </button>
        </div>

        {/* Add class form */}
        {showAddClass && (
          <div className="mb-3 p-4 bg-muted/40 rounded-2xl flex items-center gap-3 flex-wrap">
            <input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Nama kelas (misal: 4A)"
              className="p-2 rounded-xl border-2 border-border font-bold text-sm w-32"
            />
            <select
              value={newClassGrade}
              onChange={(e) => setNewClassGrade(Number(e.target.value))}
              className="p-2 rounded-xl border-2 border-border font-bold text-sm"
            >
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>Kelas {g}</option>
              ))}
            </select>
            <button onClick={handleCreateClass} className="px-4 py-2 rounded-full font-bold gradient-sky text-white text-sm">Simpan</button>
            <button onClick={() => setShowAddClass(false)} className="px-4 py-2 rounded-full font-bold bg-muted text-sm">Batal</button>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {classes?.map((c) => (
            <div key={c._id} className="relative group">
              <button
                onClick={() => { setSelectedClassId(c._id); setSelectedStudentId(null); }}
                className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                  selectedClassId === c._id
                    ? 'gradient-sky text-white shadow-soft'
                    : 'bg-muted/60 hover:bg-muted'
                }`}
              >
                Kelas {c.name}
              </button>
              <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditClass({ id: c._id, name: c.name, grade: c.grade }); }}
                  className="w-5 h-5 rounded-full bg-amber-400 text-white text-[10px] flex items-center justify-center"
                >E</button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteClass(c._id); }}
                  className="w-5 h-5 rounded-full bg-red-400 text-white text-[10px] flex items-center justify-center"
                >X</button>
              </div>
            </div>
          ))}
          {(!classes || classes.length === 0) && (
            <p className="text-sm text-muted-foreground">Belum ada kelas. Klik "Tambah Kelas" untuk membuat.</p>
          )}
        </div>
      </div>

      {/* Edit class modal */}
      {editClass && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-amber-200">
          <h3 className="font-extrabold text-lg mb-3">Edit Kelas</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              value={editClass.name}
              onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
              className="p-2 rounded-xl border-2 border-border font-bold text-sm w-32"
            />
            <select
              value={editClass.grade}
              onChange={(e) => setEditClass({ ...editClass, grade: Number(e.target.value) })}
              className="p-2 rounded-xl border-2 border-border font-bold text-sm"
            >
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>Kelas {g}</option>
              ))}
            </select>
            <button onClick={handleUpdateClass} className="px-4 py-2 rounded-full font-bold gradient-sky text-white text-sm">Update</button>
            <button onClick={() => setEditClass(null)} className="px-4 py-2 rounded-full font-bold bg-muted text-sm">Batal</button>
          </div>
        </div>
      )}

      {/* Students table */}
      {selectedClassId && (
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">Siswa — {classes?.find((c) => c._id === selectedClassId)?.name}</h3>
            <span className="text-sm font-bold text-muted-foreground">{totalStudents} siswa</span>
          </div>
          {studentList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada siswa di kelas ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b text-xs">
                    <th className="p-2">Nama</th>
                    <th>Level</th>
                    <th>XP</th>
                    <th>Badge</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((s) => (
                    <tr
                      key={s._id}
                      className={`border-b last:border-0 cursor-pointer transition-all ${
                        selectedStudentId === s._id ? 'bg-primary/5' : 'hover:bg-muted/30'
                      }`}
                      onClick={() => setSelectedStudentId(selectedStudentId === s._id ? null : s._id)}
                    >
                      <td className="p-2 font-bold">{s.name}</td>
                      <td>Lv {s.level}</td>
                      <td>{s.xp.toLocaleString()}</td>
                      <td>{s.badges?.length ?? 0}/6</td>
                      <td>
                        <span className="text-xs font-bold text-primary">
                          {selectedStudentId === s._id ? 'Tutup' : 'Lihat'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Student detail */}
      {selectedStudent && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-primary/20 animate-pop-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg">Profil: {selectedStudent.name}</h3>
            <button onClick={() => setSelectedStudentId(null)} className="text-sm font-bold px-3 py-1 rounded-full bg-muted">Tutup</button>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="gradient-sky text-white rounded-3xl p-4 shadow-soft text-center">
              <div className="text-xs font-bold opacity-90">Level</div>
              <div className="text-3xl font-extrabold">{selectedStudent.level}</div>
            </div>
            <div className="gradient-sunset text-white rounded-3xl p-4 shadow-soft text-center">
              <div className="text-xs font-bold opacity-90">XP</div>
              <div className="text-3xl font-extrabold">{selectedStudent.xp.toLocaleString()}</div>
            </div>
            <div className="gradient-grass text-white rounded-3xl p-4 shadow-soft text-center">
              <div className="text-xs font-bold opacity-90">Coins</div>
              <div className="text-3xl font-extrabold">{selectedStudent.coins.toLocaleString()}</div>
            </div>
            <div className="gradient-magic text-white rounded-3xl p-4 shadow-soft text-center">
              <div className="text-xs font-bold opacity-90">Badge</div>
              <div className="text-3xl font-extrabold">{selectedStudent.badges?.length ?? 0}/6</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-primary/5 rounded-2xl text-sm font-bold">
            💡 <b>AI Coach:</b> Mulai sesi AI Coach untuk {selectedStudent.name}{' '}
            <Link href="/assessment" className="text-primary underline">di sini</Link>
          </div>
        </div>
      )}
    </div>
  );
}
