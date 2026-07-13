// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      {/* LEFT — branding with MOVA (hidden on mobile) */}
      <div
        className="hidden sm:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)",
        }}
      >
        {/* Animated blobs */}
        <div className="absolute w-125 h-125 rounded-full bg-white/5 -top-24 -left-24 animate-float" />
        <div
          className="absolute w-75 h-75 rounded-full bg-white/5 -bottom-20 -right-10 animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute w-50 h-50 rounded-full bg-white/8 top-1/3 right-1/4 animate-float"
          style={{ animationDelay: "2s" }}
        />

        {/* MOVA mascot */}
        <div className="relative z-10 mb-8">
          <div className="w-48 h-48 rounded-full bg-linear-to-br from-amber-300 via-orange-400 to-red-400 p-2 shadow-pop animate-dance-slow relative overflow-hidden">
            <Image
              src="/mova-hero.png"
              alt="MOVA"
              fill
              className="object-contain drop-shadow-lg"
            />
            <div className="absolute inset-0 rounded-full animate-pulse-glow" />
          </div>
          <span className="absolute -top-3 left-8 text-2xl animate-sparkle">✨</span>
          <span className="absolute top-4 -right-2 text-lg animate-sparkle" style={{ animationDelay: "0.5s" }}>⭐</span>
          <span className="absolute -bottom-2 left-0 text-xl animate-sparkle" style={{ animationDelay: "1s" }}>💫</span>
          <span className="absolute bottom-6 -right-4 text-base animate-sparkle" style={{ animationDelay: "1.5s" }}>🌟</span>
        </div>

        <div className="relative z-10 text-center max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-white/90 rounded-2xl w-14 h-14 flex items-center justify-center shadow-soft">
              <Image src="/logo.png" alt="MOVEVERSE" width={44} height={44} />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              MOVE<span className="opacity-65">VERSE</span>
            </span>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Gerak.
            <br />
            Belajar.
            <br />
            Berkembang.
          </h1>

          <p className="text-sm text-white/75 leading-relaxed mb-8">
            Platform gamifikasi gerak motorik untuk anak Indonesia. Bersama{" "}
            <strong className="text-white">MOVA si rubah</strong>, setiap
            langkah jadi petualangan! 🦊
          </p>

          <div className="flex justify-center gap-8 mb-8">
            {[
              ["3", "Dunia"],
              ["18+", "Gerakan"],
              ["∞", "Fun"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold text-white">{n}</div>
                <div className="text-[11px] text-white/55 mt-1">{l}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center flex-wrap gap-2">
            {["🏆 Gamified", "🤖 AI Coach", "🇮🇩 Indonesia"].map((b) => (
              <span
                key={b}
                className="text-xs text-white px-4 py-1.5 rounded-full bg-white/15 border border-white/25"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Clerk sign-in */}
      <div className="flex-1 sm:w-120 bg-white flex flex-col items-center justify-center p-5 relative min-h-screen">
        {/* Top MOVA peek */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="w-10 h-10 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-0.5 shadow-soft overflow-hidden animate-float">
            <Image
              src="/mova-hero.png"
              alt="MOVA"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs font-bold text-gray-500">
            MOVA menyapa! 👋
          </span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-extrabold text-center mb-1">
            Selamat Datang! 👋
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            Masuk untuk mulai petualangan
          </p>

          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-lg bg-white rounded-2xl p-6 border border-gray-100",
                headerTitle: "text-xl font-bold",
                headerSubtitle: "text-gray-500",
                formButtonPrimary:
                  "bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 transition-opacity rounded-full font-bold py-3",
                socialButtonsBlockButton:
                  "rounded-full border-2 border-gray-200 font-bold",
                footerActionLink: "text-purple-600 font-bold hover:underline",
              },
            }}
          />
        </div>

        <p className="p-4 text-xs text-gray-400 italic text-center">
          &quot;Ayo bergerak, setiap langkah itu seru!&quot; — MOVA 🦊
        </p>

        {/* Bottom links */}
        <div className="absolute bottom-6 left-0 right-0 text-center space-y-2 px-4">
          <a
            href="mailto:natanaelrudyhadinata@gmail.com?subject=Daftar Sekolah di Moveverse&body=Halo, saya ingin mendaftarkan sekolah saya:%0A%0ANama Sekolah: %0ANPSN: %0A%0ATerima kasih."
            className="inline-block text-xs text-purple-600 font-bold hover:underline"
          >
            📧 Belum punya akun sekolah? Hubungi Admin
          </a>
        </div>
      </div>
    </div>
  );
}
