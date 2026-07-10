"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ScoreHistoryChart } from "@/components/coach/ScoreHistoryChart";
import { Leaderboard } from "@/components/coach/Leaderboard";
import { ChallengeMode } from "@/components/coach/ChallengeMode";
import type { MovementType } from "@/lib/fms-scoring";
import { useState } from "react";
import Image from "next/image";

// ── Stats Page: kid-friendly, candy/game aesthetic ──

const ACTIVITIES: { id: MovementType; label: string; emoji: string; gradient: string }[] = [
  { id: "menekuk", label: "Menekuk", emoji: "🦵", gradient: "linear-gradient(135deg, #4ade80, #22c55e)" },
  { id: "meliuk", label: "Meliuk", emoji: "🐍", gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)" },
  { id: "memutar", label: "Memutar", emoji: "🌀", gradient: "linear-gradient(135deg, #c084fc, #a855f7)" },
  { id: "keseimbangan", label: "Keseimbangan", emoji: "⚖️", gradient: "linear-gradient(135deg, #fb923c, #f97316)" },
];

function SessionHistory({ userId }: { userId: string }) {
  const history = useQuery(api.liveCoach.getSessionHistory, {
    userId: userId as Id<"users">,
    limit: 30,
  });

  const exportCSV = () => {
    if (!history?.length) return;
    const header = "Aktivitas,Level,Skor,Durasi (detik),Tanggal\n";
    const rows = history
      .map(
        (h) =>
          `${h.activity},${h.level},${h.score},${h.duration.toFixed(0)},${new Date(h.timestamp).toLocaleDateString("id-ID")}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat-coach-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-pop border-2 border-purple-200 relative overflow-hidden">
      {/* Decorative gradient strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #c084fc, #a855f7, #7c3aed)' }} />

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
          📋 Riwayat Sesi
        </h3>
        {history && history.length > 0 && (
          <button
            onClick={exportCSV}
            className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full hover:bg-purple-100 transition border border-purple-200"
          >
            📥 CSV
          </button>
        )}
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {history && history.length > 0 ? (
          history.map((h) => {
            const act = ACTIVITIES.find((a) => a.id === h.activity);
            return (
              <div
                key={h._id}
                className="flex items-center gap-2.5 p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 hover:shadow-soft transition-all"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ background: act?.gradient ?? 'linear-gradient(135deg, #c084fc, #a855f7)' }}
                >
                  {act?.emoji ?? '🎯'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm capitalize truncate">
                    {h.activity} Lv.{h.level}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(h.timestamp).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-sm text-primary">{h.score}</div>
                  <div className="text-[10px] text-muted-foreground">{h.duration.toFixed(0)}s</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2 animate-float">📊</div>
            <p className="text-sm font-bold text-muted-foreground">Belum ada sesi</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Mulai latihan di Pelatih AI untuk melihat riwayat
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { userId } = useAuth();
  const [activity, setActivity] = useState<MovementType>("menekuk");
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip");
  const liveStats = useQuery(
    api.liveCoach.getLiveStats,
    userData?._id ? { userId: userData._id } : "skip",
  );

  if (!userId) return null;

  // Compute quick stats
  const totalSessions = liveStats?.reduce((a, s) => a + s.count, 0) ?? 0;
  const avgScore = liveStats && liveStats.length > 0
    ? Math.round(liveStats.reduce((a, s) => a + s.avgScore, 0) / liveStats.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 bg-theme-forest min-h-screen">
      {/* ── Hero header ── */}
      <div className="relative rounded-[2rem] p-5 sm:p-6 shadow-pop border-4 border-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.92 0.12 230), oklch(0.95 0.1 60))' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-1 shadow-pop animate-float shrink-0 overflow-hidden">
            <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl">
              📊 Statistik & Kompetisi
            </h1>
            <p className="text-xs font-bold text-foreground/60">Lihat perkembanganmu! 🚀</p>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
          {[
            { icon: '🎯', label: 'Total Sesi', value: totalSessions, bg: 'linear-gradient(135deg, #6366f1, #818cf8)' },
            { icon: '⭐', label: 'Rata-rata Skor', value: avgScore, bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
            { icon: '🏆', label: 'Aktivitas', value: liveStats?.length ?? 0, bg: 'linear-gradient(135deg, #10b981, #34d399)' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="text-white rounded-2xl p-3 text-center shadow-soft relative overflow-hidden"
              style={{ background: s.bg }}
            >
              <div className="text-xl mb-0.5">{s.icon}</div>
              <div className="text-xl font-extrabold">{s.value}</div>
              <div className="text-[10px] font-bold opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity filter — candy pills ── */}
      <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            onClick={() => setActivity(a.id)}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border-2 ${
              activity === a.id
                ? "text-white shadow-pop scale-105 border-transparent"
                : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
            }`}
            style={activity === a.id ? { background: a.gradient } : {}}
          >
            {a.emoji} {a.label}
          </button>
        ))}
      </div>

      {/* ── History + Chart ── */}
      <div className="grid sm:grid-cols-2 gap-5">
        <SessionHistory userId={userId} />
        <ScoreHistoryChart userId={userId} />
      </div>

      {/* ── Leaderboard + Challenge ── */}
      <div className="grid sm:grid-cols-2 gap-5">
        <Leaderboard activity={activity} />
        <ChallengeMode currentUserId={userId} activity={activity} />
      </div>

      {/* ── MOVA tip ── */}
      <div className="flex justify-center">
        <div className="flex items-start gap-2 animate-slide-up">
          <div className="w-8 h-8 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-0.5 shadow-soft shrink-0 overflow-hidden">
            <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
          </div>
          <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 shadow-soft text-xs font-bold text-foreground/80 relative">
            <span className="absolute -left-1 top-3 w-2 h-2 bg-white rotate-45 shadow-soft" />
            💡 Terus latihan supaya skor makin tinggi! 🌟
          </div>
        </div>
      </div>
    </div>
  );
}
