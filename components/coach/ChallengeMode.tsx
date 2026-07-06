'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { MovementType } from '@/lib/fms-scoring';

// ── Challenge Mode: compare two students ──

interface ChallengeModeProps {
  currentUserId: string;
  activity: MovementType;
}

export function ChallengeMode({ currentUserId, activity }: ChallengeModeProps) {
  const [expanded, setExpanded] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  // Fetch leaderboard for current activity (top 2 for quick challenge)
  const leaderboard = useQuery(
    api.liveCoach.getLeaderboard,
    expanded ? { activity, limit: 2 } : 'skip'
  );

  const myEntry = leaderboard?.find((e) => e.userId === currentUserId);
  const opponentEntry = leaderboard?.find((e) => e.userId !== currentUserId);

  // Generate invite link
  const generateInvite = () => {
    const code = `${activity}-${Date.now().toString(36)}`;
    setInviteCode(code);
    const url = `${window.location.origin}/assessment?challenge=${code}`;
    if (navigator.share) {
      navigator.share({ title: 'MOVEVERSE Challenge!', text: `Ayo tantang aku di ${activity}! 🏆`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Link challenge disalin! 📋'));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft border-2 border-red-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left font-bold text-sm sm:text-base flex items-center gap-2"
      >
        ⚔️ Challenge Mode {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <div className="mt-3">
          {/* Invite button */}
          <button
            onClick={generateInvite}
            className="w-full py-2 rounded-xl font-bold text-xs sm:text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all mb-3"
          >
            📨 Undang Teman untuk Challenge
          </button>

          {inviteCode && (
            <div className="bg-red-50 rounded-xl p-2 text-center mb-3 border border-red-100">
              <div className="text-[10px] text-red-500 font-medium">Kode Challenge</div>
              <div className="font-mono font-bold text-sm text-red-700">{inviteCode}</div>
            </div>
          )}

          {/* Challenge result (top 2) */}
          {leaderboard && leaderboard.length >= 2 ? (
            <div className="space-y-2">
              <div className="text-center text-[11px] sm:text-xs font-bold text-muted-foreground mb-2">
                ⚔️ Top 2 Peringkat — {activity}
              </div>

              {/* VS layout */}
              <div className="flex items-center gap-2">
                {/* Player 1 */}
                <div className={`flex-1 rounded-xl p-3 text-center border-2 ${
                  myEntry && opponentEntry && myEntry.score >= opponentEntry.score
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-2xl mb-1">
                    {myEntry && opponentEntry && myEntry.score >= opponentEntry.score ? '👑' : '😤'}
                  </div>
                  <div className="font-bold text-xs sm:text-sm truncate">{myEntry?.userName ?? 'Kamu'}</div>
                  <div className="font-extrabold text-xl text-amber-600">{myEntry?.score ?? '-'}</div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">Lv.{myEntry?.level ?? '-'}</div>
                </div>

                {/* VS */}
                <div className="text-lg font-extrabold text-red-400">VS</div>

                {/* Player 2 */}
                <div className={`flex-1 rounded-xl p-3 text-center border-2 ${
                  opponentEntry && myEntry && opponentEntry.score > myEntry.score
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-2xl mb-1">
                    {opponentEntry && myEntry && opponentEntry.score > myEntry.score ? '👑' : '😤'}
                  </div>
                  <div className="font-bold text-xs sm:text-sm truncate">{opponentEntry?.userName ?? 'Lawan'}</div>
                  <div className="font-extrabold text-xl text-amber-600">{opponentEntry?.score ?? '-'}</div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">Lv.{opponentEntry?.level ?? '-'}</div>
                </div>
              </div>

              {/* Winner announcement */}
              {myEntry && opponentEntry && (
                <div className={`text-center py-2 rounded-xl font-bold text-xs sm:text-sm ${
                  myEntry.score >= opponentEntry.score
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {myEntry.score >= opponentEntry.score
                    ? `🏆 Kamu menang! Selisih ${myEntry.score - opponentEntry.score} poin!`
                    : `😤 Lawan menang! Selisih ${opponentEntry.score - myEntry.score} poin. Ayo coba lagi!`}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-muted-foreground font-medium">
              {leaderboard === undefined
                ? 'Memuat...'
                : 'Minimal 2 siswa dibutuhkan untuk challenge. Undang temanmu!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
