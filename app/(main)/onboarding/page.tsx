'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import AvatarPicker from '@/components/AvatarPicker';

const ROLES = [
  { value: 'student' as const, emoji: '🧒', label: 'Peserta Didik', desc: 'Aku ingin bermain dan belajar!' },
  { value: 'parent' as const, emoji: '👨‍👩‍👧', label: 'Orang Tua', desc: 'Aku ingin pantau perkembangan anakku' },
  { value: 'teacher' as const, emoji: '👩‍🏫', label: 'Guru', desc: 'Aku ingin kelola kelasku' },
];

export default function OnboardingPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'student' | 'parent' | 'teacher' | ''>('');
  const [avatar, setAvatar] = useState('🦊');
  const [schoolId, setSchoolId] = useState<Id<'schools'> | ''>('');
  const [classCode, setClassCode] = useState('');
  const [childCode, setChildCode] = useState('');
  const [nis, setNis] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const existingUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const schools = useQuery(api.schools.getAllSchools);
  const lookupClass = useQuery(api.classes.getClassByCode, classCode.length >= 4 ? { code: classCode } : 'skip');
  const lookupChild = useQuery(api.users.lookupByChildCode, childCode.length >= 4 ? { childCode } : 'skip');
  const createUser = useMutation(api.users.createUser);
  const joinClass = useMutation(api.classes.joinClassByCode);

  // Derive class and child info from query results
  const classInfo = useMemo(() => {
    if (lookupClass) return { name: lookupClass.name };
    if (classCode && lookupClass === null) return null;
    return undefined;
  }, [lookupClass, classCode]);

  const childInfo = useMemo(() => {
    if (lookupChild) return { name: lookupChild.name, avatar: lookupChild.avatar };
    if (childCode && lookupChild === null) return null;
    return undefined;
  }, [lookupChild, childCode]);

  useEffect(() => {
    if (!existingUser) return;
    const roleRedirect: Record<string, string> = {
      student: '/dashboard/student',
      parent: '/parent',
      teacher: '/teacher',
      admin: '/admin',
      school_admin: '/admin',
    };
    router.replace(roleRedirect[existingUser.role ?? 'student'] || '/dashboard/student');
  }, [existingUser, router]);

  const handleSubmit = async () => {
    if (!userId || !role) return;
    setSubmitting(true);
    setError('');

    try {
      if (role === 'parent') {
        if (!childInfo) {
          setError('Kode anak tidak valid');
          setSubmitting(false);
          return;
        }
        router.replace('/parent');
      } else {
        if (!schoolId) {
          setError('Pilih sekolah terlebih dahulu');
          setSubmitting(false);
          return;
        }

        const result = await createUser({
          clerkId: userId,
          name: user?.firstName || user?.username || 'Petualang',
          avatar,
          role,
          schoolId,
          nis: role === 'student' ? nis || undefined : undefined,
          phone: role === 'teacher' ? phone || undefined : undefined,
        });

        if (role === 'student' && classInfo && result) {
          await joinClass({ userId: result as Id<'users'>, code: classCode.toUpperCase() });
        }

        const roleRedirect: Record<string, string> = {
          student: '/dashboard/student',
          teacher: '/teacher',
        };
        router.replace(roleRedirect[role] || '/dashboard/student');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan. Coba lagi.');
      setSubmitting(false);
    }
  };

  if (existingUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-sky">
        <div className="w-16 h-16 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-1 shadow-soft overflow-hidden animate-bounce mx-auto mb-4">
          <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
        </div>
      </div>
    );
  }

  const maxSteps = role === 'parent' ? 3 : 4;

  return (
    <div className="min-h-screen flex items-center justify-center gradient-sky p-4">
      <div className="w-full max-w-lg bg-white rounded-[2rem] p-8 shadow-pop border-4 border-white animate-pop-in">
        <div className="text-center mb-6">
          <Image src="/logo.png" alt="MOVEVERSE" width={56} height={56} className="h-14 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-extrabold">Selamat datang!</h1>
          <p className="text-sm text-muted-foreground mt-1">Lengkapi profilmu dulu ya 😊</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: maxSteps }, (_, i) => i + 1).map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'gradient-sky text-white' : 'bg-muted text-muted-foreground'}`}>
              {s}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700 font-bold">
            {error}
          </div>
        )}

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

        {/* Step 2: Avatar */}
        {step === 2 && (
          <div className="space-y-4 animate-pop-in">
            <p className="text-sm font-bold text-foreground">Pilih avatar hewanmu!</p>
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
            <div className="flex justify-center mt-2">
              <div className="text-6xl animate-float">{avatar}</div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(1)} className="px-5 py-2 rounded-full font-bold border-2 border-border">Kembali</button>
              <button onClick={() => setStep(3)} className="flex-1 py-2 rounded-full font-bold gradient-sky text-white">Selanjutnya →</button>
            </div>
          </div>
        )}

        {/* Step 3: School / Child Code */}
        {step === 3 && (
          <div className="space-y-4 animate-pop-in">
            {role === 'parent' ? (
              <>
                <p className="text-sm font-bold text-foreground">Masukkan kode anakmu</p>
                <p className="text-xs text-muted-foreground">Kode unik 8 karakter yang tertera di profil anak kamu</p>
                <input
                  value={childCode}
                  onChange={(e) => setChildCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: A1B2C3D4"
                  maxLength={8}
                  className="w-full p-4 rounded-2xl border-2 border-border font-bold text-center text-lg tracking-widest uppercase"
                />
                {childInfo && (
                  <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                    <span className="text-3xl">{childInfo.avatar}</span>
                    <div>
                      <div className="font-extrabold text-sm">{childInfo.name}</div>
                      <div className="text-xs text-green-700 font-bold">✓ Anak ditemukan</div>
                    </div>
                  </div>
                )}
                {childCode.length >= 4 && lookupChild === null && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700 font-bold">
                    Kode tidak ditemukan. Pastikan kode benar.
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-foreground">Pilih sekolahmu</p>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value as Id<'schools'>)}
                  className="w-full p-4 rounded-2xl border-2 border-border bg-white font-bold"
                >
                  <option value="">Pilih sekolah...</option>
                  {schools?.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Sekolah belum ada?{' '}
                  <a
                    href="mailto:natanaelrudyhadinata@gmail.com?subject=Daftar Sekolah di Moveverse&body=Halo, saya ingin mendaftarkan sekolah saya:%0A%0ANama Sekolah: %0ANPSN: %0A%0ATerima kasih."
                    className="text-primary font-bold hover:underline"
                  >
                    Hubungi Admin
                  </a>
                </p>

                {role === 'student' && schoolId && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-sm font-bold text-muted-foreground">NIS (Nomor Induk Siswa)</label>
                      <input
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        placeholder="NIS dari sekolah"
                        className="mt-1 w-full p-4 rounded-2xl border-2 border-border font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-muted-foreground">Kode Kelas</label>
                      <input
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                        placeholder="Kode 6 karakter dari guru"
                        maxLength={6}
                        className="mt-1 w-full p-4 rounded-2xl border-2 border-border font-bold text-center tracking-widest uppercase"
                      />
                      {classInfo && (
                        <div className="mt-1 text-xs text-green-700 font-bold">✓ Kelas {classInfo.name}</div>
                      )}
                    </div>
                  </div>
                )}

                {role === 'teacher' && schoolId && (
                  <div className="mt-4">
                    <label className="text-sm font-bold text-muted-foreground">Nomor HP</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxx"
                      type="tel"
                      className="mt-1 w-full p-4 rounded-2xl border-2 border-border font-bold"
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(2)} className="px-5 py-2 rounded-full font-bold border-2 border-border">Kembali</button>
              <button
                onClick={() => setStep(maxSteps)}
                disabled={
                  role === 'parent'
                    ? !childInfo
                    : !schoolId || (role === 'student' && !nis) || (role === 'teacher' && !phone)
                }
                className="flex-1 py-2 rounded-full font-bold gradient-sky text-white disabled:opacity-50"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm (student/teacher) */}
        {step === 4 && role !== 'parent' && (
          <div className="space-y-4 animate-pop-in">
            <p className="text-sm font-bold text-foreground">Konfirmasi data kamu</p>

            <div className="p-4 bg-muted/40 rounded-2xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Role</span>
                <span className="font-bold">{role === 'student' ? 'Peserta Didik' : 'Guru'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sekolah</span>
                <span className="font-bold">{schools?.find(s => s._id === schoolId)?.name}</span>
              </div>
              {role === 'student' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">NIS</span>
                    <span className="font-bold">{nis}</span>
                  </div>
                  {classInfo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kelas</span>
                      <span className="font-bold">{classInfo.name}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {role === 'student' && !classInfo && classCode && (
              <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-sm text-amber-700 font-bold">
                ⚠ Kamu belum join kelas. Kamu bisa join nanti dari dashboard.
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(3)} className="px-5 py-2 rounded-full font-bold border-2 border-border">Kembali</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2 rounded-full font-bold gradient-grass text-white disabled:opacity-50"
              >
                {submitting ? 'Menyiapkan...' : 'Mulai Petualangan! 🚀'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 confirm for parent */}
        {step === 3 && role === 'parent' && (
          <div className="space-y-4 animate-pop-in">
            <p className="text-sm font-bold text-foreground">Konfirmasi</p>
            <div className="p-4 bg-muted/40 rounded-2xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Role</span>
                <span className="font-bold">Orang Tua</span>
              </div>
              {childInfo && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Anak</span>
                    <span className="font-bold">{childInfo.name}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(2)} className="px-5 py-2 rounded-full font-bold border-2 border-border">Kembali</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2 rounded-full font-bold gradient-grass text-white disabled:opacity-50"
              >
                {submitting ? 'Menyiapkan...' : 'Hubungkan ke Anak 👨‍👩‍👧'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
