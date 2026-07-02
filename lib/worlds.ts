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

export const ACTIVITIES: Activity[] = [
  {
    id: 'meliuk',
    name: 'Meliuk',
    description: 'Gerakan meliuk tubuh ke kiri dan kanan',
    badgeId: 'badge_meliuk',
    badgeName: 'Si Liuk Lincah',
    xpReward: 20,
    icon: '🌊',
  },
  {
    id: 'menekuk',
    name: 'Menekuk',
    description: 'Gerakan menekuk tangan dan kaki',
    badgeId: 'badge_menekuk',
    badgeName: 'Si Tekuk Tangkas',
    xpReward: 20,
    icon: '🦩',
  },
  {
    id: 'memutar',
    name: 'Memutar',
    description: 'Gerakan memutar tangan, kepala, dan pinggang',
    badgeId: 'badge_memutar',
    badgeName: 'Si Putar Cepat',
    xpReward: 25,
    icon: '🌀',
  },
  {
    id: 'mengayun',
    name: 'Mengayun',
    description: 'Gerakan mengayunkan tangan dan kaki',
    badgeId: 'badge_mengayun',
    badgeName: 'Si Ayun Kuat',
    xpReward: 25,
    icon: '🎪',
  },
  {
    id: 'membungkuk',
    name: 'Membungkuk',
    description: 'Gerakan membungkuk dan meregang',
    badgeId: 'badge_membungkuk',
    badgeName: 'Si Bungkuk Fleksibel',
    xpReward: 30,
    icon: '🧘',
  },
  {
    id: 'mendorong',
    name: 'Mendorong & Menarik',
    description: 'Gerakan mendorong dan menarik benda',
    badgeId: 'badge_mendorong',
    badgeName: 'Si Dorong Hebat',
    xpReward: 30,
    icon: '💪',
  },
];

export const world: World = {
  id: 'non-lokomotor',
  name: 'Dunia Gerak Non-Lokomotor',
  tagline: 'Kuasai 6 gerakan dasar tubuhmu!',
  activities: ACTIVITIES,
  gradient: 'gradient-grass',
  emoji: '🌟',
};

export const BADGE_LIST = ACTIVITIES.map((a) => ({
  id: a.badgeId,
  name: a.badgeName,
  activityId: a.id,
  icon: a.icon,
}));
