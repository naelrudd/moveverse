# MoveVerse v2 — Session Spec (2 Juli 2026)

**Dari session:** `session-20260702_165528_b77c04`
**Status:** Siap implementasi

---

## Keputusan Final

### Roles
- **Tetap**: student, parent, teacher, admin
- **TIDAK ada** payment/subscription — ini untuk sekolah, bukan SaaS

### Target User
- Anak SD

---

## Task List

### 1. Update `lib/worlds.ts`
Ganti 5 world lama jadi **1 World Non-Lokomotor** dengan 6 aktivitas:
1. Meliuk (movement/bending)
2. Menekuk (bending)
3. Memutar (rotating)
4. Mengayun (swinging)
5. Membungkuk (hunching)
6. Mendorong/Menarik (push/pull)

### 2. Update Convex Schema
- Hapus field `pets` dari users table
- Tambah badge tracking per aktivitas (6 badge total)
- Role tetap: student, parent, teacher, admin

### 3. Copy Asset dari Lovable
Dari `lovable-project-c136ee78/src/assets/`:
- `mova-hero.png` — fox mascot
- `crystals.png` — 5 energy crystals
- `world-map.jpg` — world map

### 4. Update Leveling
- Max level 10 (bukan unlimited)
- XP dari aktivitas non-lokomotor
- Formula: `Math.floor(xp / 100) + 1`, cap di 10

### 5. Daily Quest Sederhana
- Simple task list untuk anak-anak
- Setiap task = XP reward
- Child-friendly UI

### 6. Teacher Page — CRUD Kelas
- Guru bisa monitor **beberapa kelas** (bukan cuma 1)
- UI untuk **pilih kelas** mana yang dilihat
- Bisa **add kelas baru**
- Bisa **CRUD** kelas (create, read, update, delete)
- **Filter**: hanya Kelas 1 dan Kelas 2 yang aktif (kelas lain di-hide)

### 7. Leaderboard — Fix Sorting
- Fix urutan leaderboard yang salah
- Leaderboard **per kelas**
- Leaderboard school ada di navbar (untuk admin)

### 8. AI Coach Guru
- Guru bisa **pilih murid** dari daftar
- **Start AI Coach** per murid (1 per 1)
- Guru bisa **rekam/monitor** murid satu per satu
- Route: `/assessment` (dengan role check teacher)

### 9. AI Coach Orang Tua
- Orang tua **pilih anak** berdasarkan child ID
- Monitor perkembangan anak
- Route: `/assessment` (dengan role check parent)

### 10. Parent Page — Worlds → Aktivitas
- Pindahkan "Worlds" nav jadi "Aktivitas"
- Route tetap sama, cuma label berubah
- Sync dengan data aktivitas terbaru

### 11. Sinkronisasi Semua Halaman
- Pastikan semua halaman pakai data terbaru
- Nav updated sesuai role
- Dashboard siswa: shortcut ke aktivitas

---

## UI Design Notes (dari `redesignui.md`)

- **Style**: Soft Neo-Brutalism/Chunky — tactile cards, inner borders, thick rounded corners, solid drop shadows
- **Assets**: Custom 3D bubbly assets atau thick-stroked 2D vector (bukan emoji default)
- **World Cards**: Full background image biome + dark overlay untuk readability
- **Typography**: Fredoka One/Baloo untuk headings, Nunito/Quicksand untuk body
- **Background**: Subtle pattern (clouds/geometric) pakai CSS gradients

---

## File References

```
app/(main)/
  layout.tsx                       # Main layout
  dashboard/page.tsx               # Router by role
  dashboard/student/page.tsx       # Student dashboard
  dashboard/stats/page.tsx         # Stats
  parent/page.tsx                  # Parent dashboard → rename "Aktivitas"
  parent/child/page.tsx            # Child activity monitor
  parent/leaderboard/page.tsx      # Leaderboard
  teacher/page.tsx                 # Teacher CRUD kelas
  teacher/leaderboard/page.tsx     # Teacher leaderboard
  worlds/page.tsx                  # World selector
  worlds/[worldId]/page.tsx        # World detail + activities
  assessment/page.tsx              # AI Coach (all roles)
  onboarding/page.tsx              # Profile setup
  profile/page.tsx                 # User profile

components/
  Header.tsx                       # Nav by role (navByRole object)

convex/
  schema.ts                        # DB schema
  users.ts                         # User queries/mutations
  schools.ts                       # School queries
  classes.ts                       # Class queries

lib/
  worlds.ts                        # World/activity data
  utils.ts                         # Utilities
```

---

## Convex Schema (Current vs Updated)

### Current `users` table fields:
```
clerkId, name, nis, phone, avatar, role, schoolId, classId,
childIds, parentIds, xp, coins, level, pets (HAPUS), createdAt, updatedAt
```

### Updated `users` table fields:
```
clerkId, name, nis, phone, avatar, role, schoolId, classId,
childIds, parentIds, xp, coins, level, badges (TAMBAH), createdAt, updatedAt
```

`badges` = `string[]` — array of earned badge IDs (6 aktivitas = 6 badge)

---

## Daily Quest Format

```json
{
  "id": "daily-2026-07-02",
  "tasks": [
    { "id": "meliuk", "label": "Meliuk 5 kali", "xp": 10, "completed": false },
    { "id": "menekuk", "label": "Menekuk 5 kali", "xp": 10, "completed": false },
    { "id": "memutar", "label": "Memutar 5 kali", "xp": 10, "completed": false }
  ],
  "totalXpAvailable": 30
}
```

---

## Implementation Order

1. `lib/worlds.ts` — data dulu
2. Convex schema update — hapus pets, tambah badges
3. Copy assets
4. Leveling update
5. Daily quest
6. Teacher CRUD kelas
7. Leaderboard fix
8. AI Coach guru
9. AI Coach ortu
10. Parent page rename
11. Sync semua
