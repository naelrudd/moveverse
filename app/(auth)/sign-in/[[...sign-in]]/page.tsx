// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "inherit" }}>
      {/* LEFT — branding */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(145deg, #0EA5E9, #7DD3FC)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            top: -100,
            left: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            bottom: -60,
            right: -60,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 320,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 16,
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image src="/logo.png" alt="MOVEVERSE" width={40} height={40} />
            </div>
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "white",
                letterSpacing: -1,
              }}
            >
              MOVE<span style={{ opacity: 0.65 }}>VERSE</span>
            </span>
          </div>

          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Gerak.
            <br />
            Belajar.
            <br />
            Berkembang.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.7,
              marginBottom: 40,
            }}
          >
            Platform gamifikasi gerak untuk anak Indonesia. Bersama MOVA, setiap
            langkah jadi petualangan!
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 36,
              marginBottom: 28,
            }}
          >
            {[
              ["5", "Worlds"],
              ["50+", "Gerakan"],
              ["∞", "Fun"],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
                  {n}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.65)",
                    marginTop: 2,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {["🏆 Gamified", "🤖 AI Coach", "🇮🇩 Indonesia"].map((b) => (
              <span
                key={b}
                style={{
                  fontSize: 12,
                  color: "white",
                  padding: "5px 14px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.28)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Clerk, no navbar */}
      <div
        style={{
          width: 480,
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none bg-transparent border-0 p-0 w-full",
              headerTitle: "text-xl font-bold",
            },
          }}
        />
      </div>
    </div>
  );
}
