'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const router = useRouter();
  const getUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');

  useEffect(() => {
    if (userId && getUser === null) {
      router.replace('/onboarding');
    }
  }, [userId, getUser, router]);

  if (getUser === undefined || getUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-1 shadow-soft overflow-hidden animate-bounce">
            <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
          </div>
          <p className="text-lg font-bold text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
