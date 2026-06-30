'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';

const ROLES = [
  { value: 'student' as const, emoji: '🧒', label: 'Siswa', desc: 'Aku ingin bermain dan belajar!' },
  { value: 'parent' as const, emoji: '👨‍👩‍👧', label: 'Orang Tua', desc: 'Aku ingin pantau perkembangan anakku' },
  { value: 'teacher' as const, emoji: '👩‍🏫', label: 'Guru', desc: 'Aku ingin kelola kelasku' },
];

export default function OnboardingPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'student' | 'parent' | 'teacher' | ''>('');
  const [schoolId, setSchoolId] = useState<Id<'schools'> | ''>('');
  const [classId, setClassId] = useState<Id<'classes'> | ''>('');
  const [nis, setNis] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const existingUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const schools = useQuery(api.schools.getAllSchools);
  const classes = useQuery(api.classes.getClassesBySchool, schoolId ? { schoolId } : 'skip');
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (!existingUser) return;
    const roleRedirect: Record<string, string> = {
      student: '/dashboard/student',
      parent: '/parent',
      teacher: '/teacher',
      admin: '/school',
    };
    router.replace(roleRedirect[existingUser.role ?? 'student'] || '/dashboard/student');
  }, [existingUser, router]);

  const handleSubmit = async () => {
    if (!userId || !role || !schoolId) return;
    setSubmitting(true);
    try {
      await createUser({
        clerkId: userId,
        name: user?.firstName || user?.username || 'Explorer',
        avatar: '🦊',
        role,
        schoolId,
        classId: classId || undefined,
        nis: nis || undefined,
        phone: phone || undefined,
      });
      const roleRedirect: Record<string, string> = {
        student: '/dashboard/student',
        parent: '/parent',
        teacher: '/teacher',
        admin: '/school',
      };
      router.replace(roleRedirect[userRole] || '/dashboard/student');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (existingUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-sky">
        <div className="animate-bounce text-4xl">🦊</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-sky p-4">
      <div className="w-full max-w-lg bg-white rounded-[2rem] p-8 shadow-pop border-4 border-white animate-pop-in">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="MOVEVERSE" className="h-14 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-extrabold">Selamat datang!</h1>
          <p className="text-sm text-muted-foreground mt-1">Lengkapi profilmu dulu ya 😊</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'gradient-sky text-white' : 'bg-muted text-muted-foreground'}`}>
              {s}
            </div>
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <div className="space-y-3 animate-pop-in">
            <p className="text-sm font-bold text-foreground mb-3">Kamu siapa?</p>
            {ROLES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setRole(opt.value); setStep(2); }}
                className="w-full text-left p-4 rounded-2xl border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center gap-3"
              >
                <span className="text-3xl">{opt.emoji}</span>
                <div>
                  <div className="font-extrabold text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: School + extra fields */}
        {step === 2 && (
          <div className="space-y-4 animate-pop-in">
            <p className="text-sm font-bold text-foreground">Pilih sekolah</p>
            <select
              value={schoolId}
              onChange={(e) => { setSchoolId(e.target.value as Id<'schools'>); setClassId(''); }}
              className="w-full p-4 rounded-2xl border-2 border-border bg-white font-bold"
            >
              <option value="">Pilih sekolah...</option>
              {schools?.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            {role === 'student' && (
              <div>
                <label className="text-sm font-bold text-muted-foreground">NIS (Nomor Induk Siswa)</label>
                <input
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  placeholder="Contoh: 2024001"
                  className="mt-1 w-full p-4 rounded-2xl border-2 border-border font-bold"
                />
              </div>
            )}

            {role === 'parent' && (
              <div>
                <label className="text-sm font-bold text-muted-foreground">Nomor HP</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  type="tel"
                  className="mt-1 w-full p-4 rounded-2xl border-2 border-border font-bold"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(1)} className="px-5 py-2 rounded-full font-bold border-2 border-border">Kembali</button>
              <button
                onClick={() => setStep(3)}
                disabled={!schoolId}
                className="flex-1 py-2 rounded-full font-bold gradient-sky text-white disabled:opacity-50"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Class (student only) or confirm */}
        {step === 3 && (
          <div className="space-y-4 animate-pop-in">
            {role === 'student' && (
              <>
                <p className="text-sm font-bold text-foreground">Pilih kelas</p>
                <div className="grid grid-cols-3 gap-2">
                  {classes?.map((cls) => (
                    <button
                      key={cls._id}
                      onClick={() => setClassId(cls._id)}
                      className={`py-3 rounded-2xl font-extrabold border-2 transition-all ${classId === cls._id ? 'gradient-sky text-white border-transparent' : 'border-border hover:border-primary/40'}`}
                    >
                      {cls.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {role === 'parent' && (
              <div className="p-4 bg-primary/5 rounded-2xl text-sm font-bold text-foreground">
                ✅ Kamu bisa link ke anak setelah daftar melalui halaman School
              </div>
            )}

            {role === 'teacher' && (
              <div className="p-4 bg-primary/5 rounded-2xl text-sm font-bold text-foreground">
                ✅ Kamu bisa kelola kelas setelah daftar melalui Teacher Dashboard
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(2)} className="px-5 py-2 rounded-full font-bold border-2 border-border">Kembali</button>
              <button
                onClick={handleSubmit}
                disabled={submitting || (role === 'student' && !classId)}
                className="flex-1 py-2 rounded-full font-bold gradient-grass text-white disabled:opacity-50"
              >
                {submitting ? 'Menyiapkan...' : 'Mulai Petualangan! 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
