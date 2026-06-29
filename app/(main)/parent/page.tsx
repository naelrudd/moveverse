'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const weeklyData = [
  { d: 'Mon', score: 62 },
  { d: 'Tue', score: 68 },
  { d: 'Wed', score: 71 },
  { d: 'Thu', score: 70 },
  { d: 'Fri', score: 75 },
  { d: 'Sat', score: 78 },
  { d: 'Sun', score: 82 },
];

const familyChallenges = [
  { i: '🚶', t: 'Family Walk', g: 'gradient-grass' },
  { i: '🏃', t: 'Family Run', g: 'gradient-sky' },
  { i: '🦘', t: 'Jump Challenge', g: 'gradient-sunset' },
  { i: '🏞️', t: 'Weekend Adventure', g: 'gradient-magic' },
];

export default function ParentPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-[2rem] p-6 shadow-pop border-4 border-white flex items-center gap-4">
        <div className="w-20 h-20 animate-float flex items-center justify-center text-5xl">🦊</div>
        <div className="flex-1">
          <div className="text-xs font-bold text-muted-foreground">Weekly Family Report</div>
          <h1 className="text-3xl font-extrabold">Adi grew +12% this week! 🎉</h1>
          <p className="text-sm text-foreground/70">"Adi loved Jumping Jungle. Try the Family Jump Challenge this weekend!" — MOVA</p>
        </div>
        <button className="rounded-full font-bold gradient-sky text-white border-0 px-6 py-2">Download PDF</button>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold mb-3">Physical Literacy Trend</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={weeklyData}>
                <XAxis dataKey="d" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="oklch(0.7 0.18 235)" strokeWidth={4} dot={{ r: 6, fill: 'oklch(0.78 0.18 60)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold mb-3">Weekly Targets</h3>
          <ul className="space-y-2 text-sm font-bold">
            <li className="flex justify-between"><span>🏃 60 min activity</span><span className="text-secondary-foreground">✓</span></li>
            <li className="flex justify-between"><span>🧘 3 balance sessions</span><span className="text-secondary-foreground">✓</span></li>
            <li className="flex justify-between"><span>🎯 1 new game</span><span className="text-muted-foreground">…</span></li>
            <li className="flex justify-between"><span>👨‍👩‍👧 Family challenge</span><span className="text-muted-foreground">…</span></li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <h3 className="font-extrabold mb-4">Family Challenges</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {familyChallenges.map((c) => (
            <div key={c.t} className={`${c.g} text-white rounded-3xl p-5 shadow-soft`}>
              <div className="text-4xl">{c.i}</div>
              <div className="font-extrabold mt-1">{c.t}</div>
              <button className="mt-3 rounded-full font-bold bg-white/90 text-foreground px-4 py-1 text-sm">Accept</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
