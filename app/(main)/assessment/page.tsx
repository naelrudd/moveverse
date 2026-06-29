'use client';

import { Camera, Upload, Video, Sparkles } from 'lucide-react';

const scores = [
  { label: 'Movement', value: 84, color: 'gradient-grass' },
  { label: 'Posture', value: 76, color: 'gradient-sky' },
  { label: 'Balance', value: 82, color: 'gradient-magic' },
  { label: 'Coordination', value: 71, color: 'gradient-sunset' },
  { label: 'Agility', value: 78, color: 'gradient-gold' },
  { label: 'Confidence', value: 90, color: 'gradient-sunset' },
];

export default function AssessmentPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8 animate-pop-in">
        <div className="inline-block bg-white/80 px-4 py-1 rounded-full text-sm font-bold mb-3">🎥 AI Pose Coach</div>
        <h1 className="text-4xl md:text-5xl font-extrabold">Show MOVA Your Move!</h1>
        <p className="text-muted-foreground mt-2">AI tracks your skeleton, joints, and movement quality in real time.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera area */}
        <div className="bg-foreground/90 text-white rounded-[2rem] p-6 shadow-pop relative overflow-hidden">
          <div className="aspect-video rounded-2xl bg-black/40 grid place-items-center relative overflow-hidden">
            <div className="absolute inset-0 grid place-items-center opacity-60">
              <svg viewBox="0 0 200 200" className="w-2/3 h-2/3">
                <circle cx="100" cy="40" r="14" fill="oklch(0.82 0.2 145)" />
                <line x1="100" y1="54" x2="100" y2="120" stroke="white" strokeWidth="4" />
                <line x1="100" y1="70" x2="60" y2="100" stroke="white" strokeWidth="4" />
                <line x1="100" y1="70" x2="140" y2="100" stroke="white" strokeWidth="4" />
                <line x1="100" y1="120" x2="70" y2="180" stroke="white" strokeWidth="4" />
                <line x1="100" y1="120" x2="130" y2="180" stroke="white" strokeWidth="4" />
                {[[60,100,"oklch(0.82 0.2 145)"],[140,100,"oklch(0.9 0.18 95)"],[70,180,"oklch(0.82 0.2 145)"],[130,180,"oklch(0.65 0.24 25)"],[100,70,"oklch(0.82 0.2 145)"],[100,120,"oklch(0.9 0.18 95)"]].map(([x,y,c],i)=>(
                  <circle key={i} cx={x as number} cy={y as number} r="6" fill={c as string} />
                ))}
              </svg>
            </div>
            <div className="absolute top-3 left-3 bg-red-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">● LIVE</div>
            <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur text-xs font-bold px-3 py-1 rounded-full">Pose Tracking</div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 rounded-full font-bold gradient-sunset text-white border-0 h-12 flex items-center justify-center"><Camera className="w-4 h-4 mr-1" /> Start Camera</button>
            <button className="rounded-full font-bold h-12 w-12 bg-white/20 text-white flex items-center justify-center"><Video className="w-4 h-4" /></button>
            <button className="rounded-full font-bold h-12 w-12 bg-white/20 text-white flex items-center justify-center"><Upload className="w-4 h-4" /></button>
          </div>
          <div className="text-xs opacity-70 mt-3 flex gap-4">
            <span>🟢 Excellent</span><span>🟡 Moderate</span><span>🔴 Improve</span>
          </div>
        </div>

        {/* MOVA feedback */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 shadow-pop">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-16 h-16 -mt-2 animate-wobble flex items-center justify-center text-4xl">🦊</div>
              <div className="bg-primary/10 rounded-2xl rounded-tl-none p-4 flex-1">
                <div className="font-bold text-sm text-primary">MOVA says</div>
                <p className="text-sm font-bold mt-1">"Excellent jump! 🎉 Try bending your knees a bit more during landing. Your balance improved by 15% this week!"</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {scores.map((s) => (
                <div key={s.label} className={`${s.color} text-white rounded-2xl p-3 shadow-soft`}>
                  <div className="text-xs font-bold opacity-90">{s.label}</div>
                  <div className="text-2xl font-extrabold">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-soft">
            <h3 className="font-extrabold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> AI Insights</h3>
            <ul className="text-sm space-y-2">
              <li><b>Strength:</b> Outstanding take-off explosiveness.</li>
              <li><b>Improve:</b> Soften your landings — bend knees on impact.</li>
              <li><b>Suggested:</b> Try Balance Island's Beam Walk next!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
