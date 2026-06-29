'use client';

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const trend = Array.from({ length: 12 }, (_, i) => ({ m: `M${i + 1}`, s: 60 + Math.round(Math.sin(i / 2) * 5 + i * 1.5) }));
const byGender = [
  { name: 'Girls', value: 52, fill: 'oklch(0.78 0.18 350)' },
  { name: 'Boys', value: 48, fill: 'oklch(0.7 0.18 235)' },
];
const statCards = [
  { l: 'Total Students', v: '624' },
  { l: 'Active Students', v: '581' },
  { l: 'School PL Score', v: '76' },
  { l: 'Crystals Earned', v: '1,892' },
];

export default function SchoolPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="inline-block bg-white/80 px-4 py-1 rounded-full text-sm font-bold mb-2">🏫 School Analytics</div>
          <h1 className="text-4xl font-extrabold">SD MOVEVERSE Academy</h1>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full font-bold bg-white border-2 border-border px-4 py-2">Export PDF</button>
          <button className="rounded-full font-bold bg-white border-2 border-border px-4 py-2">Export Excel</button>
          <button className="rounded-full font-bold gradient-sunset text-white border-0 px-4 py-2">PowerPoint</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={s.l} className={`text-white rounded-3xl p-5 shadow-soft ${['gradient-sky','gradient-grass','gradient-sunset','gradient-magic'][i]}`}>
            <div className="text-xs font-bold opacity-90">{s.l}</div>
            <div className="text-3xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold mb-3">12-Month Trend</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 235)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 235)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" />
                <YAxis domain={[50, 100]} />
                <Tooltip />
                <Area dataKey="s" stroke="oklch(0.7 0.18 235)" fill="url(#g)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-extrabold mb-3">By Gender</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byGender} dataKey="value" innerRadius={50} outerRadius={90}>
                  {byGender.map((g) => <Cell key={g.name} fill={g.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {['Grade 1–2','Grade 3–4','Grade 5–6'].map((g, i) => (
          <div key={g} className="bg-white rounded-3xl p-5 shadow-soft">
            <div className="text-sm font-bold text-muted-foreground">{g}</div>
            <div className="text-3xl font-extrabold">{[71, 78, 82][i]}</div>
            <div className="text-xs text-secondary-foreground font-bold">▲ +{[5, 8, 6][i]}% vs last term</div>
          </div>
        ))}
      </div>
    </div>
  );
}
