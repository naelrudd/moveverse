'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Worlds', href: '/worlds' },
  { label: 'AI Coach', href: '/assessment' },
  { label: 'Parents', href: '/parent' },
  { label: 'Teachers', href: '/teacher' },
  { label: 'Schools', href: '/school' },
];

export function Header() {
  const pathname = usePathname();

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
            const isActive = pathname.startsWith(item.href);
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
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full bg-sunny/30 flex items-center justify-center text-xs font-bold">
            1,240
          </div>
        </div>
      </div>
    </header>
  );
}
