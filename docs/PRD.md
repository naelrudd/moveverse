# MOVEVERSE MVP — Product Requirements Document
**Version:** 1.0 (3-Day Sprint)  
**Deadline:** Senin, 29 Juni 2026 09:00 WIB (LIDM Submission)  
**Team:** Miranda, Yohanes, Febi, Natanael

---

## Problem Statement

Physical Literacy assessment di SD Indonesia:
- Manual, subjektif, no data
- Anak pasif (teacher-centered)
- No real-time feedback
- Gap: skill tracking → actionable insight

Movement Poverty: 80% anak SD tidak memenuhi aktivitas fisik harian (WHO 2022).

---

## Solution

**MOVEVERSE:** Live AI Movement Coach berbasis MediaPipe Pose + Adaptive Gamification Learning.

Anak bergerak depan webcam → sistem detect pose real-time → FMS score otomatis → XP/badge/pet → refleksi mandiri (AaL).

---

## MVP Scope (3 Hari)

### ✅ INCLUDE
1. **Landing + Auth** (Clerk)
2. **Dashboard Siswa:**
   - Avatar MOVA + 1 World (Jumping Jungle)
   - Daily Quest + XP/Coins/Level
   - 1 Pet Companion unlock system
3. **Live AI Movement Coach:**
   - Camera permission flow
   - Real-time skeleton overlay (MediaPipe Pose)
   - 1 Quest: "Jump 10x" → auto-count valid jumps
   - FMS scoring: squat depth + landing balance
4. **AaL Reflection:**
   - Post-session radar chart (5 domain: Balance, Coordination, Agility, Flexibility, Strength)
   - Simple emoji reflection log
5. **Mobile responsive** (tablet/phone critical)

### ❌ CUT V1
- Dashboard guru/ortu/sekolah (mockup screenshot only)
- 4 World lainnya (design preview only)
- Adaptive Difficulty Engine (hardcode level up logic)
- Analytics backend (basic tracking only)
- Video recording/playback

---

## User Flow (Demo LIDM)

```
1. Landing → [Mulai Petualangan]
2. Login (Clerk) → Profile siswa (nama, kelas, avatar)
3. Dashboard → Daily Quest card: "Jumping Jungle - Jump 10x"
4. [Start Quest] → Camera permission
5. Camera active → skeleton overlay muncul
6. Anak jump → counter increment (1/10, 2/10...)
7. Valid jump = squat depth > threshold + stable landing
8. Quest complete (10/10) → +50 XP, +10 coins, Level up animation
9. Pet unlock: "Forest Frog"
10. AaL Reflection screen:
    - Radar chart update (Balance +5, Coordination +3)
    - Emoji: "Gimana rasanya?" → pilih 😃/😊/😐
    - Save → back to dashboard
```

---

## Technical Architecture

### Stack
- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Convex (real-time DB + serverless functions)
- **Auth:** Clerk (email/social login)
- **CV:** MediaPipe Pose (browser SDK, client-side)
- **Deploy:** Vercel (frontend) + Convex Cloud

### Convex Schema
```typescript
// users
{
  _id: Id<"users">,
  clerkId: string,
  name: string,
  grade: "1" | "2",
  avatar: string,
  xp: number,
  coins: number,
  level: number,
  pets: string[], // ["forest_frog"]
}

// quests
{
  _id: Id<"quests">,
  userId: Id<"users">,
  type: "jumping" | "running" | "balance",
  target: number, // 10 jumps
  completed: number, // 7/10
  status: "active" | "completed",
  timestamp: number,
}

// movements
{
  _id: Id<"movements">,
  userId: Id<"users">,
  questId: Id<"quests">,
  landmarks: object, // MediaPipe pose data
  fmsScore: {
    squatDepth: number,
    landingBalance: number,
  },
  timestamp: number,
}

// physical_literacy
{
  _id: Id<"physical_literacy">,
  userId: Id<"users">,
  balance: number, // 0-100
  coordination: number,
  agility: number,
  flexibility: number,
  strength: number,
  updatedAt: number,
}
```

### MediaPipe Integration (Client-Side)

**Hook:** `useMediaPipePose()`
```typescript
const { startCamera, stopCamera, pose, isReady } = useMediaPipePose({
  onPoseDetected: (landmarks) => {
    // Analyze jump: check squat depth, landing stability
    const isValidJump = detectJump(landmarks);
    if (isValidJump) incrementCounter();
  }
});
```

**FMS Detection Logic:**
- **Jump Counter:** Track hip Y-coordinate trajectory (down → up → stabilize)
- **Squat Depth:** Hip below knee threshold (landmarks[23].y > landmarks[25].y)
- **Landing Balance:** Ankle deviation < 10% body width after landing

---

## File Structure

```
moveverse/
├── convex/
│   ├── schema.ts
│   ├── users.ts
│   ├── quests.ts
│   ├── movements.ts
│   └── physical_literacy.ts
├── src/
│   ├── app/
│   │   ├── page.tsx (landing)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── quest/
│   │       └── [id]/page.tsx (live camera)
│   ├── components/
│   │   ├── Avatar.tsx
│   │   ├── WorldCard.tsx
│   │   ├── QuestOverlay.tsx
│   │   ├── RadarChart.tsx
│   │   └── PetUnlock.tsx
│   ├── hooks/
│   │   ├── useMediaPipePose.ts
│   │   └── useJumpDetector.ts
│   └── lib/
│       └── fms-scoring.ts
├── public/
│   └── assets/ (avatar, pets, world images)
└── package.json
```

---

## 3-Day Sprint Breakdown

### Jumat (Hari ini, 4 jam)
- [ ] PRD finalized
- [ ] Spawn 4 sub-agents paralel:
  1. Kiro → Convex schema setup
  2. OpenCode → Next.js scaffold + Clerk auth
  3. OpenCode #2 → MediaPipe pose hook + jump detector
  4. Kiro #2 → UI components (Avatar, WorldCard, RadarChart)
- [ ] Repo init: `D:\money\moveverse`

### Sabtu (8 jam)
- [ ] Integration: frontend ↔ Convex
- [ ] Live camera testing (MediaPipe pose overlay)
- [ ] Jump counter logic validation
- [ ] XP/Level system wiring

### Minggu (6 jam)
- [ ] UI polish (animations, transitions)
- [ ] Mobile responsive testing (tablet/phone)
- [ ] Radar chart post-quest flow
- [ ] Pet unlock animation
- [ ] Deploy to Vercel

### Senin Pagi (2 jam)
- [ ] Final QA
- [ ] Demo video recording
- [ ] LIDM submission prep

---

## Success Metrics (Demo)

1. **Functional:** Camera → pose detect → jump count → XP update (end-to-end works)
2. **Performance:** <100ms pose detection latency
3. **UX:** Mobile-friendly (iPad/phone viewport)
4. **Visual:** Smooth animations, clear feedback
5. **Data:** Radar chart reflects FMS score accurately

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| MediaPipe browser compatibility | Test Safari/Chrome mobile early (Sabtu) |
| Camera permission denied | Clear UI copy + fallback message |
| Jump detection accuracy | Tune threshold Sabtu sore, accept 80%+ accuracy |
| Integration delays | Keep sub-agents focused, modular components |

---

## Post-LIDM Roadmap

**V2 (Bulan 7-8):**
- Dashboard guru (AI Grouping, heatmap)
- Dashboard ortu (Weekly Family Report)
- 4 World lainnya (Running Valley, Throwing Mountain, Balance Island, Champion Arena)
- Adaptive Difficulty Engine

**V3 (Bulan 9-11):**
- School Analytics dashboard
- Learning Analytics backend
- Longitudinal tracking

**National Platform (2027+):**
- Multi-region deployment
- Big data Physical Literacy intelligence

---

## Notes

- **Live demo critical:** Juri LIDM harus lihat real-time pose tracking work
- **Mobile-first:** Anak pakai tablet/phone, bukan laptop
- **Gamification hooks user:** Pet unlock > complex analytics V1
- **AaL = differentiator:** Peserta didik refleksi sendiri (student agency)

---

**Next Action:** Spawn 4 sub-agents NOW. PRD = north star.
