'use client';

import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import { useMediaPipePose } from './useMediaPipePose';
import {
  type MovementType,
  detectMenekuk,
  detectMeliuk,
  detectMemutar,
  detectKeseimbangan,
  MOVEMENT_LEVELS,
  getMovementFeedback,
} from '@/lib/fms-scoring';

// TODO Flutter: ganti semua navigator.mediaDevices dengan CameraController + MediaPipe plugin
// TODO Flutter: hook ini bisa di-copy langsung, tinggal ganti pose source

export interface CoachState {
  isRecording: boolean;
  isPaused: boolean;
  currentScore: number;
  reps: number;
  holdTime: number;      // detik hold saat ini
  feedback: string;
  isFullScreen: boolean;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  movementData: { kneeAngle: number; elbowAngle: number; depth: number } | null;
}

export interface CoachActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggleFullScreen: () => void;
}

export interface SessionResult {
  activity: MovementType;
  level: number;
  reps: number;
  avgScore: number;
  holdTime: number;
  duration: number;
  scoreHistory: number[];
  newBadges?: string[];
}

export interface UseLiveCoachEngineOptions {
  activity: MovementType;
  level: number; // 1-5
  userId: string;
  role: 'student' | 'teacher' | 'parent';
  thresholds?: Record<string, number>; // custom thresholds from Convex
  onComplete?: (result: SessionResult) => void;
  containerRef?: RefObject<HTMLElement | null>; // element to fullscreen via Fullscreen API
}

/**
 * useLiveCoachEngine — continuous real-time pose detection + scoring.
 * Pure hook logic, portable ke Flutter (ganti MediaPipe source).
 */
export function useLiveCoachEngine(options: UseLiveCoachEngineOptions) {
  const { activity, level, onComplete, containerRef } = options;

  const [state, setState] = useState<CoachState>({
    isRecording: false,
    isPaused: false,
    currentScore: 0,
    reps: 0,
    holdTime: 0,
    feedback: 'Tekan Mulai untuk memulai rekaman! 🎬',
    isFullScreen: false,
    isReady: false,
    isLoading: true,
    error: null,
    movementData: null,
  });

  const scoreHistoryRef = useRef<number[]>([]);
  const holdStartRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);
  const holdTimeRef = useRef<number>(0);
  const repsRef = useRef<number>(0);
  const bestHoldRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);

  // MediaPipe pose hook
  const { videoRef, canvasRef, isReady, isLoading, error, startCamera, stopCamera, pose } =
    useMediaPipePose();

  // isReady, isLoading, error are derived directly from useMediaPipePose — no useEffect sync needed

  // ── Frame Processing (continuous, setiap frame) ──
  // TODO Flutter: ganti dengan onResults callback dari MediaPipe Flutter plugin
  useEffect(() => {
    if (!pose || !isRecordingRef.current || isPausedRef.current) return;

    frameCountRef.current++;

    let score = 0;
    let feedback = '';
    let movementData: CoachState['movementData'] = null;

    const levelConfig = MOVEMENT_LEVELS[activity]?.[level - 1];
    const holdTarget = levelConfig?.holdSeconds ?? 3;

    if (activity === 'menekuk') {
      const data = detectMenekuk(pose);
      movementData = data;
      // Score berdasarkan kedalaman squat
      score = data.depth;
      // Bonus untuk elbow angle yang benar
      if (data.elbowAngle < 120) score = Math.min(100, score + 10);

      if (data.depth >= (levelConfig?.minScore ?? 60)) {
        if (holdStartRef.current === 0) holdStartRef.current = Date.now();
        const held = (Date.now() - holdStartRef.current) / 1000;
        holdTimeRef.current = held;

        if (held >= holdTarget) {
          repsRef.current++;
          holdStartRef.current = 0; // reset hold
          feedback = `✅ Rep ${repsRef.current}! ${getMovementFeedback(activity, score)}`;
        } else {
          feedback = `💪 Tahan! ${held.toFixed(1)}s / ${holdTarget}s`;
        }
      } else {
        holdStartRef.current = 0;
        holdTimeRef.current = 0;
        feedback = '🦵 Tekuk lutut lebih dalam!';
      }
    } else if (activity === 'meliuk') {
      const data = detectMeliuk(pose);
      score = data.leanPercent;

      if (data.leanPercent >= (levelConfig?.minScore ?? 60)) {
        if (holdStartRef.current === 0) holdStartRef.current = Date.now();
        const held = (Date.now() - holdStartRef.current) / 1000;
        holdTimeRef.current = held;

        if (held >= holdTarget) {
          repsRef.current++;
          holdStartRef.current = 0;
          feedback = `✅ Rep ${repsRef.current}! ${getMovementFeedback(activity, score)}`;
        } else {
          feedback = `🌊 Tahan! ${held.toFixed(1)}s / ${holdTarget}s`;
        }
      } else {
        holdStartRef.current = 0;
        holdTimeRef.current = 0;
        feedback = '🐍 Meliuk lebih ke samping!';
      }
    } else if (activity === 'memutar') {
      const data = detectMemutar(pose);
      score = data.rotationAngle / 0.9; // normalize to 0-100

      if (score >= (levelConfig?.minScore ?? 60)) {
        if (holdStartRef.current === 0) holdStartRef.current = Date.now();
        const held = (Date.now() - holdStartRef.current) / 1000;
        holdTimeRef.current = held;

        if (held >= holdTarget) {
          repsRef.current++;
          holdStartRef.current = 0;
          feedback = `✅ Rep ${repsRef.current}! ${getMovementFeedback(activity, score)}`;
        } else {
          feedback = `🌀 Tahan! ${held.toFixed(1)}s / ${holdTarget}s`;
        }
      } else {
        holdStartRef.current = 0;
        holdTimeRef.current = 0;
        feedback = '🔄 Putar tubuh lebih jauh!';
      }
    } else if (activity === 'keseimbangan') {
      const data = detectKeseimbangan(pose);
      score = data.stability;

      if (data.stability >= (levelConfig?.minScore ?? 60)) {
        if (holdStartRef.current === 0) holdStartRef.current = Date.now();
        const held = (Date.now() - holdStartRef.current) / 1000;
        holdTimeRef.current = held;
        bestHoldRef.current = Math.max(bestHoldRef.current, held);

        if (held >= holdTarget) {
          repsRef.current++;
          holdStartRef.current = 0;
          feedback = `✅ Rep ${repsRef.current}! ${getMovementFeedback(activity, score)}`;
        } else {
          feedback = `🧍 Tahan! ${held.toFixed(1)}s / ${holdTarget}s`;
        }
      } else {
        holdStartRef.current = 0;
        holdTimeRef.current = 0;
        feedback = '⚖️ Jaga keseimbangan!';
      }
    }

    scoreHistoryRef.current.push(score);

    // Track best hold for keseimbangan
    if (activity === 'keseimbangan') {
      bestHoldRef.current = Math.max(bestHoldRef.current, holdTimeRef.current);
    }

    setState((s) => ({
      ...s,
      currentScore: Math.round(score),
      reps: repsRef.current,
      holdTime: holdTimeRef.current,
      feedback,
      movementData,
    }));
  }, [pose, activity, level]);

  // ── Actions ──

  const start = useCallback(async () => {
    await startCamera();
    scoreHistoryRef.current = [];
    holdStartRef.current = 0;
    holdTimeRef.current = 0;
    repsRef.current = 0;
    bestHoldRef.current = 0;
    frameCountRef.current = 0;
    sessionStartRef.current = Date.now();
    isRecordingRef.current = true;
    isPausedRef.current = false;

    setState((s) => ({
      ...s,
      isRecording: true,
      isPaused: false,
      currentScore: 0,
      reps: 0,
      holdTime: 0,
      feedback: '🎥 Rekaman dimulai! Ikuti gerakan MOVA! 💪',
    }));
  }, [startCamera]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    setState((s) => ({ ...s, isPaused: true, feedback: '⏸️ Rekaman dijeda.' }));
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    holdStartRef.current = 0; // reset hold setelah resume
    setState((s) => ({ ...s, isPaused: false, feedback: '▶️ Lanjutkan gerakan!' }));
  }, []);

  const stop = useCallback(() => {
    isRecordingRef.current = false;
    isPausedRef.current = false;
    stopCamera();

    const duration = (Date.now() - sessionStartRef.current) / 1000;
    const history = scoreHistoryRef.current;
    const avgScore = history.length > 0
      ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
      : 0;

    const result: SessionResult = {
      activity,
      level,
      reps: repsRef.current,
      avgScore,
      holdTime: bestHoldRef.current,
      duration,
      scoreHistory: history,
    };

    setState((s) => ({
      ...s,
      isRecording: false,
      isPaused: false,
      feedback: `🎉 Sesi selesai! ${repsRef.current} rep, skor rata-rata ${avgScore}!`,
    }));

    onComplete?.(result);
  }, [stopCamera, activity, level, onComplete]);

  // ── Fullscreen via browser Fullscreen API (no CSS hacks) ──
  const isFullScreenRef = useRef(false);

  useEffect(() => {
    const sync = () => {
      const fs = !!document.fullscreenElement;
      isFullScreenRef.current = fs;
      setState((s) => s.isFullScreen !== fs ? { ...s, isFullScreen: fs } : s);
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFullScreen = useCallback(async () => {
    const next = !isFullScreenRef.current;
    isFullScreenRef.current = next;
    try {
      if (next && containerRef?.current) {
        await containerRef.current.requestFullscreen();
      } else if (!next && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch { /* browser may reject fullscreen — state already toggled */ }
    setState((s) => ({ ...s, isFullScreen: next }));
  }, [containerRef]);

  // ── Keyboard shortcuts: SPACE=start/stop ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (state.isRecording) {
          stop();
        } else if (isReady) {
          start();
        }
      }
      // ESC handled natively by browser Fullscreen API
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.isRecording, isReady, start, stop]);

  return {
    ...state,
    isReady,
    isLoading,
    error,
    videoRef,
    canvasRef,
    start,
    pause,
    resume,
    stop,
    toggleFullScreen,
    levelConfig: MOVEMENT_LEVELS[activity]?.[level - 1],
  };
}
