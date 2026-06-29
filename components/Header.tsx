'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserButton as ClerkUserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const navByRole: Record<string, { label: string; href: string }[]> = {
  student: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Worlds', href: '/worlds' },
    { label: 'AI Coach', href: '/assessment' },
    { label: 'School', href: '/school' },
  ],
  parent: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'School', href: '/school' },
    { label: 'Report', href: '/parent' },
  ],
  teacher: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Worlds', href: '/worlds' },
    { label: 'AI Coach', href: '/assessment' },
    { label: 'Teacher', href: '/teacher' },
    { label: 'School', href: '/school' },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Worlds', href: '/worlds' },
    { label: 'AI Coach', href: '/assessment' },
    { label: 'Teacher', href: '/teacher' },
    { label: 'School', href: '/school' },
  ],
};

export function Header() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const role = userData?.role || 'student';
  const navItems = navByRole[role] || navByRole.student;

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
        <nav className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar justify-end md:justify-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
        <UserButton />
      </div>
    </header>
  );
}

function UserButton() {
  const { userId } = useAuth();
  if (!userId) return null;

  return (
    <div className="shrink-0 flex items-center gap-2">
      <Link href="/onboarding" className="text-xs font-bold px-3 py-1 rounded-full gradient-sunny/30 text-foreground hover:bg-sunny/50 transition-colors">
        Profile
      </Link>
      <ClerkUserButton
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
          },
        }}
      />
    </div>
  );
}
