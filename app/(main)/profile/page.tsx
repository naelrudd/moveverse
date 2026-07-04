'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import AvatarPicker from '@/components/AvatarPicker';
import { ACTIVITIES } from '@/lib/worlds';

const roleLabels: Record<string, string> = {
  student: '🧒 Peserta Didik',
  parent: '👨‍👩‍👧 Orang Tua',
  teacher: '👩‍🏫 Guru',
  admin: '🛠️ Admin',
};

const roleColors: Record<string, string> = {
  student: 'gradient-sky',
  parent: 'gradient-sunset',
  teacher: 'gradient-grass',
  admin: 'gradient-magic',
};

export default function ProfilePage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const school = useQuery(api.schools.getSchool, userData?.schoolId ? { schoolId: userData.schoolId } : 'skip');
  const cls = useQuery(api.classes.getClass, userData?.classId ? { classId: userData.classId } : 'skip');
  const schools = useQuery(api.schools.getAllSchools);
  const classes = useQuery(api.classes.getClassesBySchool, userData?.schoolId ? { schoolId: userData.schoolId } : 'skip');
  const updateAvatar = useMutation(api.users.updateAvatar);
  const updateUser = useMutation(api.users.updateUser);
  const [editing, setEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState('🦊');
  const [editName, setEditName] = useState('');
  const [editNis, setEditNis] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSchoolId, setEditSchoolId] = useState<Id<'schools'> | ''>('');
  const [editClassId, setEditClassId] = useState<Id<'classes'> | ''>('');
  const [saving, setSaving] = useState(false);

  // Hydrate edit fields when userData loads
  if (userData && editSchoolId === '' && userData.schoolId) {
    setNewAvatar(userData.avatar);
    setEditName(userData.name || '');
    setEditNis(userData.nis || '');
    setEditPhone(userData.phone || '');
    setEditSchoolId(userData.schoolId as Id<'schools'>);
    setEditClassId(userData.classId as Id<'classes'> || '');
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-bounce text-4xl">🦊</div>
      </div>
    );
  }

  const role = userData.role ?? 'student';
  const badges = userData.badges ?? [];

  const handleSaveAvatar = async () => {
    await updateAvatar({ userId: userData._id, avatar: newAvatar });
    setEditing(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUser({
        userId: userData._id,
        name: editName || userData.name,
        nis: editNis || undefined,
        phone: editPhone || undefined,
        schoolId: editSchoolId || undefined,
        classId: editClassId || undefined,
        avatar: newAvatar,
      });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-10">
      <div className="bg-white rounded-[2rem] p-8 shadow-pop border-4 border-white animate-pop-in">
        <div className="flex flex-col items-center text-center mb-6">
          {/* Avatar — clickable to edit */}
          <div
            onClick={() => { setNewAvatar(userData.avatar); setEditing(true); }}
            className={`w-24 h-24 rounded-full ${roleColors[role] || 'gradient-sky'} flex items-center justify-center text-5xl shadow-soft mb-3 cursor-pointer hover:scale-105 hover:shadow-pop transition-all relative group`}
          >
            {userData.avatar}
            <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold">✏️</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold">{user?.firstName || userData.name}</h1>
          <span className={`mt-2 inline-block px-4 py-1 rounded-full text-sm font-bold text-white ${roleColors[role] || 'gradient-sky'}`}>
            {roleLabels[role] || 'Tidak Diketahui'}
          </span>
        </div>

        {/* Detail info */}
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="text-xs font-bold text-muted-foreground uppercase">Peran</div>
            <div className="font-extrabold text-lg">{roleLabels[role]}</div>
          </div>

          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="text-xs font-bold text-muted-foreground uppercase">Sekolah</div>
            <div className="font-extrabold text-lg">{school?.name || '-'}</div>
          </div>

          {userData.role === 'student' && userData.classId && (
            <div className="bg-muted/50 rounded-2xl p-4">
              <div className="text-xs font-bold text-muted-foreground uppercase">Kelas</div>
              <div className="font-extrabold text-lg">{cls ? `Kelas ${cls.name}` : '-'}</div>
            </div>
          )}

          {userData.nis && (
            <div className="bg-muted/50 rounded-2xl p-4">
              <div className="text-xs font-bold text-muted-foreground uppercase">NIS</div>
              <div className="font-extrabold text-lg">{userData.nis}</div>
            </div>
          )}

          {userData.phone && (
            <div className="bg-muted/50 rounded-2xl p-4">
              <div className="text-xs font-bold text-muted-foreground uppercase">No. HP</div>
              <div className="font-extrabold text-lg">{userData.phone}</div>
            </div>
          )}

          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="text-xs font-bold text-muted-foreground uppercase">Level</div>
            <div className="font-extrabold text-lg">Level {userData.level} Petualang</div>
          </div>

          <div className="bg-muted/50 rounded-2xl p-4 flex justify-between">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase">XP</div>
              <div className="font-extrabold text-lg">{userData.xp.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-muted-foreground uppercase">Koin</div>
              <div className="font-extrabold text-lg">{userData.coins.toLocaleString()}</div>
            </div>
          </div>

          {/* Badge */}
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Badge ({badges.length}/6)</div>
            <div className="grid grid-cols-6 gap-2">
              {ACTIVITIES.map((a) => {
                const earned = badges.includes(a.badgeId);
                return (
                  <div key={a.id} className={`rounded-xl p-2 text-center text-2xl ${earned ? 'bg-amber-50 border border-amber-200' : 'bg-muted/40 opacity-40'}`}>
                    {earned ? a.icon : '🔒'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => { setNewAvatar(userData.avatar); setEditing(true); }}
            className="w-full py-3 rounded-full font-bold border-2 border-border hover:border-primary/40 transition-all"
          >
            ✏️ Edit Profil
          </button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(false)}>
          <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white max-w-md w-full max-h-[90vh] overflow-y-auto animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-xl text-center mb-4">✏️ Edit Profil</h3>

            {/* Avatar picker */}
            <div className="text-center mb-4">
              <p className="text-xs font-bold text-muted-foreground mb-2">Pilih Avatar</p>
              <div className="text-6xl animate-float mb-2">{newAvatar}</div>
            </div>
            <AvatarPicker selected={newAvatar} onSelect={setNewAvatar} />

            <div className="space-y-3 mt-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-muted-foreground">Nama</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full p-3 rounded-2xl border-2 border-border font-bold text-sm"
                  placeholder="Nama kamu"
                />
              </div>

              {/* NIS (student only) */}
              {role === 'student' && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground">NIS</label>
                  <input
                    value={editNis}
                    onChange={(e) => setEditNis(e.target.value)}
                    className="mt-1 w-full p-3 rounded-2xl border-2 border-border font-bold text-sm"
                    placeholder="Nomor Induk Peserta Didik"
                  />
                </div>
              )}

              {/* Phone (parent only) */}
              {role === 'parent' && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground">No. HP</label>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1 w-full p-3 rounded-2xl border-2 border-border font-bold text-sm"
                    placeholder="Nomor HP"
                    type="tel"
                  />
                </div>
              )}

              {/* School */}
              <div>
                <label className="text-xs font-bold text-muted-foreground">Sekolah</label>
                <select
                  value={editSchoolId}
                  onChange={(e) => { setEditSchoolId(e.target.value as Id<'schools'>); setEditClassId(''); }}
                  className="mt-1 w-full p-3 rounded-2xl border-2 border-border bg-white font-bold text-sm"
                >
                  <option value="">Pilih sekolah...</option>
                  {schools?.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              {/* Class (student only) */}
              {role === 'student' && editSchoolId && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Kelas</label>
                  <select
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value as Id<'classes'>)}
                    className="mt-1 w-full p-3 rounded-2xl border-2 border-border bg-white font-bold text-sm"
                  >
                    <option value="">Pilih kelas...</option>
                    {classes?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-full font-bold border-2 border-border">
                Batal
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-2.5 rounded-full font-bold gradient-sky text-white disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan ✅'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
