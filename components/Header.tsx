'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserButton as ClerkUserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const navByRole: Record<string, { label: string; href: string }[]> = {
  student: [
    { label: 'Dashboard', href: '/dashboard/student' },
    { label: 'Statistik', href: '/dashboard/stats' },
    { label: 'Worlds', href: '/worlds' },
    { label: 'AI Coach', href: '/assessment' },
  ],
  parent: [
    { label: 'Anakku', href: '/parent' },
    { label: 'Aktivitas', href: '/parent/child' },
    { label: 'Leaderboard', href: '/parent/leaderboard' },
    { label: 'Worlds', href: '/worlds' },
  ],
  teacher: [
    { label: 'Kelas', href: '/teacher' },
    { label: 'Leaderboard', href: '/teacher/leaderboard' },
    { label: 'AI Coach', href: '/assessment' },
  ],
  admin: [
    { label: 'School', href: '/school' },
    { label: 'Teacher', href: '/teacher' },
    { label: 'Worlds', href: '/worlds' },
  ],
};

export function Header() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const role = userData?.role ?? null;
  const navItems = role ? (navByRole[role] ?? navByRole.student) : [];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b-4 border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 md:gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="MOVEVERSE" className="h-10 w-auto object-contain" />
          <div className="text-xs font-bold hidden sm:block">
            <span className="text-primary">MOVE</span>
            <span className="text-foreground">VERSE</span>
          </div>
        </Link>

        <nav className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft scale-105'
                    : 'text-foreground/70 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 flex items-center gap-2">
          {userData?.role === 'student' && (
            <div className="flex items-center gap-1 bg-sunny/30 px-3 py-1 rounded-full">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-extrabold">{userData.coins.toLocaleString()}</span>
            </div>
          )}
          <Link
            href="/profile"
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
              pathname === '/profile'
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'border-border hover:border-primary/40 text-foreground'
            }`}
          >
            Profile
          </Link>
          <ClerkUserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
        </div>
      </div>
    </header>
  );
}