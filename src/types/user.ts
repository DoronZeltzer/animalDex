export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  totalAnimals: number;
  landCount: number;
  seaCount: number;
  airCount: number;
  achievements: string[];
  friends: string[];
  pendingRequests: string[];
  sentRequests: string[];
  goldLevel: number;
  lastCompletedWeekId?: string;
  createdAt: any;
}

export interface Friend {
  uid: string;
  displayName: string;
  photoURL: string;
  totalAnimals: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  totalAnimals: number;
  weeklyCaptures: number;
  rank: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: any;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_animal', title: 'First Discovery', description: 'Photograph your first animal', icon: '🌟' },
  { id: 'land_10', title: 'Land Explorer', description: 'Collect 10 land animals', icon: '🦁' },
  { id: 'sea_10', title: 'Sea Explorer', description: 'Collect 10 sea animals', icon: '🐠' },
  { id: 'air_10', title: 'Sky Explorer', description: 'Collect 10 air animals', icon: '🦅' },
  { id: 'total_25', title: 'Animal Enthusiast', description: 'Collect 25 unique animals', icon: '🏆' },
  { id: 'total_50', title: 'Wildlife Expert', description: 'Collect 50 unique animals', icon: '🌍' },
  { id: 'rare_find', title: 'Rare Find', description: 'Photograph a rare animal', icon: '💎' },
];
