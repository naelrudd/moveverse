'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Learning objectives popup — shown once per session after login.
 * "Diharapkan siswa mampu menirukan atau memperagakan..."
 * ponytail: localStorage key 'moveverse_objectives_seen' gates display.
 *            Clear it on logout or add date-based reset for daily re-show.
 */
export default function LearningObjectivesPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('moveverse_objectives_seen');
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('moveverse_objectives_seen', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-pop border-4 border-white animate-pop-in"
        style={{ background: 'linear-gradient(180deg, #fef9c3 0%, #fff 40%)' }}
      >
        {/* MOVA mascot */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-1 shadow-pop animate-float overflow-hidden">
            <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
          </div>
        </div>

        {/* Speech bubble */}
        <div className="relative bg-white rounded-2xl rounded-bl-md px-5 py-4 shadow-soft border-2 border-amber-200 mb-4">
          <span className="absolute -left-2 top-4 w-3 h-3 bg-white rotate-45 border-l-2 border-b-2 border-amber-200" />
          <p className="font-extrabold text-base sm:text-lg text-center text-foreground leading-relaxed">
            🎯 <span className="bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Tujuan Pembelajaran Hari Ini</span>
          </p>
        </div>

        {/* Objectives list */}
        <div className="space-y-3 mb-6">
          {[
            { emoji: '👀', text: 'Menonton demonstrasi gerakan dari MOVA' },
            { emoji: '🏃', text: 'Menirukan gerakan yang diperagakan' },
            { emoji: '⭐', text: 'Memperagakan gerak dasar dengan benar' },
            { emoji: '🏅', text: 'Mendapat badge dan XP setelah selesai' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-soft border border-amber-100 animate-slide-up"
              style={{ animationDelay: `${0.2 + i * 0.1}s` } as React.CSSProperties}
            >
              <span className="text-2xl shrink-0">{item.emoji}</span>
              <span className="text-sm font-bold text-foreground/80">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Key message */}
        <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-xl px-4 py-3 border-2 border-amber-200 mb-5">
          <p className="text-xs sm:text-sm font-bold text-amber-800 text-center leading-relaxed">
            Diharapkan peserta didik mampu <span className="text-amber-600">menirukan</span> atau <span className="text-amber-600">memperagakan</span> gerak-gerak dasar yang dipelajari hari ini 💪
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={dismiss}
          className="w-full py-3 rounded-full font-extrabold text-white text-base shadow-pop hover:scale-105 active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa, #c084fc)' }}
        >
          Mulai Petualangan! 🚀
        </button>
      </div>
    </div>
  );
}
