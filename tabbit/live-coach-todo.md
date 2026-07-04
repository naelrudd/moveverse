# Live AI Coach — Implementation TODO

Status: MVP DONE (2026-07-04)
Referensi: baca ini kalau mulai bias

---

## ✅ DONE

### 1. Core Scoring & Detection (lib/fms-scoring.ts)
- [x] calculateAngle(a, b, c) — pure angle calculator
- [x] detectMenekuk — kneeAngle, elbowAngle, depth
- [x] detectMeliuk — lateralAngle, leanPercent
- [x] detectMemutar — rotationAngle, shoulderWidth
- [x] detectKeseimbangan — swayAmount, isSingleLeg, stability
- [x] MOVEMENT_LEVELS — 4 movements × 5 levels each
- [x] countReps — state transition counter
- [x] getMovementFeedback — score → feedback text
- [x] movementToPhysicalLiteracy — mapping ke radar chart

### 2. Hook (hooks/useLiveCoachEngine.ts)
- [x] Continuous MediaPipe Pose per frame
- [x] 4 movement detection branches
- [x] Hold timer (seconds per level requirement)
- [x] Rep counter
- [x] Score history
- [x] Start / Pause / Resume / Stop actions
- [x] Fullscreen toggle
- [x] Session complete callback

### 3. Components
- [x] LivePoseCoach — camera + canvas overlay + controls + metrics
- [x] MovementSelector — activity tabs + level pills
- [x] RealTimeMetrics — score gauge + hold timer + reps + MOVA bubble

### 4. Page Refactor (assessment/page.tsx)
- [x] Split view: 60% camera + 40% panel
- [x] Fullscreen toggle (button + ESC)
- [x] Session complete screen (XP + stats + MOVA message)
- [x] Role-based: student/teacher/parent
- [x] Activity selector + level selector

### 5. Convex (convex/liveCoach.ts)
- [x] logMovementSession — insert + update physical_literacy + XP
- [x] getLiveStats — query for per-activity stats

---

## 🔲 TODO (Belum Dikerjakan)

### Prioritas Tinggi
- [x] Real-time subscription untuk guru/orang tua monitor live
- [x] Kalibrasi sederhana: tombol "Adjust Threshold" untuk guru
- [x] Simpan threshold preferences ke Convex user doc
- [x] Keyboard shortcut: SPACE=start/stop, ESC=fullscreen exit

### Prioritas Sedang
- [x] Loading skeleton saat camera permission (bukan spinner)
- [x] Mobile responsive: split view otomatis stack di HP
- [ ] Gesture-based controls (swipe untuk next movement)
- [x] Audio feedback toggle (sfx untuk rep complete)
- [x] Radar chart mini di session complete

### Prioritas Rendah
- [ ] Voice feedback (text-to-speech untuk MOVA)
- [ ] Pet unlock animation (butuh asset tambahan)
- [ ] Share session result ke social media
- [ ] History session list (lihat semua sesi sebelumnya)
- [ ] Export session data sebagai CSV/PDF

### Flutter Migration Notes
- [ ] Ganti navigator.mediaDevices → CameraController + MediaPipe plugin
- [ ] Ganti useMediaPipePose → onResults callback dari Flutter plugin
- [ ] Ganti canvas drawing → Flutter CustomPainter
- [ ] Ganti requestAnimationFrame → Timer.periodic atau Stream
- [ ] Test di Android/iOS dengan MediaPipe Pose

### Convex Next Steps
- [ ] Tambah field `level` ke movements table (saat ini pakai activityId string)
- [ ] Tambah table `movement_sessions` untuk detailed session log
- [x] Tambah real-time subscription untuk live monitoring
- [ ] Tambah daily quest integration (otomatis update daily_quests)

---

## 📋 Architecture Notes

- Hook logic = pure functions (portable ke Flutter)
- Detection functions di lib/fms-scoring.ts = reusable
- MediaPipe load via CDN script injection (not npm)
- Skeleton drawn on canvas overlay (not SVG)
- Score = 0-100 per frame, averaged over session
- Rep = state transition (below threshold → above threshold)
- Hold = continuous time above threshold

## 🎯 Movement Thresholds (per games.md)

### Menekuk
- Lv1: kneeAngle < 90°, hold 3s, minScore 60
- Lv2: kneeAngle < 120° + elbowAngle < 90°, hold 5s, minScore 70
- Lv3: squat penuh 3x, hold 5s, minScore 80
- Lv4: squat cepat 5x, hold 3s, minScore 85
- Lv5: squat jump 5x, hold 2s, minScore 90

### Meliuk
- Lv1: 15° lateral, hold 3s, minScore 60
- Lv2: 30° lateral, hold 3s, minScore 70
- Lv3: 45° + tangan terbuka, hold 4s, minScore 80
- Lv4: cepat bergantian 5x, hold 3s, minScore 85
- Lv5: ritmis ikuti irama, hold 5s, minScore 90

### Memutar
- Lv1: kepala pelan, hold 3s, minScore 60
- Lv2: lengan 180°, hold 4s, minScore 70
- Lv3: pinggang 90°, hold 4s, minScore 80
- Lv4: kombinasi 3x, hold 3s, minScore 85
- Lv5: cepat 5x tanpa langkah, hold 2s, minScore 90

### Keseimbangan
- Lv1: berdiri 5s, minScore 60
- Lv2: berdiri 10s, minScore 70
- Lv3: satu kaki 5s, minScore 80
- Lv4: satu kaki 10s, minScore 85
- Lv5: satu kaki tangan terbuka 10s, minScore 90
