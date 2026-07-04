# Moveverse UI Design Guidelines

> Soft Neo-Brutalism / Chunky style — Implemented fully
> Last updated: 2026-07-02

---

## 1. Component Styling — ✅ Implemented

Cards and buttons use:
- **Thick rounded corners**: `rounded-[2rem]`, `rounded-3xl`, `rounded-2xl`
- **Solid drop-shadows** (not blurred): `shadow-pop` (4px 4px 0 primary), `shadow-soft` (3px 3px 0 with 0.18 opacity)
- **Inner borders**: `border-4 border-white` on world cards, `border-2` on activity cards
- **Hover effects**: `hover:scale-[1.02]`, `hover:-translate-y-1`, `hover:shadow-pop`

### Shadow Tokens (globals.css)
```css
--shadow-pop: 4px 4px 0 oklch(0.7 0.18 235), 0 12px 0 0 oklch(0.7 0.18 235 / 0.18), 0 20px 24px -6px oklch(0.5 0.1 260 / 0.18);
--shadow-soft: 3px 3px 0 oklch(0.5 0.1 260 / 0.18), 0 10px 24px -6px oklch(0.5 0.1 260 / 0.18);
```

---

## 2. Assets & Iconography — ✅ Implemented

### MOVA Mascot
- **File**: `public/mova-hero.png` — fox mascot
- **Usage**: Student dashboard (dancing), parent page (dancing with confetti), worlds page (floating), world detail (floating), assessment (both teacher/parent views), onboarding, dashboard loading
- **Container**: `w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-soft overflow-hidden`
- **Animation**: `animate-dance-slow` (hero), `animate-float` (worlds), `animate-bounce` (loading)

### Energy Crystals
- **File**: `public/crystals.png` — 5 colored crystals
- **Usage**: Student dashboard hero (beside MOVA), parent page world section header
- **Style**: `h-12 w-auto opacity-80 animate-float`

### World Map
- **File**: `public/world-map.jpg`
- **Usage**: Background for world cards (worlds page, parent page), section header background (student dashboard "Pilih Dunia")
- **Overlay**: `frosted-overlay` (linear gradient + backdrop-blur for readability)

### Activity Icons
- Still emoji-based (🐉 🐯 🦅 ) awaiting custom 3D/2D vector assets
- 18 activities each have an icon, name, description, objective, badgeId, badgeName, xpReward

---

## 3. Themed Worlds (Biomes) — ✅ Implemented

### 3 Worlds
| ID | Name | Animal | Gradient | Activities |
|---|---|---|---|---|
| `pulau-naga` | Pulau Naga 🐉 | Naga | `gradient-sky` | 6 Non-Lokomotor |
| `hutan-harimau` | Hutan Harimau 🐯 | Harimau | `gradient-grass` | 6 Lokomotor |
| `gunung-elang` | Gunung Elang 🦅 | Elang | `gradient-sunset` | 6 Manipulatif |

### Card Design
```
relative rounded-[2rem] overflow-hidden text-white shadow-pop border-4 border-white
├── absolute inset-0 bg-cover bg-center (world-map.jpg)
├── absolute inset-0 world.gradient opacity-70
├── absolute inset-0 frosted-overlay
└── relative p-6 flex flex-col justify-end min-h-[320px]
    ├── emoji (top left, animate-float)
    ├── badge count (top right, frosted glass pill)
    ├── world name + tagline
    ├── progress bar (white on dark bg)
    └── 3-col activity grid (backdrop-blur-sm)
```

---

## 4. Typography — ✅ Implemented

```css
/* Headings */ font-family: "Fredoka", "Baloo 2", system-ui, sans-serif;
/* Body */     font-family: "Nunito", "Baloo 2", system-ui, sans-serif;
```

- Headings: `font-extrabold` using Fredoka
- Body: `font-bold` using Nunito
- XP/Level numbers: `font-extrabold` with gradient text backgrounds

### Font Sources (loaded in layout.tsx)
- Fredoka (Google Fonts, 400-700)
- Nunito (Google Fonts, 400-700)
- Baloo 2 (Google Fonts, fallback)

---

## 5. Background — ✅ Implemented

```css
body {
  background:
    /* Cloud puffs */ radial-gradient(circle 18px at 10% 15%, ...),
    /* Geometric dots */ radial-gradient(circle 3px at 15% 45%, ...),
    /* Base gradient */ var(--gradient-sky);
  background-attachment: fixed;
}
```

- Subtle cloud puffs (radial gradients at 4 positions)
- Geometric dots (radial gradients at 5 positions)
- Base gradient (sky blue)
- All low-opacity for subtle effect

---

## 6. Animations — ✅ Implemented (12+)

### Entrance
| Class | Keyframes | Used On |
|---|---|---|
| `animate-pop-in` | scale 0.5→1.1→1 + opacity 0→1 | Hero cards, entrance elements |
| `animate-slide-up` | translateY(30px)→(0) + opacity 0→1 | World sections, stat cards (staggered delay) |

### Idle
| Class | Keyframes | Used On |
|---|---|---|
| `animate-float` | translateY -12px (gentle) | MOVA (worlds), emojis, crystals |
| `animate-wobble` | rotate -2deg→2deg | Activity icons, initial load |
| `animate-dance-slow` | translateX + rotate (shimmy) | MOVA in hero sections |
| `animate-sway` | translateX -6px→6px | Decorative elements |
| `animate-sparkle` | opacity + scale twinkle | Badge collection |
| `animate-bounce-sm` | translateY -4px | Activity icons on hover (group-hover) |

### Interactive
| Class | Keyframes | Used On |
|---|---|---|
| `animate-bounce-soft` | translateY -8px | Loading states |
| `animate-wiggle` | rotate -5deg→5deg | Badge-capped warning banner |
| `animate-dance` | Single shimmy | MOVA entrance |
| `animate-celebrate` | scale 1→1.3→1 + rotate | Achievement moments (triggered state) |

### Decorative
| Class | Keyframes | Used On |
|---|---|---|
| `animate-confetti-long` | translateY -20px→120px + rotate 480deg | Floating confetti particles in heroes |
| `animate-shimmer` | background-position -200%→200% | Stat card shine overlay |
| `animate-pulse-glow` | box-shadow 0→12px→0 | Level progress bar at key thresholds |

### Staggered Timing
```tsx
// Stat cards: 0.1s delay each
style={{ animationDelay: `${i * 0.1}s` }}

// World sections: 0.15s delay each
style={{ animationDelay: `${i * 0.15}s` }}

// World cards (worlds page): 0.12s delay each
style={{ animationDelay: `${i * 0.12}s` }}
```

### Hover Effects
```css
/* World/activity cards */
hover:scale-[1.02] hover:-translate-y-1 hover:shadow-pop

/* Activity icons (group-hover) */
group-hover:animate-bounce-sm
```

---

## 7. Gradient Tokens

| Class | Usage |
|---|---|
| `gradient-sky` | Level stat, Pulau Naga |
| `gradient-sunset` | XP stat, Gunung Elang, accent buttons |
| `gradient-grass` | Badge stat, Hutan Harimau, success |
| `gradient-magic` | Coin stat, purple accent |
| `gradient-gold` | Achievement, special badges |

---

## 8. Spacing & Layout

- Max content width: `max-w-7xl` (pages), `max-w-5xl` (student dashboard)
- Card padding: `p-6` (standard), `p-5` (compact), `p-4` (stat cards)
- Grid: `grid-cols-2 sm:grid-cols-4` (stats), `md:grid-cols-3 gap-6` (worlds), `sm:grid-cols-2 lg:grid-cols-3` (activities)
- Section spacing: `space-y-6` (page), `gap-4` (grid), `mb-4` (section header)
