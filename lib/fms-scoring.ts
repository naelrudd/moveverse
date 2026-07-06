// ponytail: simplified thresholds, tune with real data
interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// ── Angle Calculation (pure, portable to Flutter) ──

/** Calculate angle between 3 points in degrees */
export function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let degrees = Math.abs((radians * 180) / Math.PI);
  if (degrees > 180) degrees = 360 - degrees;
  return degrees;
}

// ── Movement Detection (4 gerakan dari games.md) ──

export type MovementType = 'menekuk' | 'meliuk' | 'memutar' | 'keseimbangan';

/** Menekuk: squat depth + elbow bend */
export function detectMenekuk(landmarks: PoseLandmark[]): { kneeAngle: number; elbowAngle: number; depth: number } {
  if (landmarks.length < 33) return { kneeAngle: 180, elbowAngle: 180, depth: 0 };

  // Left side
  const hip = landmarks[23];   // left hip
  const knee = landmarks[25];  // left knee
  const ankle = landmarks[27]; // left ankle
  const shoulder = landmarks[11]; // left shoulder
  const elbow = landmarks[13]; // left elbow
  const wrist = landmarks[15]; // left wrist

  if (!hip || !knee || !ankle || !shoulder || !elbow || !wrist) return { kneeAngle: 180, elbowAngle: 180, depth: 0 };

  const kneeAngle = calculateAngle(hip, knee, ankle);
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);

  // Squat depth: hip below knee
  const hipKneeDiff = hip.y - knee.y;
  const depth = Math.min(100, Math.max(0, hipKneeDiff * 500));

  return { kneeAngle, elbowAngle, depth };
}

/** Meliuk: lateral body flexion */
export function detectMeliuk(landmarks: PoseLandmark[]): { lateralAngle: number; leanPercent: number } {
  if (landmarks.length < 33) return { lateralAngle: 0, leanPercent: 0 };

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return { lateralAngle: 0, leanPercent: 0 };

  // Midpoints
  const midShoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
  const midHip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };

  // Vertical reference (perpendicular to hip-shoulder line)
  const dx = midShoulder.x - midHip.x;
  const dy = midShoulder.y - midHip.y;
  const lateralAngle = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));

  // Lean as percentage (0 = straight, 100 = fully sideways)
  const leanPercent = Math.min(100, lateralAngle * 2.5);

  return { lateralAngle, leanPercent };
}

/** Memutar: torso rotation */
export function detectMemutar(landmarks: PoseLandmark[]): { rotationAngle: number; shoulderWidth: number } {
  if (landmarks.length < 33) return { rotationAngle: 0, shoulderWidth: 0 };

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return { rotationAngle: 0, shoulderWidth: 0 };

  // Rotation = perspective distortion of shoulder/hip line
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

  // z-depth difference suggests rotation
  const shoulderZ = Math.abs(leftShoulder.z - rightShoulder.z);
  const rotationAngle = Math.min(90, shoulderZ * 300);

  return { rotationAngle, shoulderWidth };
}

/** Keseimbangan: single-leg stability */
export function detectKeseimbangan(landmarks: PoseLandmark[]): { swayAmount: number; isSingleLeg: number; stability: number } {
  if (landmarks.length < 33) return { swayAmount: 0, isSingleLeg: 0, stability: 100 };

  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const nose = landmarks[0];

  if (!leftAnkle || !rightAnkle || !leftHip || !rightHip || !nose) return { swayAmount: 0, isSingleLeg: 0, stability: 100 };

  // Center of gravity (nose as proxy)
  const midHip = { x: (leftHip.x + rightHip.x) / 2 };
  const noseOffset = Math.abs(nose.x - midHip.x);

  // Sway from center
  const swayAmount = noseOffset * 100; // percentage

  // Single-leg detection: one ankle significantly higher than the other
  const ankleHeightDiff = Math.abs(leftAnkle.y - rightAnkle.y);
  const isSingleLeg = ankleHeightDiff > 0.05 ? Math.min(100, ankleHeightDiff * 500) : 0;

  // Stability: inverse of sway
  const stability = Math.max(0, Math.min(100, 100 - swayAmount * 5));

  return { swayAmount, isSingleLeg, stability };
}

// ── Level Thresholds (per games.md) ──

export interface LevelThreshold {
  level: number;
  requirement: string;
  minScore: number;
  holdSeconds?: number;
}

/** Level thresholds per movement (1-5) */
export const MOVEMENT_LEVELS: Record<MovementType, LevelThreshold[]> = {
  menekuk: [
    { level: 1, requirement: 'Menekuk lutut 90°', minScore: 60, holdSeconds: 3 },
    { level: 2, requirement: 'Menekuk lutut 120° + siku 90°', minScore: 70, holdSeconds: 5 },
    { level: 3, requirement: 'Squat penuh 3x repetisi', minScore: 80, holdSeconds: 5 },
    { level: 4, requirement: 'Squat cepat 5x repetisi', minScore: 85, holdSeconds: 3 },
    { level: 5, requirement: 'Squat jump 5x repetisi', minScore: 90, holdSeconds: 2 },
  ],
  meliuk: [
    { level: 1, requirement: 'Meliuk 15° kiri-kanan', minScore: 60, holdSeconds: 3 },
    { level: 2, requirement: 'Meliuk 30° kiri-kanan', minScore: 70, holdSeconds: 3 },
    { level: 3, requirement: 'Meliuk 45° dengan tangan terbuka', minScore: 80, holdSeconds: 4 },
    { level: 4, requirement: 'Meliuk cepat bergantian 5x', minScore: 85, holdSeconds: 3 },
    { level: 5, requirement: 'Meliuk ritmis mengikuti irama', minScore: 90, holdSeconds: 5 },
  ],
  memutar: [
    { level: 1, requirement: 'Memutar kepala pelan', minScore: 60, holdSeconds: 3 },
    { level: 2, requirement: 'Memutar lengan 180°', minScore: 70, holdSeconds: 4 },
    { level: 3, requirement: 'Memutar pinggang 90°', minScore: 80, holdSeconds: 4 },
    { level: 4, requirement: 'Memutar kombinasi 3x', minScore: 85, holdSeconds: 3 },
    { level: 5, requirement: 'Memutar cepat 5x tanpa langkah', minScore: 90, holdSeconds: 2 },
  ],
  keseimbangan: [
    { level: 1, requirement: 'Berdiri 5 detik', minScore: 60, holdSeconds: 5 },
    { level: 2, requirement: 'Berdiri 10 detik', minScore: 70, holdSeconds: 10 },
    { level: 3, requirement: 'Berdiri satu kaki 5 detik', minScore: 80, holdSeconds: 5 },
    { level: 4, requirement: 'Berdiri satu kaki 10 detik', minScore: 85, holdSeconds: 10 },
    { level: 5, requirement: 'Berdiri satu kaki tangan terbuka 10 detik', minScore: 90, holdSeconds: 10 },
  ],
};

// ── Rep Counter (detect state transitions) ──

export function countReps(movementHistory: number[], threshold: number, minGap: number = 10): number {
  let reps = 0;
  let aboveThreshold = false;
  let lastRepFrame = -minGap;

  for (let i = 0; i < movementHistory.length; i++) {
    const value = movementHistory[i];
    if (value >= threshold && !aboveThreshold && (i - lastRepFrame) >= minGap) {
      reps++;
      lastRepFrame = i;
    }
    aboveThreshold = value >= threshold;
  }

  return reps;
}

// ── Legacy functions ──

export function calculateSquatDepth(landmarks: PoseLandmark[]): number {
  const { depth } = detectMenekuk(landmarks);
  return depth;
}

export function calculateLandingBalance(landmarks: PoseLandmark[]): number {
  const { stability } = detectKeseimbangan(landmarks);
  return stability;
}

export function mapToPhysicalLiteracy(fmsScore: {
  squatDepth: number;
  landingBalance: number;
}) {
  return {
    balance: Math.round(fmsScore.landingBalance * 0.05),
    coordination: Math.round((fmsScore.squatDepth + fmsScore.landingBalance) * 0.025),
    agility: Math.round(fmsScore.squatDepth * 0.03),
    flexibility: Math.round(fmsScore.squatDepth * 0.02),
    strength: Math.round(fmsScore.squatDepth * 0.04),
  };
}

// ── Movement → Physical Literacy mapping (for live coach) ──
export function movementToPhysicalLiteracy(movement: MovementType, score: number) {
  const delta = Math.round(score * 0.03); // 0-3 points per rep
  const mapping: Record<MovementType, { balance: number; coordination: number; agility: number; flexibility: number; strength: number }> = {
    menekuk:     { balance: 0, coordination: delta, agility: delta, flexibility: 0, strength: delta },
    meliuk:      { balance: 0, coordination: delta, agility: 0, flexibility: delta, strength: 0 },
    memutar:     { balance: delta, coordination: delta, agility: delta, flexibility: 0, strength: 0 },
    keseimbangan: { balance: delta, coordination: delta, agility: 0, flexibility: 0, strength: delta },
  };
  return mapping[movement];
}

/** Feedback messages per movement based on score */
export function getMovementFeedback(movement: MovementType, score: number): string {
  if (score >= 85) return '🌟 Luar biasa! Gerakan sempurna!';
  if (score >= 70) return '💪 Bagus! Tingkatkan sedikit lagi!';
  if (score >= 50) return '👍 Cukup! Coba lebih dalam/lambat.';
  return '🔥 Semangat! Ikuti instruksi MOVA ya!';
}
