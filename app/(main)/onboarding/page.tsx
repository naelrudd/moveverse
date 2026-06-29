'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'student' | 'parent' | 'teacher' | 'admin' | ''>('');
  const [schoolId, setSchoolId] = useState('');
  const [classId, setClassId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const createUser = useMutation(api.users.createUser);
  const existingUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : 'skip');

  // Seed schools/classes on mount
  useEffect(() => {
    if (existingUser) {
      router.push('/dashboard');
    }
  }, [existingUser, router]);

  const handleSubmit = async () => {
    if (!userId || !role || !schoolId) return;
    setSubmitting(true);
    try {
      await createUser({
        clerkId: userId,
        name: user?.firstName || user?.username || 'Explorer',
        grade: '1',
        avatar: '🦊',
        role: role as 'student' | 'parent' | 'teacher' | 'admin',
        schoolId: schoolId as any,
        classId: classId ? (classId as any) : undefined,
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (existingUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="animate-bounce text-4xl">🦊</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-[2rem] p-8 shadow-pop border-4 border-white animate-pop-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🦊</div>
          <h1 className="text-2xl font-extrabold text-foreground">Welcome to MOVEVERSE!</h1>
          <p className="text-sm text-muted-foreground mt-1">Let's set up your adventure profile.</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {s}
            </div>
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <div className="space-y-3 animate-pop-in">
            <label className="text-sm font-bold text-foreground">Who are you?</label>
            {[
              { value: 'student' as const, emoji: '🧒', label: 'Student', desc: 'I want to play and learn!' },
              { value: 'parent' as const, emoji: '👨‍👩‍👧', label: 'Parent', desc: 'I want to track my child\'s progress' },
              { value: 'teacher' as const, emoji: '👩‍🏫', label: 'Teacher', desc: 'I want to manage my class' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setRole(opt.value); setStep(2); }}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${role === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <div className="font-bold text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: School */}
        {step === 2 && (
          <div className="space-y-3 animate-pop-in">
            <label className="text-sm font-bold text-foreground">Choose your school</label>
            <select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-border bg-white text-foreground font-bold"
            >
              <option value="">Select a school...</option>
              <option value="placeholder">SD MOVEVERSE Academy</option>
            </select>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(1)} className="px-6 py-2 rounded-full font-bold border-2 border-border">Back</button>
              <button onClick={() => setStep(3)} disabled={!schoolId} className="flex-1 px-6 py-2 rounded-full font-bold gradient-sky text-white border-0 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Class (if student) or Finish */}
        {step === 3 && (
          <div className="space-y-3 animate-pop-in">
            {role === 'student' && (
              <>
                <label className="text-sm font-bold text-foreground">Choose your class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-border bg-white text-foreground font-bold"
                >
                  <option value="">Select a class...</option>
                  <option value="placeholder">1A</option>
                  <option value="placeholder2">1B</option>
                </select>
              </>
            )}
            {role === 'parent' && (
              <p className="text-sm text-muted-foreground">You'll be able to link your children after setup.</p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(2)} className="px-6 py-2 rounded-full font-bold border-2 border-border">Back</button>
              <button onClick={handleSubmit} disabled={submitting || (role === 'student' && !classId)} className="flex-1 px-6 py-2 rounded-full font-bold gradient-grass text-white border-0 disabled:opacity-50">
                {submitting ? 'Setting up...' : 'Start Adventure! 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
