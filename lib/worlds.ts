export type Activity = {
  id: string;
  name: string;
  description: string;
  badgeId: string;
  badgeName: string;
  xpReward: number;
  icon: string;
};

export type World = {
  id: string;
  name: string;
  tagline: string;
  activities: Activity[];
  gradient: string;
  emoji: string;
};

// ── Non-Lokomotor ──
const NON_LOKOMOTOR: Activity[] = [
  { id: 'meliuk', name: 'Meliuk', description: 'Gerakan meliuk tubuh ke kiri dan kanan', badgeId: 'badge_meliuk', badgeName: 'Si Liuk Lincah', xpReward: 20, icon: '🌊' },
  { id: 'menekuk', name: 'Menekuk', description: 'Gerakan menekuk tangan dan kaki', badgeId: 'badge_menekuk', badgeName: 'Si Tekuk Tangkas', xpReward: 20, icon: '🦩' },
  { id: 'memutar', name: 'Memutar', description: 'Gerakan memutar tangan, kepala, dan pinggang', badgeId: 'badge_memutar', badgeName: 'Si Putar Cepat', xpReward: 25, icon: '🌀' },
  { id: 'mengayun', name: 'Mengayun', description: 'Gerakan mengayunkan tangan dan kaki', badgeId: 'badge_mengayun', badgeName: 'Si Ayun Kuat', xpReward: 25, icon: '🎪' },
  { id: 'membungkuk', name: 'Membungkuk', description: 'Gerakan membungkuk dan meregang', badgeId: 'badge_membungkuk', badgeName: 'Si Bungkuk Fleksibel', xpReward: 30, icon: '🧘' },
  { id: 'mendorong', name: 'Mendorong & Menarik', description: 'Gerakan mendorong dan menarik benda', badgeId: 'badge_mendorong', badgeName: 'Si Dorong Hebat', xpReward: 30, icon: '💪' },
];

// ── Lokomotor ──
const LOKOMOTOR: Activity[] = [
  { id: 'berjalan', name: 'Berjalan', description: 'Gerakan berjalan dengan ritme dan postur benar', badgeId: 'badge_berjalan', badgeName: 'Si Jalan Pantang Lelah', xpReward: 20, icon: '🚶' },
  { id: 'berlari', name: 'Berlari', description: 'Gerakan berlari dengan teknik yang benar', badgeId: 'badge_berlari', badgeName: 'Si Lari Kencang', xpReward: 20, icon: '🏃' },
  { id: 'melompat', name: 'Melompat', description: 'Gerakan melompat dengan satu atau dua kaki', badgeId: 'badge_melompat', badgeName: 'Si Lompat Jauh', xpReward: 25, icon: '🦘' },
  { id: 'meloncat', name: 'Meloncat', description: 'Gerakan meloncat naik dan turun', badgeId: 'badge_meloncat', badgeName: 'Si Loncat Tinggi', xpReward: 25, icon: '🐰' },
  { id: 'mengejar', name: 'Mengejar', description: 'Gerakan mengejar objek dengan cepat', badgeId: 'badge_mengejar', badgeName: 'Si Kejar Tangkas', xpReward: 30, icon: '🐆' },
  { id: 'menghindar', name: 'Menghindar', description: 'Gerakan menghindari rintangan', badgeId: 'badge_menghindar', badgeName: 'Si Hindar Lincah', xpReward: 30, icon: '🛡️' },
];

// ── Manipulatif ──
const MANIPULATIF: Activity[] = [
  { id: 'melempar', name: 'Melempar', description: 'Gerakan melempar bola dengan akurasi', badgeId: 'badge_melempar', badgeName: 'Si Lempar Jitu', xpReward: 20, icon: '🤾' },
  { id: 'menangkap', name: 'Menangkap', description: 'Gerakan menangkap bola dengan tepat', badgeId: 'badge_menangkap', badgeName: 'Si Tangkap Mahir', xpReward: 20, icon: '🤲' },
  { id: 'menendang', name: 'Menendang', description: 'Gerakan menendang bola dengan kuat', badgeId: 'badge_menendang', badgeName: 'Si Tendang Dasyat', xpReward: 25, icon: '⚽' },
  { id: 'memukul', name: 'Memukul', description: 'Gerakan memukul bola dengan alat', badgeId: 'badge_memukul', badgeName: 'Si Pukul Hebat', xpReward: 25, icon: '🏏' },
  { id: 'menggiring', name: 'Menggiring', description: 'Gerakan menggiring bola sambil bergerak', badgeId: 'badge_menggiring', badgeName: 'Si Giring Cerdas', xpReward: 30, icon: '🏀' },
  { id: 'mengoper', name: 'Mengoper', description: 'Gerakan mengoper bola ke teman', badgeId: 'badge_mengoper', badgeName: 'Si Oper Sempurna', xpReward: 30, icon: '🤝' },
];

export const worlds: World[] = [
  {
    id: 'non-lokomotor',
    name: 'Non-Lokomotor',
    tagline: 'Gerakan tubuh tanpa berpindah tempat',
    activities: NON_LOKOMOTOR,
    gradient: 'gradient-grass',
    emoji: '🌟',
  },
  {
    id: 'lokomotor',
    name: 'Lokomotor',
    tagline: 'Gerakan berpindah tempat',
    activities: LOKOMOTOR,
    gradient: 'gradient-sky',
    emoji: '🚀',
  },
  {
    id: 'manipulatif',
    name: 'Manipulatif',
    tagline: 'Gerakan mengontrol objek',
    activities: MANIPULATIF,
    gradient: 'gradient-magic',
    emoji: '🎯',
  },
];

/** Backward compat — first world (non-lokomotor) */
export const world = worlds[0];

export const ALL_ACTIVITIES = worlds.flatMap((w) => w.activities);

/** Backward compat */
export const ACTIVITIES = ALL_ACTIVITIES;

export const BADGE_LIST = ALL_ACTIVITIES.map((a) => ({
  id: a.badgeId,
  name: a.badgeName,
  activityId: a.id,
  icon: a.icon,
}));
