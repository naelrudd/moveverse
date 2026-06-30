'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';

export default function DashboardRouter() {
  const { userId } = useAuth();
  const router = useRouter();
  const userData = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');

  useEffect(() => {
    if (!userData) return;
    switch (userData.role) {
      case 'parent':
        router.replace('/parent');
        break;
      case 'teacher':
        router.replace('/teacher');
        break;
      case 'admin':
        router.replace('/school');
        break;
      default:
        router.replace('/dashboard/student');
    }
  }, [userData, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-bounce text-4xl">🦊</div>
    </div>
  );
}
