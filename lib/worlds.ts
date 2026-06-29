export type World = {
  id: string;
  number: number;
  name: string;
  theme: string;
  tagline: string;
  activities: string[];
  boss: string;
  skills: string[];
  rewards: { badge: string; coins: number; crystal: string };
  gradient: string;
  emoji: string;
  unlocked: boolean;
  progress: number;
};

export const worlds: World[] = [
  {
    id: "jumping-jungle",
    number: 1,
    name: "Jumping Jungle",
    theme: "Tropical Forest",
    tagline: "Leap through vines and waterfalls!",
    activities: ["Jump Challenge", "Landing Challenge", "Balance Bridge"],
    boss: "Giant Frog Jump",
    skills: ["Jumping", "Landing", "Balance"],
    rewards: { badge: "Forest Explorer", coins: 100, crystal: "Movement Crystal" },
    gradient: "gradient-grass",
    emoji: "🌴",
    unlocked: true,
    progress: 100,
  },
  {
    id: "running-valley",
    number: 2,
    name: "Running Valley",
    theme: "Mountain Valley",
    tagline: "Race the wind through alpine trails!",
    activities: ["Sprint Run", "Zig-Zag Run", "Obstacle Run"],
    boss: "Speed Hawk Race",
    skills: ["Speed", "Agility", "Running"],
    rewards: { badge: "Speed Runner", coins: 150, crystal: "Speed Crystal" },
    gradient: "gradient-sky",
    emoji: "⛰️",
    unlocked: true,
    progress: 60,
  },
  {
    id: "throwing-mountain",
    number: 3,
    name: "Throwing Mountain",
    theme: "Volcano Sports Arena",
    tagline: "Aim true at the volcano arena!",
    activities: ["Throw Challenge", "Catch Challenge", "Precision Challenge"],
    boss: "Dragon Throw Challenge",
    skills: ["Throwing", "Catching", "Coordination"],
    rewards: { badge: "Accuracy Master", coins: 200, crystal: "Confidence Crystal" },
    gradient: "gradient-sunset",
    emoji: "🌋",
    unlocked: true,
    progress: 25,
  },
  {
    id: "balance-island",
    number: 4,
    name: "Balance Island",
    theme: "Floating Sky Island",
    tagline: "Walk the rainbow bridges in the sky!",
    activities: ["Beam Walk", "One-Leg Stand", "Dynamic Balance"],
    boss: "Sky Bridge Challenge",
    skills: ["Stability", "Balance", "Body Control"],
    rewards: { badge: "Balance Hero", coins: 250, crystal: "Balance Crystal" },
    gradient: "gradient-magic",
    emoji: "🏝️",
    unlocked: false,
    progress: 0,
  },
  {
    id: "champion-arena",
    number: 5,
    name: "Champion Arena",
    theme: "Futuristic Mega Stadium",
    tagline: "Become a Future Athlete!",
    activities: ["All movement skills combined"],
    boss: "Future Athlete Tournament",
    skills: ["All-Around Champion"],
    rewards: { badge: "Champion Trophy", coins: 500, crystal: "Champion Crystal" },
    gradient: "gradient-gold",
    emoji: "🏟️",
    unlocked: false,
    progress: 0,
  },
];
