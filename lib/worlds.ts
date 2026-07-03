export type Activity = {
  id: string;
  name: string;
  description: string;
  objective: string;
  badgeId: string;
  badgeName: string;
  xpReward: number;
  icon: string;
  maxLevel: number;
  levelNames: string[];
};

export type World = {
  id: string;
  name: string;
  tagline: string;
  activities: Activity[];
  gradient: string;
  emoji: string;
};

// ── Pulau Naga (Non-Lokomotor) 🐉 ──
const PULAU_NAGA: Activity[] = [
  { id: 'meliuk', name: 'Meliuk', description: 'Gerakan meliuk tubuh ke kiri dan kanan', objective: 'Melatih fleksibilitas tulang belakang dan otot pinggang', badgeId: 'badge_meliuk', badgeName: 'Si Liuk Lincah', xpReward: 20, icon: '🌊', maxLevel: 5, levelNames: ['Angin Sepoi', 'Angin Dua Arah', 'Pohon Menari', 'Badai Ringan', 'Pohon Tangguh'] },
  { id: 'menekuk', name: 'Menekuk', description: 'Gerakan menekuk tangan dan kaki', objective: 'Menguatkan sendi lutut dan siku', badgeId: 'badge_menekuk', badgeName: 'Si Tekuk Tangkas', xpReward: 20, icon: '🦩', maxLevel: 5, levelNames: ['Robot Kaku', 'Robot Lentur', 'Robot Ganda', 'Robot Cepat', 'Robot Master'] },
  { id: 'memutar', name: 'Memutar', description: 'Gerakan memutar tangan, kepala, dan pinggang', objective: 'Meningkatkan koordinasi dan fleksibilitas tubuh', badgeId: 'badge_memutar', badgeName: 'Si Putar Cepat', xpReward: 25, icon: '🌀', maxLevel: 5, levelNames: ['Baling Pelan', 'Baling Lengan', 'Baling Pinggang', 'Baling Ganda', 'Baling Master'] },
  { id: 'mengayun', name: 'Mengayun', description: 'Gerakan mengayunkan tangan dan kaki', objective: 'Melatih keseimbangan dan ritme gerak', badgeId: 'badge_mengayun', badgeName: 'Si Ayun Kuat', xpReward: 25, icon: '🎪', maxLevel: 5, levelNames: ['Pemula', 'Ayunan', 'Ritmis', 'Harmonis', 'Si Ayun'] },
  { id: 'membungkuk', name: 'Membungkuk', description: 'Gerakan membungkuk dan meregang', objective: 'Memperpanjang otot punggung dan hamstring', badgeId: 'badge_membungkuk', badgeName: 'Si Bungkuk Fleksibel', xpReward: 30, icon: '🧘', maxLevel: 5, levelNames: ['Pemula', 'Meregang', 'Fleksibel', 'Pilates', 'Si Lentur'] },
  { id: 'mendorong', name: 'Mendorong & Menarik', description: 'Gerakan mendorong dan menarik benda', objective: 'Menguatkan otot lengan dan daya tahan', badgeId: 'badge_mendorong', badgeName: 'Si Dorong Hebat', xpReward: 30, icon: '💪', maxLevel: 5, levelNames: ['Pemula', 'Dorongan', 'Kuat', 'Power', 'Si Kuat'] },
  { id: 'keseimbangan', name: 'Keseimbangan', description: 'Menjaga keseimbangan tubuh dalam berbagai posisi', objective: 'Melatih stabilitas tubuh, fokus, dan koordinasi otot inti', badgeId: 'badge_keseimbangan', badgeName: 'Si Patung Tangguh', xpReward: 25, icon: '🧍', maxLevel: 5, levelNames: ['Patung Duduk', 'Patung Berdiri', 'Patung Satu Kaki', 'Patung Tangan Terbuka', 'Patung Master'] },
];

// ── Hutan Harimau (Lokomotor) 🐅 ──
const HUTAN_HARIMAU: Activity[] = [
  { id: 'berjalan', name: 'Berjalan', description: 'Berjalan dengan ritme dan postur benar', objective: 'Membangun kebiasaan berjalan sehat dan postur tubuh', badgeId: 'badge_berjalan', badgeName: 'Si Jalan Pantang Lelah', xpReward: 20, icon: '🚶', maxLevel: 5, levelNames: ['Pemula', 'Langkah', 'Ritmis', 'Atletis', 'Si Jalan'] },
  { id: 'berlari', name: 'Berlari', description: 'Berlari dengan teknik yang benar', objective: 'Meningkatkan daya tahan kardiovaskular', badgeId: 'badge_berlari', badgeName: 'Si Lari Kencang', xpReward: 20, icon: '🏃', maxLevel: 5, levelNames: ['Pemula', 'Lari', 'Sprint', 'Kilat', 'Si Cepat'] },
  { id: 'melompat', name: 'Melompat', description: 'Melompat dengan satu atau dua kaki', objective: 'Melatih kekuatan otot kaki dan keseimbangan', badgeId: 'badge_melompat', badgeName: 'Si Lompat Jauh', xpReward: 25, icon: '🦘', maxLevel: 5, levelNames: ['Pemula', 'Lompatan', 'Tinggi', 'Super', 'Si Terbang'] },
  { id: 'meloncat', name: 'Meloncat', description: 'Meloncat naik dan turun', objective: 'Meningkatkan power dan koordinasi tubuh', badgeId: 'badge_meloncat', badgeName: 'Si Loncat Tinggi', xpReward: 25, icon: '🐰', maxLevel: 5, levelNames: ['Pemula', 'Loncatan', 'Akrobatik', 'Powerful', 'Si Loncat'] },
  { id: 'mengejar', name: 'Mengejar', description: 'Mengejar objek dengan cepat', objective: 'Melatih kecepatan reaksi dan agility', badgeId: 'badge_mengejar', badgeName: 'Si Kejar Tangkas', xpReward: 30, icon: '🐆', maxLevel: 5, levelNames: ['Pemula', 'Kejaran', 'Cepat', 'Lincah', 'Si Kilat'] },
  { id: 'menghindar', name: 'Menghindar', description: 'Menghindari rintangan', objective: 'Meningkatkan awareness dan koordinasi mata-kaki', badgeId: 'badge_menghindar', badgeName: 'Si Hindar Lincah', xpReward: 30, icon: '🛡️', maxLevel: 5, levelNames: ['Pemula', 'Hindaran', 'Agile', 'Ninja', 'Si Bayangan'] },
];

// ── Gunung Elang (Manipulatif) 🦅 ──
const GUNUNG_ELANG: Activity[] = [
  { id: 'melempar', name: 'Melempar', description: 'Melempar bola dengan akurasi', objective: 'Melatih koordinasi mata-tangan dan kekuatan lengan', badgeId: 'badge_melempar', badgeName: 'Si Lempar Jitu', xpReward: 20, icon: '🤾', maxLevel: 5, levelNames: ['Pemula', 'Lemparan', 'Akurat', 'Presisi', 'Si Sniper'] },
  { id: 'menangkap', name: 'Menangkap', description: 'Menangkap bola dengan tepat', objective: 'Meningkatkan refleks dan koordinasi', badgeId: 'badge_menangkap', badgeName: 'Si Tangkap Mahir', xpReward: 20, icon: '🤲', maxLevel: 5, levelNames: ['Pemula', 'Tangkapan', 'Refleks', 'Master', 'Si Penjaga'] },
  { id: 'menendang', name: 'Menendang', description: 'Menendang bola dengan kuat', objective: 'Menguatkan otot kaki dan akurasi', badgeId: 'badge_menendang', badgeName: 'Si Tendang Dasyat', xpReward: 25, icon: '⚽', maxLevel: 5, levelNames: ['Pemula', 'Tendangan', 'Keras', 'Dasyat', 'Si Kaki Emas'] },
  { id: 'memukul', name: 'Memukul', description: 'Memukul bola dengan alat', objective: 'Melatih koordinasi tangan-mata dan timing', badgeId: 'badge_memukul', badgeName: 'Si Pukul Hebat', xpReward: 25, icon: '🏏', maxLevel: 5, levelNames: ['Pemula', 'Pukulan', 'Kuat', 'Power', 'Si Pukul'] },
  { id: 'menggiring', name: 'Menggiring', description: 'Menggiring bola sambil bergerak', objective: 'Meningkatkan kontrol bola dan kelincahan', badgeId: 'badge_menggiring', badgeName: 'Si Giring Cerdas', xpReward: 30, icon: '🏀', maxLevel: 5, levelNames: ['Pemula', 'Dribble', 'Kontrol', 'Master', 'Si Giring'] },
  { id: 'mengoper', name: 'Mengoper', description: 'Mengoper bola ke teman', objective: 'Melatih akurasi dan kerja sama tim', badgeId: 'badge_mengoper', badgeName: 'Si Oper Sempurna', xpReward: 30, icon: '🤝', maxLevel: 5, levelNames: ['Pemula', 'Operan', 'Akurat', 'Playmaker', 'Si Oper'] },
];

export const worlds: World[] = [
  { id: 'pulau-naga', name: 'Pulau Naga', tagline: 'Gerakkan tubuhmu seperti naga!', activities: PULAU_NAGA, gradient: 'gradient-grass', emoji: '🐉' },
  { id: 'hutan-harimau', name: 'Hutan Harimau', tagline: 'Bergerak cepat seperti harimau!', activities: HUTAN_HARIMAU, gradient: 'gradient-sky', emoji: '🐯' },
  { id: 'gunung-elang', name: 'Gunung Elang', tagline: 'Tangkap dan lempar seperti elang!', activities: GUNUNG_ELANG, gradient: 'gradient-magic', emoji: '🦅' },
];

export const world = worlds[0];
export const ALL_ACTIVITIES = worlds.flatMap((w) => w.activities);
export const ACTIVITIES = ALL_ACTIVITIES;
export const BADGE_LIST = ALL_ACTIVITIES.map((a) => ({ id: a.badgeId, name: a.badgeName, activityId: a.id, icon: a.icon }));

/** Activity level colors for UI */
export function getActivityLevelColor(level: number): string {
  if (level >= 5) return 'bg-purple-500';
  if (level >= 4) return 'bg-blue-500';
  if (level >= 3) return 'bg-green-500';
  if (level >= 2) return 'bg-amber-500';
  return 'bg-gray-400';
}

export function getActivityLevelStars(level: number): string {
  return '⭐'.repeat(level) + '☆'.repeat(Math.max(0, 5 - level));
}
