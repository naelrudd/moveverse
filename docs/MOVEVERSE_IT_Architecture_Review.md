# IT Architecture Review for MOVEVERSE

---

## Status Update (Juli 2026)

**Arsitektur sudah berubah total.** Project awalnya dirancang sebagai Python/Streamlit prototype, sekarang sudah jadi production web app:

| Komponen | Awal (Proposal) | Aktual (Production) |
|---|---|---|
| Frontend | Flutter Web / Streamlit | **Next.js 16** (React 19) |
| Backend | FastAPI + PostgreSQL | **Convex** (BaaS, serverless DB + functions) |
| Auth | JWT + AES | **Clerk** (managed auth) |
| Computer Vision | Python + MediaPipe | **MediaPipe Pose via CDN** (browser, no Python) |
| AI Model | TensorFlow/PyTorch | **Rule-based scoring** (fms-scoring.ts) — ML belum diimplementasi |
| Deployment | AWS/GCP | **Vercel** (frontend) + **Convex Cloud** (backend) |
| Mobile | Flutter APK | **Next.js PWA** (responsif mobile browser) |
| Storage | SQLite / Parquet | **Convex DB** (real-time sync built-in) |
| Domain | - | **moveverse.my.id** |

---

## Analisis Awal dari Sisi Arsitektur

**Multi-layer architecture-nya make sense** sih. User → Application → AI → Computer Vision → Database → Infrastructure. Ini modular dan scalable. Tapi ada beberapa pertanyaan teknis yang muncul:

**Computer Vision Layer** — Pake MediaPipe + MoveNet + OpenCV. Ini combo yang oke buat real-time pose estimation di browser/mobile. Tapi pertanyaannya: **real-time processing-nya di mana?** Edge (device) atau cloud? Kalo di device, performa smartphone entry-level bisa jadi bottleneck. Kalo di cloud, latency + bandwidth jadi concern—apalagi targetnya SD di Indonesia, banyak yang koneksinya nggak stabil.

**AI Layer** — TensorFlow/PyTorch. Ini generik banget. Yang lebih penting: **model-nya train dari scratch atau fine-tune pre-trained?** Dataset-nya dari mana? Kalo gerak anak SD Indonesia, gerakannya beda sama dataset Western (COCO, etc.). Cultural context + body proportion beda. Ini bisa jadi accuracy issue.

**Backend FastAPI + PostgreSQL** — ~~Solid choice.~~ **SUDAH DIGANTI ke Convex**. Convex lebih cocok untuk use case ini: real-time sync, serverless functions, auth integration, dan zero DevOps untuk single-developer.

---

## ~~Yang Agak "Hmm..."" dari Sisi Tech Stack~~ (OUTDATED — referensi sebelumnya)

| Komponen | Pilihan Awal | Komentar |
|---|---|---|
| Dashboard | Flutter Web | Sudah diganti ke Next.js — lebih mature, ecosystem lebih luas |
| Cloud | AWS/Google Cloud | Sudah diganti ke Vercel + Convex Cloud — gratis tier cukup untuk pilot |
| Security | JWT + AES | Sudah diganti ke Clerk — managed auth, SOC2 compliant |

**Flutter Web untuk dashboard** — ~~ini pilihan yang nggak mainstream~~. **TIDAK DIGUNAKAN.** Next.js dipilih karena:
- Ecosystem React jauh lebih luas (component libraries, tools)
- Vercel deployment instant
- Convex client SDK mature
- Mobile responsive via Tailwind CSS (tidak perlu Flutter Web)

---

## Real-World Implementation Concerns

### 1. Device & Infrastructure Reality

Targetnya SD di Indonesia. Realitanya:
- Banyak SD nggak punya perangkat dedicated (tablet/PC)
- Guru PJOK biasanya nggak bawa laptop ke lapangan
- Koneksi internet di lapangan (outdoor) bisa jelek

**Solusi aktual:** Responsive web app yang jalan di smartphone browser. Camera diakses via WebRTC. MediaPipe Pose jalan on-device via WASM/JS — **tidak perlu upload video ke cloud**. Hanya keypoints JSON (super kecil, 5-20 KB per sesi) yang di-sync ke Convex.

### 2. Computer Vision di Lapangan

Pose estimation outdoor itu beda sama indoor:
- Lighting variable (matahari, bayangan)
- Background clutter (lapangan, tembok, pohon)
- Multiple kids gerak bareng (occlusion)

**Solusi aktual:** Single-person mode (1 siswa di frame). MediaPipe Pose via CDN. Skeleton overlay real-time. Scoring berbasis rule-based thresholds (dikonfirmasi ahli PJOK). Fallback: kalau confidence rendah, MOVA muncul saran "posisikan tubuh lebih jelas".

### 3. Data Pipeline & Latency

Flow aktual:
> Camera (WebRTC) → MediaPipe Pose (on-device, WASM) → Keypoint extraction → Rule-based scoring → Real-time UI feedback → Convex sync (hanya metadata)

**Edge-first by default:** Semua processing di browser/device. Tidak ada video upload. Convex hanya menyimpan hasil analisis (skor, level, badges, XP).

### 4. AI Model Specifics

Proposal mention "AI Analytics Engine, Recommendation Engine, Prediction Engine". 

**Status aktual:**
- **Recommendation Engine**: Rule-based — level thresholds per aktivitas
- **Prediction Engine**: Belum diimplementasi
- **Movement Intelligence**: FMS scoring rules (calculateAngle, calculateReps, calculateHoldTime, calculateMovementQuality)

---

## Implementasi Aktual

### Tech Stack Production

| Layer | Teknologi | Keterangan |
|---|---|---|
| Frontend | Next.js 16 + React 19 | App Router, Server Components |
| Styling | Tailwind CSS + CSS Variables | Design system dengan HSL tokens |
| State Management | Convex real-time queries | Auto-sync tanpa manual refresh |
| Backend | Convex Functions | Queries, mutations, actions |
| Auth | Clerk | Multi-role: student, teacher, parent, admin |
| Database | Convex DB | Real-time sync, indexed queries |
| Computer Vision | MediaPipe Pose (CDN) | On-device via WASM, single-person mode |
| FMS Scoring | lib/fms-scoring.ts | Rule-based: angle, rep, hold, quality |
| Live Coach | hooks/useLiveCoachEngine.ts | Real-time pose engine, portable ke Flutter |
| Gamification | XP, levels, coins, badges, quests | Full gamification system |
| Deployment | Vercel (frontend) + Convex Cloud | Zero-config, auto-deploy |
| Domain | moveverse.my.id | Production |

### Architecture Diagram

```
[Student Device]                    [Convex Cloud]              [Teacher/Parent]
     |                                    |                          |
 Camera (WebRTC) ──→ MediaPipe Pose (WASM) ──→ Keypoints          |
     |                    |                                    |
     v                    v                                    |
 LivePoseCoach    useLiveCoachEngine                      Convex Queries
     |                    |                          (real-time subscription)
     v                    v                                    |
 RealTimeMetrics   fms-scoring.ts                        Dashboard UI
     |                    |                                    |
     v                    v                                    |
 MOVA Bubble      logMovementSession ──→ Convex DB ──→ History Charts
                              |                          Badge Awards
                              v                          Daily Quests
                         XP + Coins Update
```

### Key Implementation Files

| File | Fungsi | Baris |
|---|---|---|
| `app/(main)/assessment/page.tsx` | Live Coach UI (split-view, fullscreen) | ~700 |
| `hooks/useLiveCoachEngine.ts` | Core real-time pose engine | ~300 |
| `components/coach/LivePoseCoach.tsx` | Camera + skeleton + controls | ~150 |
| `components/coach/MovementSelector.tsx` | Activity + level selector (swipe) | ~100 |
| `components/coach/RealTimeMetrics.tsx` | Live metrics panel | ~100 |
| `components/coach/ScoreHistoryChart.tsx` | Score history SVG chart | ~130 |
| `lib/fms-scoring.ts` | Movement detection + scoring | ~250 |
| `convex/liveCoach.ts` | Mutations: log session, get history | ~200 |
| `convex/schema.ts` | DB schema (users, movements, etc.) | ~120 |

### Movement Types (FMS Indonesia)

| # | Gerakan | Level 1-5 |
|---|---|---|
| 1 | Menekuk (Squat) | jongkok → push-up position → handstand |
| 2 | Meliuk (Lateral Flexion) | berdiri tegak → dengan beban → dinamis |
| 3 | Memutar (Trunk Rotation) | posisi dasar → lengan lurus → speed |
| 4 | Keseimbangan (Single Leg Stance) | 10 detik → 30 detik → eyes closed |

### Gamification System

| Elemen | Implementasi |
|---|---|
| XP | Skor × 0.5 + reps × 2 + level × 3 |
| Level | 100 XP threshold (Lv1-5) |
| Coins | xpGain / 10 (integer) |
| Streak | Hitung hari aktif berturut-turut |
| Badges | first_session, perfect_score, excellent_form, rep_master, max_level, all_rounder |
| Daily Quest | Quest harian otomatis berdasarkan aktivitas |
| Needs Tutor | Trigger otomatis jika score < 40 |

---

## Yang Sudah Dikerjakan vs Belum

### ✅ Sudah Implementasi

- [x] Real-time pose detection di browser (MediaPipe)
- [x] 4 gerakan FMS Indonesia (menekuk, meliuk, memutar, keseimbangan)
- [x] Leveling system 5 level per gerakan
- [x] Live scoring + feedback real-time
- [x] MOVA bubble feedback (text + emoji)
- [x] Split-view UI (kamera + panel)
- [x] Fullscreen toggle
- [x] Keyboard shortcuts (SPACE/ESC)
- [x] Gesture swipe untuk ganti aktivitas
- [x] Score history chart (pure SVG)
- [x] Achievement badges (otomatis)
- [x] Export CSV
- [x] Daily quest integration
- [x] Session history list
- [x] Calibration thresholds (teacher)
- [x] Live monitoring (teacher/parent)
- [x] Responsive mobile
- [x] Audio toggle
- [x] Confetti animation saat selesai
- [x] XP + coins otomatis
- [x] Streak tracking
- [x] Multi-role auth (student/teacher/parent/admin)
- [x] Design system (glass cards, gradients, animations)

### 🔲 Belum / Future

- [ ] On-device recording + offline-first sync
- [ ] ML-based scoring (Random Forest / Neural Net)
- [ ] Synthetic data generation untuk training
- [ ] Multi-kid tracking (occlusion handling)
- [ ] Flutter mobile APK
- [ ] Leaderboard kelas
- [ ] Challenge mode
- [ ] Parent dashboard analytics
- [ ] School-wide analytics (ClickHouse / BigQuery)
- [ ] Anti-cheat mechanism
- [ ] PDF export
- [ ] Push notifications

---

## Pertanyaan Teknis yang Perlu Dijawab (Updated)

1. ~~On-device vs Cloud CV processing~~ → **SUDAH DIJAWAB: On-device via WASM. Hanya metadata yang di-sync.**
2. **Offline capability** → Next step: Service Worker + IndexedDB cache
3. ~~Model training pipeline~~ → **Belum relevan**: masih rule-based. ML nanti setelah pilot data.
4. **Cost estimation** → Vercel free tier + Convex free tier = **gratis untuk pilot**. Scale ke 10k sekolah: ~$200-500/bulan (Convex pro + Vercel pro).
5. ~~Open source strategy~~ → Belum diputuskan.

---

## Rekomendasi untuk Phase Selanjutnya

### Phase 1: Validasi (sekarang)
- [x] MVP web app di production (moveverse.my.id)
- [ ] Uji coba di 3-5 sekolah pilot
- [ ] Kumpulkan feedback guru + siswa
- [ ] Validasi scoring dengan ahli PJOK

### Phase 2: Enhancement (3-6 bulan)
- [ ] ML scoring model (training dengan data pilot)
- [ ] Offline-first capability
- [ ] Parent analytics dashboard
- [ ] School admin panel

### Phase 3: Scale (6-12 bulan)
- [ ] Flutter mobile APK
- [ ] Multi-kid tracking
- [ ] School-wide analytics
- [ ] Integration dengan sistem Dinas Pendidikan

---

*MOVEVERSE punya potensi ngubah PJOK di Indonesia dari "main bola doang" jadi data-driven physical literacy ecosystem. Tech stack sekarang sudah production-ready. Yang dibutuhkan selanjutnya: validasi di lapangan, bukan lebih banyak code.*
