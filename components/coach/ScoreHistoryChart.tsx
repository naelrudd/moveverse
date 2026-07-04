'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { MovementType } from '@/lib/fms-scoring';
import { useState } from 'react';

// ── Score History Chart: pure SVG, always expanded, mobile-first ──

interface ScoreHistoryChartProps {
  userId: string;
}

const COLORS: Record<string, string> = {
  menekuk: '#3b82f6',
  meliuk: '#f59e0b',
  memutar: '#a855f7',
  keseimbangan: '#22c55e',
};

const LABELS: Record<string, string> = {
  menekuk: '🦵 Menekuk',
  meliuk: '🐍 Meliuk',
  memutar: '🌀 Memutar',
  keseimbangan: '⚖️ Keseimbangan',
};

export function ScoreHistoryChart({ userId }: ScoreHistoryChartProps) {
  const [selected, setSelected] = useState<MovementType>('menekuk');

  const history = useQuery(api.liveCoach.getSessionHistory, { userId: userId as any, limit: 30 });

  const data = (history ?? [])
    .filter((h) => h.activity === selected)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-15);

  const W = 300, H = 120, PAD = 30;
  const scores = data.map((d) => d.score);
  const maxScore = Math.max(100, ...scores);
  const minScore = Math.min(0, ...scores);
  const range = maxScore - minScore || 1;

  const points = data.map((d, i) => ({
    x: PAD + (i / Math.max(1, data.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (d.score - minScore) / range) * (H - PAD * 2),
  }));

  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    : '';

  const areaD = pathD ? `${pathD} L${points[points.length - 1].x},${H - PAD} L${points[0].x},${H - PAD} Z` : '';

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-soft border-2 border-orange-200">
      <h3 className="font-extrabold text-xs flex items-center gap-1.5 mb-2">📈 Grafik Perkembangan</h3>

      {/* Activity filter — tiny pills */}
      <div className="flex gap-1 mb-2 overflow-x-auto no-scrollbar">
        {(Object.keys(COLORS) as MovementType[]).map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${
              selected === key
                ? 'text-white shadow-sm'
                : 'bg-muted hover:bg-orange-100'
            }`}
            style={selected === key ? { backgroundColor: COLORS[key] } : undefined}
          >
            {LABELS[key]}
          </button>
        ))}
      </div>

      {/* Chart */}
      {data.length >= 2 ? (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
          {[0, 25, 50, 75, 100].map((v) => {
            const y = PAD + (1 - (v - minScore) / range) * (H - PAD * 2);
            return (
              <g key={v}>
                <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={PAD - 5} y={y + 3} textAnchor="end" className="text-[8px] fill-slate-400">{v}</text>
              </g>
            );
          })}
          <path d={areaD} fill={`${COLORS[selected]}20`} />
          <path d={pathD} fill="none" stroke={COLORS[selected]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={COLORS[selected]} stroke="white" strokeWidth="1.5" />
          ))}
        </svg>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <div className="text-2xl mb-1">📈</div>
          <p className="text-[11px] font-bold">
            {data.length === 0 ? 'Belum ada data' : 'Minimal 2 sesi dibutuhkan'}
          </p>
        </div>
      )}

      {/* Stats summary */}
      {data.length > 0 && (
        <div className="flex gap-1.5 mt-2 text-[10px] font-bold flex-wrap">
          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
            Avg: {Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}
          </span>
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
            Best: {Math.max(...scores)}
          </span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
            {data.length} sesi
          </span>
        </div>
      )}
    </div>
  );
}
