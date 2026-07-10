"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth, UserButton as ClerkUserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const navByRole: Record<string, { label: string; href: string; emoji?: string }[]> = {
  student: [
    { label: "Beranda", href: "/dashboard/student", emoji: "🏠" },
    { label: "Papan Skor", href: "/dashboard/stats", emoji: "📊" },
    { label: "Dunia", href: "/worlds", emoji: "🌍" },
    { label: "AI Coach", href: "/assessment", emoji: "🤖" },
    { label: "Sekolah", href: "/school", emoji: "🏫" },
  ],
  parent: [
    { label: "Aktivitas Anak", href: "/parent", emoji: "📊" },
    { label: "Papan Skor", href: "/parent/leaderboard", emoji: "🏆" },
    { label: "Sekolah", href: "/school", emoji: "🏫" },
  ],
  teacher: [
    { label: "Kelas", href: "/teacher", emoji: "📚" },
    { label: "Papan Skor", href: "/teacher/leaderboard", emoji: "🏆" },
    { label: "AI Coach", href: "/assessment", emoji: "🤖" },
    { label: "Sekolah", href: "/school", emoji: "🏫" },
  ],
  admin: [
    { label: "Admin", href: "/admin", emoji: "👑" },
    { label: "Sekolah", href: "/school", emoji: "🏫" },
    { label: "Guru", href: "/teacher", emoji: "📚" },
    { label: "Dunia", href: "/worlds", emoji: "🌍" },
  ],
  school_admin: [
    { label: "Beranda", href: "/admin", emoji: "🏫" },
    { label: "Sekolah", href: "/school", emoji: "🏫" },
    { label: "Guru", href: "/teacher", emoji: "📚" },
  ],
};

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-amber-500 text-white" },
  school_admin: { label: "Admin Sekolah", color: "bg-red-500 text-white" },
  teacher: { label: "Guru", color: "bg-green-500 text-white" },
  student: { label: "Siswa", color: "bg-blue-500 text-white" },
  parent: { label: "Ortu", color: "bg-purple-500 text-white" },
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
  const badge = role ? ROLE_BADGES[role] : null;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b-2 border-primary/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="MOVEVERSE"
            width={28}
            height={28}
            className="h-7 w-auto object-contain"
          />
          <div className="text-sm font-extrabold hidden sm:block">
            <span className="text-primary">MOVE</span>
            <span className="text-foreground">VERSE</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground/60 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {item.emoji && <span className="text-xs">{item.emoji}</span>}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Role badge */}
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${badge.color}`}>
              {badge.label}
            </span>
          )}

          {/* Coins (student only) */}
          {userData?.role === "student" && (
            <div className="flex items-center gap-1 bg-sunny/30 px-2.5 py-1 rounded-full">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-extrabold">
                {userData.coins.toLocaleString()}
              </span>
            </div>
          )}

          {/* Profile */}
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

          {/* Clerk User Button */}
          <ClerkUserButton
            appearance={{ elements: { avatarBox: "w-8 h-8" } }}
          />
        </div>
      </div>
    </header>
  );
}
