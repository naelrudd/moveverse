import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL - Branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden gradient-sunset">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-16 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center text-center px-10">
          <div className="flex items-center gap-3 mb-10">
            <img src="/logo.png" alt="MOVEVERSE" className="w-14 h-14 object-contain bg-white rounded-xl p-2" />
            <span className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Fredoka, "Baloo 2", Nunito, sans-serif' }}>
              MOVE<span className="opacity-70">VERSE</span>
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Mulai Petualangan
            <br />
            Gerakmu!
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-xs font-bold">
            Daftar sekarang dan temukan 5 dunia ajaib bersama MOVA.
            Setiap gerakanmu menghasilkan XP, koin, dan crystal!
          </p>

          <div className="flex gap-8 mt-10">
            {[
              ["5", "Worlds"],
              ["50+", "Gerakan"],
              ["∞", "Fun"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-extrabold text-white">{num}</div>
                <div className="text-xs text-white/70 font-bold mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            {["🏆 Gamified", "🤖 AI Coach", "🇮🇩 Made for Indonesia"].map(
              (b) => (
                <span
                  key={b}
                  className="text-xs font-bold text-white px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  {b}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Clerk */}
      <div className="flex flex-1 lg:max-w-[440px] items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="MOVEVERSE" className="w-8 h-8 object-contain" />
            <span className="text-xl font-extrabold text-accent">MOVEVERSE</span>
          </div>

          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0",
                headerTitle: "text-xl font-semibold",
                headerSubtitle: "text-sm text-gray-500",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
