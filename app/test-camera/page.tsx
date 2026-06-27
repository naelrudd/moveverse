"use client";

import { useMediaPipePose } from '@/hooks/useMediaPipePose';
import { useJumpDetector } from '@/hooks/useJumpDetector';

export default function TestCameraPage() {
  const { startCamera, stopCamera, pose, isReady, error, videoRef, canvasRef } = useMediaPipePose();
  const { jumpCount, isValidJump, fmsScore } = useJumpDetector(pose);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">MediaPipe Pose Test</h1>

        {/* Controls */}
        <div className="mb-4 space-x-4">
          <button
            onClick={startCamera}
            disabled={isReady}
            className="px-6 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-600"
          >
            Start Camera
          </button>
          <button
            onClick={stopCamera}
            disabled={!isReady}
            className="px-6 py-2 bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-600"
          >
            Stop Camera
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Jump counter */}
        <div className="mb-4 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Jump Count: {jumpCount}</h2>
          {isValidJump && (
            <div className="text-green-400 font-semibold animate-pulse">
              ✓ Valid Jump!
            </div>
          )}
          <div className="mt-4 text-sm">
            <p>Squat Depth: {fmsScore.squatDepth}/100</p>
            <p>Landing Balance: {fmsScore.landingBalance}/100</p>
          </div>
        </div>

        {/* Camera view */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full"
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }} // Mirror for user-facing camera
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Start Camera" and allow camera access</li>
            <li>Step back so your full body is visible</li>
            <li>Perform a squat jump (squat down, then jump up)</li>
            <li>Watch the counter increment on valid jumps</li>
            <li>Check console for FMS scores</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
