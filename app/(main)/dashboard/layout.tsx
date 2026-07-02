'use client';

import { useEffect } from 'react';
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
          <div className="animate-bounce text-4xl mb-4">🦊</div>
          <p className="text-lg font-bold text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
