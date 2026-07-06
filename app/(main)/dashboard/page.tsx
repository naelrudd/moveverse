'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import Image from 'next/image';
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
      <div className="w-16 h-16 relative rounded-full bg-linear-to-br from-amber-400 to-orange-500 p-1 shadow-soft overflow-hidden animate-bounce">
        <Image src="/mova-hero.png" alt="MOVA" fill className="object-contain" />
      </div>
    </div>
  );
}
