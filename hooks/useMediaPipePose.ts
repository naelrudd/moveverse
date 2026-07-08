'use client';

import { useEffect, useRef, useState } from 'react';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface MediaPipeResults {
  poseLandmarks?: PoseLandmark[];
}

interface UseMediaPipePoseReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  pose: PoseLandmark[] | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- MediaPipe CDN script exposes globals
let poseModule: any = null;

async function loadMediaPipe() {
  if (poseModule) return poseModule;

  // Skip if script already in DOM
  const existing = document.querySelector('script[src*="@mediapipe/pose/pose.js"]');
  if (existing) {
    return new Promise<any>((resolve) => {
      const check = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic CDN global
        if ((window as any).Pose) resolve((window as any).Pose);
        else setTimeout(check, 50);
      };
      check();
    });
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
  document.body.appendChild(script);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- resolve with any MediaPipe pose constructor
  return new Promise<any>((resolve) => {
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic CDN global
      poseModule = (window as any).Pose;
      resolve(poseModule);
    };
  });
}

export function useMediaPipePose(
  onPoseDetected?: (landmarks: PoseLandmark[]) => void
): UseMediaPipePoseReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pose, setPose] = useState<PoseLandmark[] | null>(null);

  // Refs for cleanup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MediaPipe Pose instance
  const poseInstanceRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const stoppingRef = useRef(false);

  const stopCamera = () => {
    stoppingRef.current = true;

    // Cancel animation frame loop
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    // Close MediaPipe
    if (poseInstanceRef.current) {
      try { poseInstanceRef.current.close(); } catch { /* ignore */ }
      poseInstanceRef.current = null;
    }

    // Stop camera tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsReady(false);
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      stoppingRef.current = false;

      // Load MediaPipe
      const Pose = await loadMediaPipe();
      if (!Pose) throw new Error('Failed to load MediaPipe');

      // Request camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Pose
      const poseInstance = new Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      poseInstanceRef.current = poseInstance;

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseInstance.onResults((results: MediaPipeResults) => {
        if (results.poseLandmarks) {
          setPose(results.poseLandmarks);
          onPoseDetected?.(results.poseLandmarks);

          // Draw skeleton
          if (canvasRef.current) {
            drawSkeleton(canvasRef.current, results);
          }
        }
      });

      // Wait for video metadata before starting detection loop
      const video = videoRef.current;
      if (video) {
        const onReady = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
          setIsReady(true);
          setIsLoading(false);

          // Start pose detection loop
          const processFrame = async () => {
            if (stoppingRef.current) return;
            if (videoRef.current && poseInstanceRef.current && !videoRef.current.paused) {
              try {
                await poseInstanceRef.current.send({ image: videoRef.current });
              } catch { /* ignore frame errors */ }
              rafRef.current = requestAnimationFrame(processFrame);
            }
          };
          rafRef.current = requestAnimationFrame(processFrame);
        };

        // If metadata already loaded, proceed immediately
        if (video.readyState >= 1) {
          onReady();
        } else {
          video.addEventListener('loadedmetadata', onReady, { once: true });
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize pose';
      setError(message);
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stoppingRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (poseInstanceRef.current) {
        try { poseInstanceRef.current.close(); } catch { /* ignore */ }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    startCamera,
    stopCamera,
    isReady,
    isLoading,
    error,
    pose,
  };
}

function drawSkeleton(canvas: HTMLCanvasElement, results: MediaPipeResults) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    // Draw landmarks
    results.poseLandmarks.forEach((landmark: PoseLandmark) => {
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvas.width,
        landmark.y * canvas.height,
        3,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Draw connections (skeleton lines)
    const connections = [
      [11, 12], // shoulders
      [11, 13],
      [13, 15], // left arm
      [12, 14],
      [14, 16], // right arm
      [11, 23],
      [12, 24], // shoulders to hips
      [23, 24], // hip line
      [23, 25],
      [25, 27], // left leg
      [24, 26],
      [26, 28], // right leg
    ];

    ctx.strokeStyle = '#00ff00';
    connections.forEach(([start, end]) => {
      const p1 = results.poseLandmarks![start];
      const p2 = results.poseLandmarks![end];
      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.stroke();
    });
  }
}
