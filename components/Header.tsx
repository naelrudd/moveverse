"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton as ClerkUserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const navByRole: Record<string, { label: string; href: string }[]> = {
  student: [
    { label: "Dashboard", href: "/dashboard/student" },
    { label: "Statistik", href: "/dashboard/stats" },
    { label: "Dunia", href: "/worlds" },
    { label: "AI Coach", href: "/assessment" },
  ],
  parent: [
    { label: "Aktivitas", href: "/parent" },
    { label: "Leaderboard", href: "/parent/leaderboard" },
  ],
  teacher: [
    { label: "Kelas", href: "/teacher" },
    { label: "Leaderboard", href: "/teacher/leaderboard" },
    { label: "AI Coach", href: "/assessment" },
  ],
  admin: [
    { label: "Sekolah", href: "/school" },
    { label: "Guru", href: "/teacher" },
    { label: "Dunia", href: "/worlds" },
  ],
};

export function Header() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const userData = useQuery(
    api.users.getUser,
    userId ? { clerkId: userId } : "skip",
  );
  const role = userData?.role ?? null;
  const navItems = role ? (navByRole[role] ?? navByRole.student) : [];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b-4 border-primary/20">
      <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-7xl mx-auto px-4 items-center gap-3 md:gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/logo.png"
            alt="MOVEVERSE"
            className="h-6 w-auto object-contain"
          />
          <div className="text-xs font-bold hidden sm:block">
            <span className="text-primary">MOVE</span>
            <span className="text-foreground">VERSE</span>
          </div>
        </Link>

        <nav className="flex-1 flex py-3 items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center whitespace-nowrap px-3 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft scale"
                    : "text-foreground/70 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 flex items-center gap-2">
          {userData?.role === "student" && (
            <div className="flex items-center gap-1 bg-sunny/30 px-3 py-1 rounded-full">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-extrabold">
                {userData.coins.toLocaleString()}
              </span>
            </div>
          )}
          <Link
            href="/profile"
            className={`flex items-center justify-center whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
              pathname === "/profile"
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-border hover:border-primary/40 text-foreground"
            }`}
          >
            Profil
          </Link>
          <ClerkUserButton
            appearance={{ elements: { avatarBox: "w-8 h-8" } }}
          />
        </div>
      </div>
    </header>
  );
}
