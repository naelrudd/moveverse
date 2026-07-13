'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-500 to-orange-400 relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute w-96 h-96 rounded-full bg-white/5 -top-32 -left-32 animate-float" />
      <div className="absolute w-72 h-72 rounded-full bg-white/5 bottom-20 -right-20 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute w-48 h-48 rounded-full bg-white/8 top-1/3 left-1/4 animate-float" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* MOVA mascot */}
        <div className="mb-6">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-linear-to-br from-amber-300 via-orange-400 to-red-400 p-2 shadow-pop animate-dance-slow relative overflow-hidden">
            <Image
              src="/mova-hero.png"
              alt="MOVA"
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white/90 rounded-2xl w-12 h-12 flex items-center justify-center shadow-soft">
            <Image src="/logo.png" alt="MOVEVERSE" width={36} height={36} />
          </div>
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            MOVE<span className="opacity-65">VERSE</span>
          </span>
        </div>

        {/* Tagline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
          Gerak.
          <br />
          Belajar.
          <br />
          Berkembang.
        </h1>

        <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-8 max-w-md">
          Platform gamifikasi gerak motorik untuk anak Indonesia.
          Bersama <strong className="text-white">MOVA si rubah</strong>,
          setiap langkah jadi petualangan! 🦊
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-8">
          {[
            ["3", "Dunia"],
            ["18+", "Gerakan"],
            ["∞", "Fun"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="text-2xl font-bold text-white">{n}</div>
              <div className="text-[11px] text-white/60 mt-1">{l}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["🏆 Gamified", "🤖 AI Coach", "🇮🇩 Indonesia"].map((b) => (
            <span
              key={b}
              className="text-xs text-white px-4 py-1.5 rounded-full bg-white/15 border border-white/25"
            >
              {b}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link
            href="/sign-in"
            className="flex-1 bg-white text-purple-700 font-extrabold py-3 px-6 rounded-full shadow-pop hover:shadow-xl hover:scale-105 transition-all text-center"
          >
            Masuk 🚀
          </Link>
          <Link
            href="/sign-up"
            className="flex-1 bg-white/20 text-white font-extrabold py-3 px-6 rounded-full border-2 border-white/40 hover:bg-white/30 transition-all text-center"
          >
            Daftar ✨
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-white/50">
          &quot;Ayo bergerak, setiap langkah itu seru!&quot; — MOVA 🦊
        </p>
      </div>
    </div>
  );
}
