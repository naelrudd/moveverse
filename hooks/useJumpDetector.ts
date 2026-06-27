"use client";

import { useEffect, useRef, useState } from 'react';
import { PoseLandmark } from './useMediaPipePose';
import { calculateSquatDepth, calculateLandingBalance, mapToPhysicalLiteracy } from '@/lib/fms-scoring';

interface JumpState {
  phase: 'idle' | 'squatting' | 'airborne' | 'landing';
  startY: number;
  lowestY: number;
  highestY: number;
  lastJumpTime: number;
}

export interface FMSScore {
  squatDepth: number;
  landingBalance: number;
}

export function useJumpDetector(landmarks: PoseLandmark[] | null) {
  const [jumpCount, setJumpCount] = useState(0);
  const [isValidJump, setIsValidJump] = useState(false);
  const [fmsScore, setFmsScore] = useState<FMSScore>({ squatDepth: 0, landingBalance: 0 });
  const [physicalLiteracy, setPhysicalLiteracy] = useState({
    balance: 0,
    coordination: 0,
    agility: 0,
    flexibility: 0,
    strength: 0,
  });

  const stateRef = useRef<JumpState>({
    phase: 'idle',
    startY: 0,
    lowestY: 0,
    highestY: 0,
    lastJumpTime: 0,
  });

  useEffect(() => {
    if (!landmarks || landmarks.length < 33) return;

    const state = stateRef.current;
    const now = Date.now();

    // Debounce: min 500ms between jumps
    if (now - state.lastJumpTime < 500) return;

    // Use left hip (landmark 23)
    const hip = landmarks[23];
    const knee = landmarks[25];
    const ankle = landmarks[27];

    if (!hip || !knee || !ankle) return;

    const hipY = hip.y;

    // State machine for jump detection
    switch (state.phase) {
      case 'idle':
        // Initialize baseline
        state.startY = hipY;
        state.lowestY = hipY;
        state.phase = 'squatting';
        break;

      case 'squatting':
        // Track lowest point (squat depth)
        if (hipY > state.lowestY) {
          state.lowestY = hipY;
        }

        // Check if squatting (hip below knee)
        const isSquatting = hip.y > knee.y;

        // Transition to airborne if hip moves up significantly
        if (hipY < state.lowestY - 0.05 && isSquatting) {
          state.phase = 'airborne';
          state.highestY = hipY;
        }
        break;

      case 'airborne':
        // Track highest point (jump height)
        if (hipY < state.highestY) {
          state.highestY = hipY;
        }

        // Transition to landing if hip moves down
        if (hipY > state.highestY + 0.03) {
          state.phase = 'landing';
        }
        break;

      case 'landing':
        // Check if stabilized (hip Y stable for a few frames)
        const isStable = Math.abs(hipY - state.highestY) < 0.02;

        if (isStable) {
          // Validate jump
          const squatDepth = calculateSquatDepth(landmarks);
          const landingBalance = calculateLandingBalance(landmarks);

          const valid = squatDepth > 30 && landingBalance > 50; // ponytail: thresholds tunable

          if (valid) {
            setJumpCount((prev) => prev + 1);
            setIsValidJump(true);
            
            const score = { squatDepth, landingBalance };
            setFmsScore(score);

            const literacy = mapToPhysicalLiteracy(score);
            setPhysicalLiteracy((prev) => ({
              balance: prev.balance + literacy.balance,
              coordination: prev.coordination + literacy.coordination,
              agility: prev.agility + literacy.agility,
              flexibility: prev.flexibility + literacy.flexibility,
              strength: prev.strength + literacy.strength,
            }));

            console.log('Valid jump detected:', { squatDepth, landingBalance, literacy });
          }

          state.lastJumpTime = now;
          state.phase = 'idle';
          
          setTimeout(() => setIsValidJump(false), 1000);
        }
        break;
    }
  }, [landmarks]);

  return {
    jumpCount,
    isValidJump,
    fmsScore,
    physicalLiteracy,
  };
}
