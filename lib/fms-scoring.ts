// ponytail: simplified thresholds, tune with real data
interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export function calculateSquatDepth(landmarks: PoseLandmark[]): number {
  if (landmarks.length < 33) return 0;

  const hip = landmarks[23]; // left hip
  const knee = landmarks[25]; // left knee
  const ankle = landmarks[27]; // left ankle

  if (!hip || !knee || !ankle) return 0;

  // Squat depth = how far hip drops below knee
  const hipKneeDiff = hip.y - knee.y;
  
  // Full squat: hip below knee by ~0.2+ (normalized coords)
  // Score 0-100
  const score = Math.min(100, Math.max(0, hipKneeDiff * 500));
  
  return Math.round(score);
}

export function calculateLandingBalance(landmarks: PoseLandmark[]): number {
  if (landmarks.length < 33) return 0;

  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  if (!leftAnkle || !rightAnkle || !leftShoulder || !rightShoulder) return 0;

  // Body width (shoulder span)
  const bodyWidth = Math.abs(leftShoulder.x - rightShoulder.x);

  // Ankle deviation (horizontal distance between ankles)
  const ankleDeviation = Math.abs(leftAnkle.x - rightAnkle.x);

  // Balance score: deviation should be < 10% body width for good landing
  const deviationRatio = ankleDeviation / bodyWidth;
  const score = Math.max(0, 100 - deviationRatio * 1000);

  return Math.round(score);
}

export function mapToPhysicalLiteracy(fmsScore: {
  squatDepth: number;
  landingBalance: number;
}) {
  // ponytail: hardcoded mapping, add adaptive weights later
  return {
    balance: Math.round(fmsScore.landingBalance * 0.05), // 0-5 points per jump
    coordination: Math.round((fmsScore.squatDepth + fmsScore.landingBalance) * 0.025), // 0-5 points
    agility: Math.round(fmsScore.squatDepth * 0.03), // 0-3 points
    flexibility: Math.round(fmsScore.squatDepth * 0.02), // 0-2 points
    strength: Math.round(fmsScore.squatDepth * 0.04), // 0-4 points
  };
}
