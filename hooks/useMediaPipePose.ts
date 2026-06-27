'use client';

import { useEffect, useRef, useState } from 'react';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
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

let poseModule: any = null;
let pose: any = null;

async function loadMediaPipe() {
  if (poseModule) return poseModule;

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
  document.body.appendChild(script);

  return new Promise((resolve) => {
    script.onload = () => {
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pose, setPose] = useState<PoseLandmark[] | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsReady(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsReady(false);
  };

  useEffect(() => {
    let camera: any = null;
    let poseInstance: any = null;

    async function initPose() {
      try {
        setIsLoading(true);

        // Load MediaPipe Pose
        const Pose = await loadMediaPipe();
        if (!Pose) throw new Error('Failed to load MediaPipe');

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Initialize Pose
        poseInstance = new Pose({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        poseInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        poseInstance.onResults((results: any) => {
          if (results.poseLandmarks) {
            setPose(results.poseLandmarks);
            onPoseDetected?.(results.poseLandmarks);

            // Draw skeleton
            if (canvasRef.current) {
              drawSkeleton(canvasRef.current, results);
            }
          }
        });

        // Setup camera stream
        const video = videoRef.current;
        if (video) {
          video.onloadedmetadata = () => {
            const canvas = canvasRef.current;
            if (canvas) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }
            setIsReady(true);
            setIsLoading(false);
          };
        }

        // Pose detection loop
        const processFrame = async () => {
          if (videoRef.current && poseInstance) {
            await poseInstance.send({ image: videoRef.current });
            requestAnimationFrame(processFrame);
          }
        };

        processFrame();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to initialize pose';
        setError(message);
        setIsLoading(false);
      }
    }

    initPose();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [onPoseDetected]);

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
};

function drawSkeleton(canvas: HTMLCanvasElement, results: any) {
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
      const p1 = results.poseLandmarks[start];
      const p2 = results.poseLandmarks[end];
      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.stroke();
    });
  }
}
