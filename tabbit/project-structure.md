# Moveverse — Project Structure

> Last updated: 2026-07-02 (v2)

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Backend:** Convex (realtime DB + serverless functions)
- **Auth:** Clerk
- **Styling:** Tailwind CSS v4 + custom CSS variables (Soft Neo-Brutalism)
- **Charts:** Recharts
- **Pose Tracking:** MediaPipe (via webcam)
- **Language:** Bahasa Indonesia

---

## Directory Tree (core files only)

```
moveverse/
├── app/
│   ├── layout.tsx                     # Root layout (Clerk + Convex providers)
│   ├── page.tsx                       # Landing / splash page
│   ├── globals.css                    # Design tokens, fonts, 12+ animations, utilities
│   │
│   ├── (auth)/                        # Auth routes (Clerk)
│   │   ├── layout.tsx
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   └── (main)/                        # Authenticated routes
│       ├── layout.tsx                 # Main shell (Header + sidebar)
│       ├── onboarding/page.tsx        # Step wizard: name → avatar → role → class
│       ├── profile/page.tsx           # User profile, badges, avatar display
│       │
│       ├── dashboard/
│       │   ├── layout.tsx             # Dashboard wrapper (loading state w/ MOVA)
│       │   ├── page.tsx               # Role-based redirect
│       │   ├── student/page.tsx       # Student dashboard: 3 worlds, level cap, side quests, confetti
│       │   └── stats/page.tsx         # Personal charts & skill breakdown
│       │
│       ├── worlds/
│       │   ├── page.tsx               # 3 world cards (biome BG + frosted overlay, MOVA mascot)
│       │   └── [worldId]/page.tsx     # Dynamic world detail — 6 aktivitas, badge collection, MOVA
│       │
│       ├── assessment/page.tsx        # AI Pose Coach (Suspense boundary). Role-based: teacher→siswa, parent→child, student→self. Shows learning objective from query params.
│       │
│       ├── teacher/
│       │   ├── page.tsx               # CRUD kelas, student table, RPP section, parent contact, uncompleted activities
│       │   └── leaderboard/page.tsx   # Class leaderboard (sort by XP/Level)
│       │
│       ├── parent/
│       │   ├── page.tsx               # Parent dashboard: MOVA hero, confetti, world cards (match worlds page), radar chart, sport recs, side quest CRUD, shimmer stats
│       │   ├── child/page.tsx         # Detailed child view
│       │   └── leaderboard/page.tsx   # Parent leaderboard view
│       │
│       ├── school/page.tsx            # Admin school dashboard
│       │
│       └── test-camera/page.tsx       # Dev tool: camera + MediaPipe pose test
│
├── components/
│   ├── Header.tsx                     # Nav bar (role-based, labels in Indonesian)
│   ├── AvatarPicker.tsx               # 20 animal avatar options
│   ├── ConvexClientProvider.tsx       # Convex provider wrapper
│   └── ui/progress.tsx               # UI primitives
│
├── convex/
│   ├── schema.ts                      # DB schema (9 tables: users, classes, schools, quests, movements, daily_quests, physical_literacy, side_quests)
│   ├── users.ts                       # getUser, getChildren, linkChild, createUser, updateXP (cap 10), earnBadge, getLeaderboardByClass, getUsersByClass
│   ├── classes.ts                     # createClass, updateClass, deleteClass, getClassesBySchool
│   ├── quests.ts                      # getUserQuests, getActiveQuest, createQuest, updateProgress
│   ├── movements.ts                   # logMovement, getQuestMovements, getUserMovements, getMovementStats
│   ├── dailyQuests.ts                 # getToday, getByDate, getWeek, createOrUpdate, updateTaskProgress
│   ├── sideQuests.ts                  # Side quest CRUD: getByChild, getByChildActive, getByParent, getByParentAndChild, create, markComplete, markCompleteByParent, remove
│   ├── schools.ts                     # School queries
│   ├── parent.ts                      # Parent-specific queries
│   ├── physical_literacy.ts           # PL score queries
│   ├── seed.ts                        # seedAll, clearAll, seedMovementSamples
│   └── auth.config.ts                 # Clerk auth config
│
├── lib/
│   ├── worlds.ts                      # 3 worlds (Pulau Naga, Hutan Harimau, Gunung Elang), 18 activities, getLevelInfo(), ALL_ACTIVITIES, BADGE_LIST
│   └── fms-scoring.ts                 # Movement scoring logic
│
├── hooks/
│   ├── useMediaPipePose.ts            # MediaPipe pose detection hook
│   └── useJumpDetector.ts             # Jump detection logic
│
├── public/
│   ├── mova-hero.png                  # MOVA fox mascot (used across all pages)
│   ├── crystals.png                   # 5 energy crystals (student dashboard + parent page)
│   └── world-map.jpg                  # World biome background (worlds page, parent page, student dashboard)
│
└── tabbit/                            # Spec docs & session notes
    ├── dari tabbittxt.txt
    ├── page revision.txt              # Live revision checklist
    ├── PRD_MoveVerse_Update_v2.md
    ├── redesignui.md                  # UI design guidelines
    ├── session_20260702_spec.md       # Session spec document
    ├── tabbit2.txt
    └── project-structure.md           # ← this file
```

---

## Routes

| Path | Role | Description |
|---|---|---|
| `/` | Public | Landing page / splash |
| `/sign-in` | Public | Clerk sign-in |
| `/sign-up` | Public | Clerk sign-up |
| `/onboarding` | Auth | Step wizard: name → avatar picker → role → class |
| `/profile` | Auth | User profile, avatar, badges |
| `/dashboard` | Auth | Role-based redirect (student→/student, parent→/parent, teacher→/teacher, admin→/school) |
| `/dashboard/student` | Student | 3 worlds, level cap bar, side quests (real Convex), badge collection, confetti + MOVA hero |
| `/dashboard/stats` | Student | Personal charts, skill breakdown, game stats |
| `/worlds` | Student | 3 world cards (Pulau Naga, Hutan Harimau, Gunung Elang), progress per world |
| `/worlds/[worldId]` | Student | Dynamic lookup from `worlds[]`, 6 activity cards, learning objectives, badge collection, MOVA |
| `/assessment` | All | AI Pose Coach — teacher selects student, parent selects child, student records self. Shows learning objective from query params. Suspense boundary for useSearchParams |
| `/teacher` | Teacher | CRUD classes, student table, RPP documents section, parent phone contact, uncompleted activities |
| `/teacher/leaderboard` | Teacher | Class leaderboard (sort by XP/Level) |
| `/parent` | Parent | Child overview, world map header, world cards (match worlds page), radar chart, sport recs, side quest CRUD, shimmer stats, confetti + MOVA |
| `/parent/child` | Parent | Detailed child view |
| `/parent/leaderboard` | Parent | Child's class leaderboard |
| `/school` | Admin | School analytics, class management |
| `/test-camera` | Dev | Camera + MediaPipe pose test tool |

---

## Features

### Core
- **3 Worlds** — Pulau Naga (Non-Lokomotor), Hutan Harimau (Lokomotor), Gunung Elang (Manipulatif), 18 activities total
- **Badge System** — 18 badges (one per activity), stored in `users.badges[]`
- **XP & Level** — Level capped at 10, badge-based level cap (getLevelInfo: 0 badges = L0, 18 badges = L10, every ~2 badges = +1 level)
- **Avatar Picker** — 20 animals (fox, cat, dog, rabbit, bear, etc.)
- **Daily Quests** — `daily_quests` table with per-day task tracking and XP rewards
- **Side Quests** — Parent-assigned tasks at home, persisted in `side_quests`, XP awarded on completion

### Role-Based
- **Student** — Dashboard (3 worlds, side quests, level cap, confetti), worlds, activities, AI Coach (self-recording)
- **Teacher** — CRUD classes, student detail (uncompleted activities, parent phone), RPP documents, AI Coach (monitor students)
- **Parent** — Child overview (real children from getChildren), world cards match worlds page, sport recs (dynamic from motorik stats), side quest CRUD, AI Coach analysis-only (no camera)
- **Admin** — School-wide analytics, class management

### AI Pose Coach
- Camera feed with MediaPipe skeleton overlay
- Real-time pose tracking with score feedback
- Role-based views: teacher selects class→student, parent selects child (analysis only), student records self
- MOVA mascot feedback with personalized tips
- Learning objective displayed when navigated from world detail (query params: activity, objective, world)

### UI/UX (Soft Neo-Brutalism/Chunky)
- Chunky solid drop-shadows (shadow-pop, shadow-soft)
- Inner borders on cards (border-4 border-white)
- Frosted glass overlay on world biome cards (frosted-overlay)
- Background: subtle cloud puffs + geometric dots via CSS radial gradients
- Fonts: Fredoka (headings) + Nunito (body) + Baloo 2 (accent)
- All text in Bahasa Indonesia
- MOVA mascot (mova-hero.png) w/ floating/dancing animation
- Crystals decorative (crystals.png)
- World map background (world-map.jpg) for themed sections
- 12+ CSS animations: float, wobble, pop-in, bounce, bounce-sm, confetti-fall, confetti-fall-long, pulse-glow, wiggle, slide-up, dance, sway, shimmer, celebrate, sparkle

### Level Cap System
- `getLevelInfo(badges, xp)` in `lib/worlds.ts`
- Badge-based cap: 0→L0, 1→L1, 2-3→L2, ..., 16-17→L9, 18→L10
- XP determines raw level (100 XP/level), badge count caps it
- Amber warning banner when badge-capped

---

## Convex Schema (9 tables)

| Table | Purpose |
|---|---|
| `users` | Profile, XP, level, badges, role, classId, schoolId, avatar, childIds, parentIds |
| `classes` | Class name, grade, schoolId |
| `schools` | School name, slug, address |
| `quests` | Daily quests per user (type, progress, XP) |
| `movements` | Movement session logs (activityId, score, duration) |
| `daily_quests` | Per-day task tracking (tasks array, totalXpEarned) |
| `physical_literacy` | PL scores (balance, coordination, agility, flexibility, strength) |
| `side_quests` | Parent-assigned tasks (parentId, childId, title, icon, xpReward, completed, createdAt) |

## Key CSS Animations

| Class | Usage |
|---|---|
| `animate-float` | MOVA mascot, world emojis |
| `animate-dance-slow` | MOVA in student/parent hero |
| `animate-pop-in` | Hero cards, entrance |
| `animate-slide-up` | World sections, stat cards (staggered) |
| `animate-shimmer` | Stat card shine overlay |
| `animate-bounce-sm` | Activity icon on hover (group-hover) |
| `animate-confetti-long` | Confetti particles in heroes |
| `animate-wiggle` | Badge-capped warning banner |
| `animate-pulse-glow` | Level progress bar |
