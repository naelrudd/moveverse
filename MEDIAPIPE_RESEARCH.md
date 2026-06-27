# MediaPipe Pose Integration Research

## Installation

**NPM Package (Recommended):**
```bash
npm install @mediapipe/pose @mediapipe/camera_utils @mediapipe/drawing_utils
```

**CDN Alternative:**
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
```

## Browser Compatibility

| Browser | Version | WebGL2 | Status |
|---------|---------|--------|--------|
| Chrome Desktop | 90+ | ✅ | Fully supported |
| Chrome Android | 90+ | ✅ | Fully supported |
| Safari Desktop | 14.1+ | ✅ | Supported (some lag) |
| Safari iOS | 14.5+ | ✅ | Supported (requires user gesture for camera) |
| Firefox | 88+ | ✅ | Supported |
| Edge | 90+ | ✅ | Fully supported |

**Critical:** Safari iOS requires user interaction (button tap) to start camera due to autoplay policies.

## Pose Landmarks (33 points)

### Key Indices for FMS Detection

**Jump Detection:**
- **Hip:** 23 (left hip), 24 (right hip)
- **Knee:** 25 (left knee), 26 (right knee)
- **Ankle:** 27 (left ankle), 28 (right ankle)
- **Shoulder:** 11 (left shoulder), 12 (right shoulder)

### Coordinate System
- X: 0 (left) → 1 (right)
- Y: 0 (top) → 1 (bottom)
- Z: depth (negative = closer to camera)

## FMS Scoring Logic

### 1. Squat Depth Detection
```typescript
function calculateSquatDepth(landmarks: PoseLandmark[]): number {
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  
  // Squat depth = hip drops below knee
  const depth = leftKnee.y - leftHip.y;
  
  // Score 0-100
  if (depth > 0.1) return 100; // Full squat
  if (depth > 0.05) return 75;  // Partial squat
  if (depth > 0) return 50;     // Slight bend
  return 0; // No squat
}
```

### 2. Landing Balance
```typescript
function calculateLandingBalance(landmarks: PoseLandmark[]): number {
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  
  // Body width reference
  const bodyWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  
  // Ankle deviation
  const ankleDev = Math.abs(rightAnkle.x - leftAnkle.x);
  const deviation = ankleDev / bodyWidth;
  
  // Score: lower deviation = better balance
  if (deviation < 0.1) return 100; // Stable landing
  if (deviation < 0.2) return 75;
  if (deviation < 0.3) return 50;
  return 25;
}
```

### 3. Jump Counter State Machine
```typescript
enum JumpState {
  STANDING,
  SQUATTING,
  JUMPING,
  LANDING
}

// Detect jump cycle:
// 1. STANDING → hip stable
// 2. SQUATTING → hip drops
// 3. JUMPING → hip rises above threshold
// 4. LANDING → hip stabilizes (validate balance)
// → count++ → reset to STANDING
```

## Performance Benchmarks

**Device:** Mid-range laptop (i5, integrated GPU)
- FPS: 25-30 (real-time)
- Latency: 30-50ms per frame
- CPU usage: 40-60%

**Device:** iPhone 12 (Safari iOS 15)
- FPS: 20-25
- Latency: 40-70ms
- Battery impact: moderate (camera + WebGL)

**Optimization Tips:**
- Use `modelComplexity: 1` (0=lite, 1=full, 2=heavy) — balance accuracy vs speed
- Set `minDetectionConfidence: 0.5` to reduce false positives
- Throttle pose updates to 20-25 FPS (no need for 60fps)

## Integration Pattern (React Hook)

```typescript
import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

export function useMediaPipePose(onPoseDetected: (landmarks) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results: Results) => {
      if (results.poseLandmarks) {
        onPoseDetected(results.poseLandmarks);
        drawPose(results); // Draw skeleton overlay
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480
    });

    camera.start();
    setIsReady(true);

    return () => camera.stop();
  }, []);

  return { videoRef, canvasRef, isReady };
}
```

## Physical Literacy Mapping

### FMS → Physical Literacy Domains

| FMS Metric | Domain | Weight |
|------------|--------|--------|
| Landing balance | Balance | 100% |
| Squat depth | Flexibility | 60% |
| Squat depth | Strength | 40% |
| Jump height (hip trajectory) | Coordination | 70% |
| Jump consistency (variance) | Agility | 60% |

**Update logic:**
- Each valid jump contributes incremental score (0-5 points)
- Average last 10 jumps for stability
- Cap domain scores at 100

## Known Issues & Mitigations

**Issue:** Pose detection fails in low light
- **Fix:** Show warning "Butuh cahaya terang" if confidence < 0.3

**Issue:** Multiple people in frame
- **Fix:** Detect only largest bounding box (closest person)

**Issue:** Camera permission denied (iOS)
- **Fix:** Clear UI prompt: "Tap untuk aktifkan kamera"

**Issue:** Lag on older devices
- **Fix:** Reduce to `modelComplexity: 0` (lite mode)

## Recommended Settings for MVP

```typescript
{
  modelComplexity: 1,        // Balance speed/accuracy
  smoothLandmarks: true,     // Reduce jitter
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  enableSegmentation: false  // Skip background (faster)
}
```

## Next Steps

1. Test on iPhone Safari (iOS camera permission flow)
2. Validate jump counter accuracy (80%+ target)
3. Tune squat depth threshold (user testing feedback)
4. Add visual feedback (skeleton overlay + counter UI)
