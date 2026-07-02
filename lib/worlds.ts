export type Activity = {
  id: string;
  name: string;
  description: string;
  objective: string;
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

// ── Pulau Naga (Non-Lokomotor) ──
const PULAU_NAGA: Activity[] = [
  { id: 'meliuk', name: 'Meliuk', description: 'Gerakan meliuk tubuh ke kiri dan kanan', objective: 'Melatih fleksibilitas tulang belakang dan otot pinggang', badgeId: 'badge_meliuk', badgeName: 'Si Liuk Lincah', xpReward: 20, icon: '🌊' },
  { id: 'menekuk', name: 'Menekuk', description: 'Gerakan menekuk tangan dan kaki', objective: 'Menguatkan sendi lutut dan siku', badgeId: 'badge_menekuk', badgeName: 'Si Tekuk Tangkas', xpReward: 20, icon: '🦩' },
  { id: 'memutar', name: 'Memutar', description: 'Gerakan memutar tangan, kepala, dan pinggang', objective: 'Meningkatkan koordinasi dan fleksibilitas tubuh', badgeId: 'badge_memutar', badgeName: 'Si Putar Cepat', xpReward: 25, icon: '🌀' },
  { id: 'mengayun', name: 'Mengayun', description: 'Gerakan mengayunkan tangan dan kaki', objective: 'Melatih keseimbangan dan ritme gerak', badgeId: 'badge_mengayun', badgeName: 'Si Ayun Kuat', xpReward: 25, icon: '🎪' },
  { id: 'membungkuk', name: 'Membungkuk', description: 'Gerakan membungkuk dan meregang', objective: 'Memperpanjang otot punggung dan hamstring', badgeId: 'badge_membungkuk', badgeName: 'Si Bungkuk Fleksibel', xpReward: 30, icon: '🧘' },
  { id: 'mendorong', name: 'Mendorong & Menarik', description: 'Gerakan mendorong dan menarik benda', objective: 'Menguatkan otot lengan dan daya tahan', badgeId: 'badge_mendorong', badgeName: 'Si Dorong Hebat', xpReward: 30, icon: '💪' },
];

// ── Hutan Harimau (Lokomotor) ──
const HUTAN_HARIMAU: Activity[] = [
  { id: 'berjalan', name: 'Berjalan', description: 'Berjalan dengan ritme dan postur benar', objective: 'Membangun kebiasaan berjalan sehat dan postur tubuh', badgeId: 'badge_berjalan', badgeName: 'Si Jalan Pantang Lelah', xpReward: 20, icon: '🚶' },
  { id: 'berlari', name: 'Berlari', description: 'Berlari dengan teknik yang benar', objective: 'Meningkatkan daya tahan kardiovaskular', badgeId: 'badge_berlari', badgeName: 'Si Lari Kencang', xpReward: 20, icon: '🏃' },
  { id: 'melompat', name: 'Melompat', description: 'Melompat dengan satu atau dua kaki', objective: 'Melatih kekuatan otot kaki dan keseimbangan', badgeId: 'badge_melompat', badgeName: 'Si Lompat Jauh', xpReward: 25, icon: '🦘' },
  { id: 'meloncat', name: 'Meloncat', description: 'Meloncat naik dan turun', objective: 'Meningkatkan power dan koordinasi tubuh', badgeId: 'badge_meloncat', badgeName: 'Si Loncat Tinggi', xpReward: 25, icon: '🐰' },
  { id: 'mengejar', name: 'Mengejar', description: 'Mengejar objek dengan cepat', objective: 'Melatih kecepatan reaksi dan agility', badgeId: 'badge_mengejar', badgeName: 'Si Kejar Tangkas', xpReward: 30, icon: '🐆' },
  { id: 'menghindar', name: 'Menghindar', description: 'Menghindari rintangan', objective: 'Meningkatkan awareness dan koordinasi mata-kaki', badgeId: 'badge_menghindar', badgeName: 'Si Hindar Lincah', xpReward: 30, icon: '🛡️' },
];

// ── Gunung Elang (Manipulatif) ──
const GUNUNG_ELANG: Activity[] = [
  { id: 'melempar', name: 'Melempar', description: 'Melempar bola dengan akurasi', objective: 'Melatih koordinasi mata-tangan dan kekuatan lengan', badgeId: 'badge_melempar', badgeName: 'Si Lempar Jitu', xpReward: 20, icon: '🤾' },
  { id: 'menangkap', name: 'Menangkap', description: 'Menangkap bola dengan tepat', objective: 'Meningkatkan refleks dan koordinasi', badgeId: 'badge_menangkap', badgeName: 'Si Tangkap Mahir', xpReward: 20, icon: '🤲' },
  { id: 'menendang', name: 'Menendang', description: 'Menendang bola dengan kuat', objective: 'Menguatkan otot kaki dan akurasi', badgeId: 'badge_menendang', badgeName: 'Si Tendang Dasyat', xpReward: 25, icon: '⚽' },
  { id: 'memukul', name: 'Memukul', description: 'Memukul bola dengan alat', objective: 'Melatih koordinasi tangan-mata dan timing', badgeId: 'badge_memukul', badgeName: 'Si Pukul Hebat', xpReward: 25, icon: '🏏' },
  { id: 'menggiring', name: 'Menggiring', description: 'Menggiring bola sambil bergerak', objective: 'Meningkatkan kontrol bola dan kelincahan', badgeId: 'badge_menggiring', badgeName: 'Si Giring Cerdas', xpReward: 30, icon: '🏀' },
  { id: 'mengoper', name: 'Mengoper', description: 'Mengoper bola ke teman', objective: 'Melatih akurasi dan kerja sama tim', badgeId: 'badge_mengoper', badgeName: 'Si Oper Sempurna', xpReward: 30, icon: '🤝' },
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
