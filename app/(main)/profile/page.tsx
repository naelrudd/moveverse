'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import AvatarPicker from '@/components/AvatarPicker';
import { ACTIVITIES } from '@/lib/worlds';

const roleLabels: Record<string, string> = {
  student: '🧒 Siswa',
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
  const [editing, setEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState(userData?.avatar || '🦊');

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-bounce text-4xl">🦊</div>
      </div>
    );
  }

  const role = userData.role ?? 'student';
  const badges = userData.badges ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-[2rem] p-8 shadow-pop border-4 border-white animate-pop-in">
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-24 h-24 rounded-full ${roleColors[role] || 'gradient-sky'} flex items-center justify-center text-5xl shadow-soft mb-3`}>
            {userData.avatar}
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
          <Link href="/onboarding" className="block w-full text-center py-3 rounded-full font-bold border-2 border-border hover:border-primary/40 transition-all">
            Edit Profil
          </Link>
        </div>
      </div>
    </div>
  );
}
