'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const students = [
  { name: 'Adi', level: 3, score: 82, trend: '▲' },
  { name: 'Mira', level: 4, score: 88, trend: '▲' },
  { name: 'Joko', level: 2, score: 64, trend: '▶' },
  { name: 'Sari', level: 3, score: 75, trend: '▲' },
  { name: 'Budi', level: 2, score: 58, trend: '▼' },
  { name: 'Nina', level: 4, score: 91, trend: '▲' },
];

const classScores = [
  { c: 'Class 3A', s: 78 },
  { c: 'Class 3B', s: 71 },
  { c: 'Class 4A', s: 83 },
  { c: 'Class 4B', s: 76 },
  { c: 'Class 5A', s: 80 },
];

const statCards = [
  { l: 'Students', v: '28', t: 'gradient-sky' },
  { l: 'Active today', v: '24', t: 'gradient-grass' },
  { l: 'Class PL Score', v: '78', t: 'gradient-sunset' },
  { l: 'Participation', v: '92%', t: 'gradient-magic' },
];

export default function TeacherPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div>
        <div className="inline-block bg-white/80 px-4 py-1 rounded-full text-sm font-bold mb-2">👩‍🏫 Teacher Mode</div>
        <h1 className="text-4xl font-extrabold">Class 3A · Movement Overview</h1>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.l} className={`${s.t} text-white rounded-3xl p-5 shadow-soft`}>
            <div className="text-xs font-bold opacity-90">{s.l}</div>
            <div className="text-3xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold mb-3">Class Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={classScores}>
                <XAxis dataKey="c" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="s" radius={[10, 10, 0, 0]} fill="oklch(0.7 0.18 235)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold mb-3">AI Recommendations</h3>
          <ul className="text-sm space-y-3">
            <li className="p-3 bg-secondary/20 rounded-2xl"><b>Group A</b> — Enrichment: Advanced agility drills.</li>
            <li className="p-3 bg-sunny/20 rounded-2xl"><b>Group B</b> — Differentiated: Balance & coordination focus.</li>
            <li className="p-3 bg-accent/20 rounded-2xl"><b>Group C</b> — Remedial: Fundamental jumping & landing.</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <h3 className="font-extrabold mb-3">Student Heatmap</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="p-2">Student</th><th>Level</th><th>PL Score</th><th>Trend</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.name} className="border-b last:border-0">
                  <td className="p-2 font-bold">{s.name}</td>
                  <td>Lv {s.level}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full gradient-sky" style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="font-bold">{s.score}</span>
                    </div>
                  </td>
                  <td className="font-bold">{s.trend}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.score >= 80 ? 'bg-secondary/40' : s.score >= 65 ? 'bg-sunny/40' : 'bg-destructive/20 text-destructive'}`}>
                      {s.score >= 80 ? 'Thriving' : s.score >= 65 ? 'On Track' : 'Support'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
