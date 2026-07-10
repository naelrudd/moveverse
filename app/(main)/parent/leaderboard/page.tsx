'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Parent leaderboard — only shows full detail for own child.
 * Other students: rank + anonymized name only (privacy).
 */
export default function ParentLeaderboardPage() {
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const children = useQuery(
    api.users.getChildren,
    userData?._id ? { parentId: userData._id } : 'skip',
  );

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedChild = children?.[selectedIdx];

  const leaderboard = useQuery(
    api.liveCoach.getLeaderboard,
    selectedChild?.classId ? { activity: 'all', classId: selectedChild.classId as Id<'classes'> } : 'skip',
  );

  if (!userData || !children) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-muted-foreground">
        Memuat data...
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <div className="text-5xl mb-4">👨‍👩‍👧</div>
        <h1 className="text-2xl font-extrabold">Belum Ada Anak Tertaut</h1>
        <p className="text-muted-foreground mt-2">
          Hubungkan akun anak terlebih dahulu melalui profil.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-5 shadow-pop border-4 border-white">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <div className="text-xs font-bold text-muted-foreground">Papan Skor</div>
            <h1 className="text-2xl font-extrabold">Papan Skor Kelas Anak</h1>
          </div>
        </div>
        {/* Child selector */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {children.map((c, i) => {
            if (!c) return null;
            return (
              <button
                key={c._id}
                onClick={() => setSelectedIdx(i)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  selectedIdx === i
                    ? 'gradient-sunset text-white'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {c.avatar} {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Child stats — full detail */}
      {selectedChild && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-3xl p-4 shadow-soft text-center border-4 border-yellow-300">
            <div className="text-3xl">🎖️</div>
            <div className="text-3xl font-extrabold">{leaderboard?.find((l) => l.userId === selectedChild._id)?.rank ?? '-'}</div>
            <div className="text-xs font-bold text-muted-foreground">Rank di Kelas</div>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-soft text-center border-4 border-blue-200">
            <div className="text-3xl">📊</div>
            <div className="text-3xl font-extrabold">{selectedChild.xp?.toLocaleString() ?? 0}</div>
            <div className="text-xs font-bold text-muted-foreground">Total XP</div>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-soft text-center border-4 border-purple-200">
            <div className="text-3xl">🏅</div>
            <div className="text-3xl font-extrabold">{selectedChild.badges?.length ?? 0}</div>
            <div className="text-xs font-bold text-muted-foreground">Lencana</div>
          </div>
        </div>
      )}

      {/* Leaderboard — anonymized for other students */}
      <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border">
          <span className="font-extrabold">
            {selectedChild?.classId ? `Kelas` : 'Papan Skor'} — {(leaderboard?.length ?? 0)} peserta didik
          </span>
        </div>
        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((entry, i) => {
            const isOwnChild = entry.userId === selectedChild?._id;
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 px-4 sm:px-6 py-3 ${
                  isOwnChild
                    ? 'bg-blue-50 border-l-4 border-blue-500 font-bold'
                    : i % 2 === 0 ? 'bg-white' : 'bg-muted/20'
                }`}
              >
                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${
                  entry.rank === 1 ? 'bg-amber-400 text-white' :
                  entry.rank === 2 ? 'bg-gray-300 text-white' :
                  entry.rank === 3 ? 'bg-amber-700 text-white' :
                  'bg-muted'
                }`}>
                  {entry.rank}
                </div>
                {/* Name — full for own child, anonymized for others */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">
                    {isOwnChild ? (
                      <>{entry.userName} <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Anak kamu</span></>
                    ) : (
                      <span className="text-muted-foreground">Peserta Didik #{entry.rank}</span>
                    )}
                  </div>
                </div>
                {/* XP — only show for own child */}
                {isOwnChild && (
                  <div className="font-extrabold text-sm shrink-0">{entry.score.toLocaleString()} XP</div>
                )}
                {!isOwnChild && (
                  <div className="text-xs text-muted-foreground shrink-0">•••</div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm font-bold">Belum ada data papan skor</p>
          </div>
        )}
      </div>

      {/* Motivation */}
      <div className="bg-linear-to-r from-violet-500 to-purple-600 rounded-3xl p-5 shadow-soft text-white">
        <div className="flex items-center gap-4">
          <span className="text-4xl">💪</span>
          <div>
            <div className="font-extrabold text-lg">Khusus untuk orang tua</div>
            <p className="text-sm opacity-80">
              Bantu {selectedChild?.name ?? 'anak'} naik rank dengan rutin latihan gerak di rumah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
