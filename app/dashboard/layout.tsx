'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const { user } = useUser();
  const getUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    // Auto-create user if logged in but not in Convex DB yet
    if (userId && user && getUser === null) {
      createUser({
        clerkId: userId,
        name: user.firstName || user.username || 'Explorer',
        grade: '1', // default grade
        avatar: '🦊', // default avatar
      }).catch((err) => {
        console.error('Failed to create user:', err);
      });
    }
  }, [userId, user, getUser, createUser]);

  // Show loading while checking/creating user
  if (getUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-bounce text-4xl mb-4">🦊</div>
          <p className="text-lg font-bold text-slate-700">Setting up your adventure...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
